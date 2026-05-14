'use client';

import { useState, useEffect } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useUser } from '@/contexts/UserContext';
import {
  ArrowLeft, CreditCard, Lock, Truck, Shield,
  CheckCircle, AlertCircle, Package, Home,
  ShoppingBag, Sparkles, ChevronRight, User,
  MapPin, Phone, Mail,
} from 'lucide-react';
import Metadata from '@/components/Metadata';
import { generateCheckoutMetadata } from '@/utils/metadata';

/* ── Reusable field ─────────────────────────────────────────────── */
function Field({ label, icon: Icon, required, children }) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
        {label}{required && <span className="text-primary-500 ml-0.5">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" />
        )}
        {children}
      </div>
    </div>
  );
}

const inputCls = (hasIcon) =>
  `w-full ${hasIcon ? 'pl-10' : 'pl-4'} pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all placeholder-gray-300`;

/* ── Step indicator ─────────────────────────────────────────────── */
function Stepper({ active }) {
  const steps = ['Shipping', 'Payment', 'Confirm'];
  return (
    <div className="flex items-center gap-0">
      {steps.map((label, i) => {
        const n = i + 1;
        const done = active > n;
        const current = active === n;
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                done    ? 'bg-primary-600 text-white' :
                current ? 'bg-primary-600 text-white ring-4 ring-primary-100' :
                          'bg-gray-100 text-gray-400'
              }`}>
                {done ? <CheckCircle className="w-4 h-4" /> : n}
              </div>
              <span className={`text-[10px] font-bold mt-1 ${current || done ? 'text-primary-600' : 'text-gray-400'}`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-0.5 w-12 sm:w-20 mb-4 mx-1 rounded-full transition-all ${active > n ? 'bg-primary-600' : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Main component ─────────────────────────────────────────────── */
export default function CheckoutPage() {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { user, isAuthenticated, loading: authLoading } = useUser();
  const router = useRouter();

  const [activeStep, setActiveStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    address: '', city: '', state: '', pincode: '',
    country: 'India', paymentMethod: 'cod',
    saveInfo: true, newsletter: false,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);

  const subtotal = getCartTotal();
  const shipping = 0;
  const tax = subtotal * 0.18;
  const total = subtotal + shipping + tax;

  const set = (k, v) => setFormData(p => ({ ...p, [k]: v }));

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      localStorage.setItem('redirectAfterLogin', '/checkout');
      router.push('/auth/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated && user) {
      const parts = user.name?.split(' ') || [];
      const def = user.addresses?.find(a => a.isDefault) || {};
      setFormData(p => ({
        ...p,
        firstName: parts[0] || '',
        lastName:  parts.slice(1).join(' ') || '',
        email:   user.email   || '',
        phone:   user.phone   || '',
        address: def.address  || '',
        city:    def.city     || '',
        state:   def.state    || '',
        pincode: def.pincode  || '',
      }));
    }
  }, [isAuthenticated, user]);

  const buildPayload = () => ({
    userId: isAuthenticated ? user.id : null,
    customer: {
      name:    `${formData.firstName} ${formData.lastName}`,
      email:   formData.email,
      phone:   formData.phone,
      address: formData.address,
      city:    formData.city,
      state:   formData.state,
      zip:     formData.pincode,
      notes:   formData.newsletter ? 'Subscribed to newsletter' : '',
    },
    items: cartItems.map(item => ({
      productId:       item.productId,
      name:            item.name,
      slug:            item.slug || item.product?.slug,
      price:           item.price,
      quantity:        item.quantity,
      selectedOptions: item.variant,
      image:           item.product?.mainImages?.[0] || null,
    })),
    total, subtotal, shipping, tax,
    paymentMethod: formData.paymentMethod === 'online' ? 'card' : 'cod',
  });

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setIsProcessing(true);
    try {
      const api = (await import('@/services/api')).default;
      const assertOrder = (o) => {
        if (!o?._id) throw new Error(o?.message || o?.error || 'Order creation failed.');
        return o;
      };

      if (formData.paymentMethod === 'cod') {
        const order = assertOrder(await api.createOrder(buildPayload()));
        setOrderDetails(order); setOrderSuccess(true); setActiveStep(3); clearCart();
        return;
      }

      const rzpRes = await api.createRazorpayOrder(total);
      if (!rzpRes?.razorpayOrderId) throw new Error(rzpRes?.message || 'Failed to initiate payment.');

      await new Promise((resolve, reject) => {
        if (!window.Razorpay) { reject(new Error('Razorpay SDK not loaded.')); return; }
        const rzp = new window.Razorpay({
          key:         process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount:      rzpRes.amount,
          currency:    rzpRes.currency || 'INR',
          name:        'HomelineTeam',
          description: 'Order Payment',
          order_id:    rzpRes.razorpayOrderId,
          prefill:     { name: `${formData.firstName} ${formData.lastName}`, email: formData.email, contact: formData.phone },
          theme:       { color: '#dc2626' },
          handler: async (resp) => {
            try {
              const order = assertOrder(await api.verifyRazorpayPayment({
                ...buildPayload(),
                razorpayOrderId:    resp.razorpay_order_id,
                razorpayPaymentId:  resp.razorpay_payment_id,
                razorpaySignature:  resp.razorpay_signature,
              }));
              setOrderDetails(order); setOrderSuccess(true); setActiveStep(3); clearCart();
              resolve();
            } catch (err) { reject(err); }
          },
          modal: { ondismiss: () => reject(new Error('Payment cancelled')) },
        });
        rzp.on('payment.failed', r => reject(new Error(r.error?.description || 'Payment failed')));
        rzp.open();
      });
    } catch (err) {
      if (err.message !== 'Payment cancelled') alert(err.message || 'Order failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  /* ── Loading ─────────────────────────────────────────────────── */
  if (authLoading) return (
    <>
      <Metadata {...generateCheckoutMetadata()} />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm font-medium">Loading…</p>
        </div>
      </div>
    </>
  );

  /* ── Not authenticated ───────────────────────────────────────── */
  if (!isAuthenticated) return (
    <>
      <Metadata {...generateCheckoutMetadata()} />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-amber-500" />
          </div>
          <h1 className="text-xl font-extrabold text-gray-900 mb-2">Login Required</h1>
          <p className="text-gray-500 text-sm mb-6">Sign in to place your order. Your cart will be saved.</p>
          <div className="flex gap-3">
            <Link href="/auth/login"    className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors cursor-pointer text-center">Sign In</Link>
            <Link href="/auth/register" className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold py-2.5 rounded-xl text-sm transition-colors cursor-pointer text-center">Register</Link>
          </div>
        </div>
      </div>
    </>
  );

  /* ── Order success ───────────────────────────────────────────── */
  if (orderSuccess && orderDetails) {
    const orderNum   = orderDetails.orderNumber || orderDetails._id?.toString().slice(-8).toUpperCase();
    const isPaid     = orderDetails.paymentStatus === 'paid';
    const isCOD      = orderDetails.paymentMethod === 'cod';
    const orderTotal = typeof orderDetails.total === 'number'
      ? orderDetails.total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : '—';

    return (
      <>
        <Metadata {...generateCheckoutMetadata()} />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">

              {/* Success header */}
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 px-8 pt-10 pb-12 text-center">
                <div className="relative mx-auto w-16 h-16 mb-4">
                  <div className="absolute inset-0 bg-white/25 rounded-full animate-ping" />
                  <div className="relative w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <CheckCircle className="w-9 h-9 text-green-500" strokeWidth={1.5} />
                  </div>
                </div>
                <h1 className="text-2xl font-extrabold text-white mb-1">Order Confirmed!</h1>
                <p className="text-green-100 text-sm">Thank you, {formData.firstName}! We&apos;ll get it ready for you.</p>
              </div>

              <div className="px-6 pb-6 -mt-5 space-y-4">
                {/* Order number */}
                <div className="bg-white rounded-2xl shadow-md border border-gray-100 px-4 py-3 flex items-center gap-3">
                  <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Package className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Order Number</p>
                    <p className="text-sm font-extrabold text-gray-900">{orderNum ? `#${orderNum}` : 'Processing…'}</p>
                  </div>
                </div>

                {/* Info grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                    <p className="text-[10px] text-green-600 font-bold uppercase tracking-wide mb-1">Total</p>
                    <p className="text-lg font-extrabold text-green-700">₹{orderTotal}</p>
                    <p className="text-[10px] text-green-500 mt-0.5">Incl. GST</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide mb-1">Payment</p>
                    <p className="text-sm font-bold text-gray-900">{isCOD ? 'Cash on Delivery' : 'Online'}</p>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold mt-1 px-2 py-0.5 rounded-full ${isPaid ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isPaid ? 'bg-green-500' : 'bg-amber-500'}`} />
                      {isPaid ? 'Paid' : 'Pay on Delivery'}
                    </span>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide mb-1">Deliver To</p>
                    <p className="text-sm font-semibold text-gray-900">{formData.city}, {formData.state}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{formData.pincode}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide mb-1">Est. Delivery</p>
                    <p className="text-sm font-semibold text-gray-900">3–5 Business Days</p>
                    <p className="text-[10px] text-green-600 font-medium mt-0.5">Free Shipping</p>
                  </div>
                </div>

                {/* Next steps */}
                <div className="bg-primary-50 rounded-xl p-4 border border-primary-100">
                  <h3 className="font-bold text-primary-900 mb-3 flex items-center gap-2 text-sm">
                    <Sparkles className="w-3.5 h-3.5 text-primary-600" /> What happens next?
                  </h3>
                  <div className="space-y-2">
                    {['Confirmation email sent to your inbox', 'Our team will carefully pack your order', 'You\'ll receive a tracking link once shipped'].map((s, i) => (
                      <div key={i} className="flex items-center gap-2.5">
                        <div className="w-5 h-5 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-[10px] font-bold text-primary-700">{i + 1}</span>
                        </div>
                        <p className="text-xs text-primary-800">{s}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2.5 pt-1">
                  {isAuthenticated && (
                    <Link href="/my-orders" className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-xl font-bold text-sm transition-colors cursor-pointer">
                      <Package className="w-4 h-4" /> Track My Order
                    </Link>
                  )}
                  <div className="grid grid-cols-2 gap-2.5">
                    <Link href="/"           className="flex items-center justify-center gap-1.5 border border-gray-200 hover:bg-gray-50 text-gray-700 py-2.5 rounded-xl font-semibold text-sm transition-colors cursor-pointer">
                      <Home className="w-3.5 h-3.5" /> Home
                    </Link>
                    <Link href="/collections" className="flex items-center justify-center gap-1.5 border border-gray-200 hover:bg-gray-50 text-gray-700 py-2.5 rounded-xl font-semibold text-sm transition-colors cursor-pointer">
                      <ShoppingBag className="w-3.5 h-3.5" /> Shop More
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust strip */}
            <div className="mt-5 flex items-center justify-center gap-5 text-xs text-gray-400">
              <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> Secure</span>
              <span className="text-gray-300">·</span>
              <span className="flex items-center gap-1.5"><Truck className="w-3.5 h-3.5" /> Free Delivery</span>
              <span className="text-gray-300">·</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" /> 30-day Returns</span>
            </div>
          </div>
        </div>
      </>
    );
  }

  /* ── Empty cart ──────────────────────────────────────────────── */
  if (cartItems.length === 0) return (
    <>
      <Metadata {...generateCheckoutMetadata()} />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8 text-primary-300" />
          </div>
          <h1 className="text-xl font-extrabold text-gray-900 mb-2">Your cart is empty</h1>
          <p className="text-gray-500 text-sm mb-6">Add products to your cart before checking out.</p>
          <Link href="/cart" className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors cursor-pointer inline-block">Go to Cart</Link>
        </div>
      </div>
    </>
  );

  /* ── Shipping form ───────────────────────────────────────────── */
  const ShippingForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="First Name" icon={User} required>
          <input type="text" value={formData.firstName} onChange={e => set('firstName', e.target.value)}
            placeholder="First name" className={inputCls(true)} required />
        </Field>
        <Field label="Last Name" icon={User} required>
          <input type="text" value={formData.lastName} onChange={e => set('lastName', e.target.value)}
            placeholder="Last name" className={inputCls(true)} required />
        </Field>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Email" icon={Mail} required>
          <input type="email" value={formData.email} onChange={e => set('email', e.target.value)}
            placeholder="you@example.com" className={inputCls(true)} required />
        </Field>
        <Field label="Phone" icon={Phone} required>
          <input type="tel" value={formData.phone} onChange={e => set('phone', e.target.value)}
            placeholder="+91 98765 43210" className={inputCls(true)} required />
        </Field>
      </div>
      <Field label="Street Address" icon={MapPin} required>
        <input type="text" value={formData.address} onChange={e => set('address', e.target.value)}
          placeholder="House/Flat, Street, Area" className={inputCls(true)} required />
      </Field>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label="City" required>
          <input type="text" value={formData.city} onChange={e => set('city', e.target.value)}
            placeholder="Mumbai" className={inputCls(false)} required />
        </Field>
        <Field label="State" required>
          <input type="text" value={formData.state} onChange={e => set('state', e.target.value)}
            placeholder="Maharashtra" className={inputCls(false)} required />
        </Field>
        <Field label="PIN Code" required>
          <input type="text" value={formData.pincode} onChange={e => set('pincode', e.target.value)}
            placeholder="400001" className={inputCls(false)} required />
        </Field>
      </div>
      <label className="flex items-center gap-3 cursor-pointer select-none">
        <input type="checkbox" checked={formData.saveInfo} onChange={e => set('saveInfo', e.target.checked)}
          className="w-4 h-4 accent-primary-600 rounded" />
        <span className="text-sm text-gray-600 font-medium">Save this information for next time</span>
      </label>
    </div>
  );

  /* ── Payment form ────────────────────────────────────────────── */
  const PaymentForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* COD */}
        <label className={`relative flex flex-col p-4 border-2 rounded-2xl cursor-pointer transition-all ${
          formData.paymentMethod === 'cod'
            ? 'border-primary-500 bg-primary-50 shadow-sm'
            : 'border-gray-200 bg-white hover:border-gray-300'
        }`}>
          <input type="radio" name="payment" value="cod" checked={formData.paymentMethod === 'cod'}
            onChange={e => set('paymentMethod', e.target.value)} className="sr-only" />
          <div className={`absolute top-3.5 right-3.5 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
            formData.paymentMethod === 'cod' ? 'border-primary-600 bg-primary-600' : 'border-gray-300'
          }`}>
            {formData.paymentMethod === 'cod' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
          </div>
          <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p className="font-bold text-gray-900 text-sm mb-0.5">Cash on Delivery</p>
          <p className="text-xs text-gray-500">Pay when your order arrives</p>
        </label>

        {/* Online */}
        <label className={`relative flex flex-col p-4 border-2 rounded-2xl cursor-pointer transition-all ${
          formData.paymentMethod === 'online'
            ? 'border-primary-500 bg-primary-50 shadow-sm'
            : 'border-gray-200 bg-white hover:border-gray-300'
        }`}>
          <input type="radio" name="payment" value="online" checked={formData.paymentMethod === 'online'}
            onChange={e => set('paymentMethod', e.target.value)} className="sr-only" />
          <div className={`absolute top-3.5 right-3.5 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
            formData.paymentMethod === 'online' ? 'border-primary-600 bg-primary-600' : 'border-gray-300'
          }`}>
            {formData.paymentMethod === 'online' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
          </div>
          <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center mb-3">
            <CreditCard className="w-5 h-5 text-primary-600" />
          </div>
          <p className="font-bold text-gray-900 text-sm mb-0.5">Online Payment</p>
          <p className="text-xs text-gray-500">Card, UPI, Net Banking & more</p>
          <div className="flex gap-1.5 mt-2.5">
            {['UPI', 'VISA', 'MC', 'RuPay'].map(b => (
              <span key={b} className="text-[10px] font-bold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-md">{b}</span>
            ))}
          </div>
        </label>
      </div>

      {/* Info box */}
      {formData.paymentMethod === 'cod' ? (
        <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-green-800">No advance payment needed</p>
            <p className="text-xs text-green-700 mt-0.5">Keep <strong>₹{total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</strong> ready when your order arrives.</p>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3 p-4 bg-primary-50 border border-primary-100 rounded-xl">
          <Lock className="w-4 h-4 text-primary-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-primary-900">Secure Razorpay Checkout</p>
            <p className="text-xs text-primary-700 mt-0.5">Click <strong>Place Order</strong> to open the Razorpay window. 256-bit encrypted.</p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2.5 p-3.5 bg-gray-50 border border-gray-100 rounded-xl">
        <Shield className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <p className="text-xs text-gray-500">Your payment is <span className="font-semibold text-gray-700">100% secure</span>. We never store card or UPI details.</p>
      </div>
    </div>
  );

  /* ── Main checkout layout ────────────────────────────────────── */
  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <Metadata {...generateCheckoutMetadata()} />

      <div className="min-h-screen bg-gray-50">
        {/* Breadcrumb bar */}
        <div className="bg-white border-b border-gray-100">
          <div className="container-custom py-3 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Link href="/" className="hover:text-primary-600 transition-colors">Home</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <Link href="/cart" className="hover:text-primary-600 transition-colors">Cart</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-gray-900 font-medium">Checkout</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-green-700 font-semibold bg-green-50 border border-green-100 px-3 py-1.5 rounded-full">
              <Lock className="w-3 h-3" /> SSL Secured
            </div>
          </div>
        </div>

        <div className="container-custom py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

            {/* ── Left: form ── */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">

                {/* Stepper */}
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-center">
                  <Stepper active={activeStep} />
                </div>

                {/* Form area */}
                <div className="p-6 sm:p-8">
                  {activeStep === 1 && (
                    <>
                      <div className="mb-6">
                        <h2 className="text-lg font-extrabold text-gray-900">Shipping Information</h2>
                        <p className="text-sm text-gray-500 mt-0.5">Enter your delivery details to continue</p>
                      </div>
                      <ShippingForm />
                      <button
                        onClick={() => setActiveStep(2)}
                        className="mt-6 w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 rounded-xl transition-colors cursor-pointer text-sm flex items-center justify-center gap-2"
                      >
                        Continue to Payment <ChevronRight className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  {activeStep === 2 && (
                    <>
                      <div className="mb-6">
                        <h2 className="text-lg font-extrabold text-gray-900">Payment Method</h2>
                        <p className="text-sm text-gray-500 mt-0.5">Choose how you&apos;d like to pay</p>
                      </div>
                      <PaymentForm />
                      <div className="mt-6 flex gap-3">
                        <button
                          onClick={() => setActiveStep(1)}
                          className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold py-3.5 rounded-xl transition-colors cursor-pointer text-sm flex items-center justify-center gap-2"
                        >
                          <ArrowLeft className="w-4 h-4" /> Back
                        </button>
                        <button
                          onClick={handleSubmit}
                          disabled={isProcessing}
                          className="flex-[2] bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-colors cursor-pointer text-sm flex items-center justify-center gap-2"
                        >
                          {isProcessing ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                              {formData.paymentMethod === 'online' ? 'Opening Payment…' : 'Placing Order…'}
                            </>
                          ) : (
                            <>
                              <Lock className="w-4 h-4" />
                              {formData.paymentMethod === 'online' ? 'Pay with Razorpay' : 'Place Order'}
                            </>
                          )}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* ── Right: order summary ── */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-gray-100 p-5 lg:sticky lg:top-24">
                <h2 className="text-base font-extrabold text-gray-900 mb-4">
                  Order Summary
                  <span className="ml-2 text-xs font-semibold text-gray-400">({cartItems.length} item{cartItems.length !== 1 ? 's' : ''})</span>
                </h2>

                {/* Items */}
                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto pr-1">
                  {cartItems.map(item => {
                    const image = item.product?.mainImages?.[0];
                    return (
                      <div key={item.id} className="flex gap-3 bg-gray-50 rounded-xl p-2.5">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-white border border-gray-100 flex-shrink-0">
                          {image ? (
                            <Image src={image} alt={item.name} fill className="object-cover" sizes="48px" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ShoppingBag className="w-4 h-4 text-gray-300" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-900 line-clamp-2 leading-snug">{item.name}</p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-[10px] text-gray-400">Qty: {item.quantity}</span>
                            <span className="text-xs font-extrabold text-gray-900">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Price breakdown */}
                <div className="space-y-2.5 border-t border-gray-100 pt-4 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-medium text-gray-900">₹{subtotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="text-green-600 font-medium">Free</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>GST (18%)</span>
                    <span className="font-medium text-gray-900">₹{tax.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="border-t border-dashed border-gray-200 pt-3 flex justify-between items-center">
                    <span className="font-extrabold text-gray-900">Total</span>
                    <div className="text-right">
                      <p className="text-xl font-extrabold text-gray-900">₹{total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
                      <p className="text-[10px] text-gray-400">Incl. all taxes</p>
                    </div>
                  </div>
                </div>

                {/* Trust badges */}
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                  {[
                    { icon: Truck,  color: 'text-green-500',    text: 'Free shipping on all orders' },
                    { icon: Shield, color: 'text-primary-500',  text: '30-day return policy' },
                    { icon: Lock,   color: 'text-blue-500',     text: '100% secure checkout' },
                  ].map(({ icon: Icon, color, text }) => (
                    <div key={text} className="flex items-center gap-2 text-xs text-gray-500">
                      <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${color}`} />
                      {text}
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
