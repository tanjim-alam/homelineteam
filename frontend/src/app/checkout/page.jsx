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
  CheckCircle, AlertCircle, Package, Star,
  Home, ShoppingBag, Sparkles
} from 'lucide-react';
import Metadata from '@/components/Metadata';
import { generateCheckoutMetadata } from '@/utils/metadata';

export default function CheckoutPage() {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { user, isAuthenticated, loading: authLoading } = useUser();
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    paymentMethod: 'cod',
    saveInfo: true,
    newsletter: false
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);

  const subtotal = getCartTotal();
  const shipping = 0;
  const tax = subtotal * 0.18;
  const total = subtotal + shipping + tax;

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      localStorage.setItem('redirectAfterLogin', '/checkout');
      router.push('/auth/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated && user) {
      const nameParts = user.name.split(' ');
      setFormData(prev => ({
        ...prev,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.addresses?.find(addr => addr.isDefault)?.address || '',
        city: user.addresses?.find(addr => addr.isDefault)?.city || '',
        state: user.addresses?.find(addr => addr.isDefault)?.state || '',
        pincode: user.addresses?.find(addr => addr.isDefault)?.pincode || '',
      }));
    }
  }, [isAuthenticated, user]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const buildOrderPayload = () => ({
    userId: isAuthenticated ? user.id : null,
    customer: {
      name: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      zip: formData.pincode,
      notes: formData.newsletter ? 'Subscribed to newsletter' : '',
    },
    items: cartItems.map(item => ({
      productId: item.productId,
      name: item.name,
      slug: item.slug || item.product?.slug,
      price: item.price,
      quantity: item.quantity,
      selectedOptions: item.variant,
      image: item.product?.mainImages?.[0] || null,
    })),
    total,
    subtotal,
    shipping,
    tax,
    paymentMethod: formData.paymentMethod === 'online' ? 'card' : 'cod',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const api = (await import('@/services/api')).default;

      const assertOrder = (order) => {
        if (!order || !order._id) {
          throw new Error(order?.message || order?.error || 'Order creation failed. Please contact support.');
        }
        return order;
      };

      if (formData.paymentMethod === 'cod') {
        const order = assertOrder(await api.createOrder(buildOrderPayload()));
        setOrderDetails(order);
        setOrderSuccess(true);
        setActiveStep(3);
        clearCart();
        return;
      }

      // ── Razorpay flow (online payment) ────────────────────────────────────
      const rzpOrderRes = await api.createRazorpayOrder(total);
      if (!rzpOrderRes?.razorpayOrderId) {
        throw new Error(rzpOrderRes?.message || rzpOrderRes?.error || 'Failed to initiate payment. Please try again.');
      }

      await new Promise((resolve, reject) => {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: rzpOrderRes.amount,
          currency: rzpOrderRes.currency || 'INR',
          name: 'HomelineTeam',
          description: 'Order Payment',
          order_id: rzpOrderRes.razorpayOrderId,
          prefill: {
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            contact: formData.phone,
          },
          theme: { color: '#6366f1' },
          handler: async (response) => {
            try {
              const order = assertOrder(await api.verifyRazorpayPayment({
                ...buildOrderPayload(),
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }));
              setOrderDetails(order);
              setOrderSuccess(true);
              setActiveStep(3);
              clearCart();
              resolve();
            } catch (err) {
              reject(err);
            }
          },
          modal: {
            ondismiss: () => reject(new Error('Payment cancelled')),
          },
        };

        if (!window.Razorpay) {
          reject(new Error('Razorpay SDK not loaded. Please refresh and try again.'));
          return;
        }
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', (resp) => {
          reject(new Error(resp.error?.description || 'Payment failed'));
        });
        rzp.open();
      });

    } catch (error) {
      if (error.message !== 'Payment cancelled') {
        alert(error.message || 'Order failed. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // ─── LOADING STATE ────────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <>
        <Metadata {...generateCheckoutMetadata()} />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </>
    );
  }

  // ─── NOT AUTHENTICATED ────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <>
        <Metadata {...generateCheckoutMetadata()} />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-yellow-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Login Required</h1>
            <p className="text-gray-600 mb-6">
              You need to be logged in to place an order. Please sign in to continue with your purchase.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/auth/login" className="btn-primary px-6 py-3 cursor-pointer">Sign In</Link>
              <Link href="/auth/register" className="btn-secondary px-6 py-3 cursor-pointer">Create Account</Link>
            </div>
            <p className="text-sm text-gray-500 mt-4">Don't worry, your cart items will be saved for when you return.</p>
          </div>
        </div>
      </>
    );
  }

  // ─── ORDER SUCCESS ────────────────────────────────────────────────────────────
  if (orderSuccess && orderDetails) {
    const orderNum = orderDetails.orderNumber || orderDetails._id?.toString().slice(-8).toUpperCase();
    const isPaid = orderDetails.paymentStatus === 'paid';
    const isCOD = orderDetails.paymentMethod === 'cod';
    const orderTotal = typeof orderDetails.total === 'number'
      ? orderDetails.total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : '—';

    return (
      <>
        <Metadata {...generateCheckoutMetadata()} />
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center px-4 py-12">

          <div className="relative z-10 max-w-lg w-full">
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">

              {/* Green header */}
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-8 pt-10 pb-14 text-center">
                <div className="relative mx-auto w-20 h-20 mb-5">
                  <div className="absolute inset-0 bg-white/20 rounded-full animate-ping"></div>
                  <div className="relative w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <CheckCircle className="w-11 h-11 text-emerald-500" strokeWidth={1.5} />
                  </div>
                </div>
                <h1 className="text-3xl font-extrabold text-white mb-1">Order Confirmed!</h1>
                <p className="text-emerald-100 text-base">Thank you, {formData.firstName}! Your order is on its way.</p>
              </div>

              {/* Body */}
              <div className="px-8 pb-8 -mt-6 space-y-5">

                {/* Order number pill */}
                <div className="flex justify-center">
                  <div className="bg-white rounded-2xl shadow-md border border-gray-100 px-5 py-3 flex items-center gap-3">
                    <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Package className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-widest">Order Number</p>
                      <p className="text-base font-bold text-gray-900 tracking-wide">
                        {orderNum ? `#${orderNum}` : 'Processing…'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Key details grid */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Total */}
                  <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
                    <p className="text-[11px] text-emerald-600 font-semibold uppercase tracking-wide mb-1">Total Paid</p>
                    <p className="text-xl font-extrabold text-emerald-700">₹{orderTotal}</p>
                    <p className="text-[11px] text-emerald-500 mt-0.5">Incl. GST & shipping</p>
                  </div>

                  {/* Payment */}
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide mb-1">Payment</p>
                    <p className="font-bold text-gray-900 text-sm">{isCOD ? 'Cash on Delivery' : 'Online (Razorpay)'}</p>
                    <span className={`inline-flex items-center gap-1 text-[11px] font-bold mt-1.5 px-2 py-0.5 rounded-full ${
                      isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full inline-block ${isPaid ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      {isPaid ? 'Paid' : 'Pay on Delivery'}
                    </span>
                  </div>

                  {/* Deliver to */}
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide mb-1">Deliver To</p>
                    <p className="font-semibold text-gray-900 text-sm">{formData.city}, {formData.state}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">{formData.pincode}</p>
                  </div>

                  {/* Est. delivery */}
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide mb-1">Est. Delivery</p>
                    <p className="font-semibold text-gray-900 text-sm">3–5 Business Days</p>
                    <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Free Shipping</p>
                  </div>
                </div>

                {/* What's next */}
                <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
                  <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2 text-sm">
                    <Sparkles className="w-4 h-4" /> What happens next?
                  </h3>
                  <div className="space-y-2">
                    {[
                      'Confirmation email sent to your inbox',
                      'Our team will carefully pack your order',
                      'You\'ll receive a tracking link once shipped',
                    ].map((step, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-[10px] font-bold text-blue-700">{i + 1}</span>
                        </div>
                        <p className="text-sm text-blue-800">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="space-y-3">
                  {isAuthenticated && (
                    <Link
                      href="/my-orders"
                      className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 px-6 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:scale-[1.02]"
                    >
                      <Package className="w-4 h-4" /> Track My Order
                    </Link>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      href="/"
                      className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 py-3 px-4 rounded-xl font-semibold border-2 border-gray-200 hover:border-gray-300 transition-all duration-200 text-sm"
                    >
                      <Home className="w-4 h-4" /> Back to Home
                    </Link>
                    <Link
                      href="/collections"
                      className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 py-3 px-4 rounded-xl font-semibold border-2 border-gray-200 hover:border-gray-300 transition-all duration-200 text-sm"
                    >
                      <ShoppingBag className="w-4 h-4" /> Shop More
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom trust strip */}
            <div className="mt-6 flex items-center justify-center gap-6 text-sm text-gray-500">
              <span className="flex items-center gap-1.5"><Shield className="w-4 h-4 text-gray-400" /> Secure checkout</span>
              <span className="text-gray-300">•</span>
              <span className="flex items-center gap-1.5"><Truck className="w-4 h-4 text-gray-400" /> Free delivery</span>
              <span className="text-gray-300">•</span>
              <span className="flex items-center gap-1.5"><Star className="w-4 h-4 text-gray-400" /> 30-day returns</span>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ─── EMPTY CART (only shown if order was NOT just placed) ─────────────────────
  if (cartItems.length === 0) {
    return (
      <>
        <Metadata {...generateCheckoutMetadata()} />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
            <p className="text-gray-600 mb-6">Please add some products to your cart before checkout.</p>
            <Link href="/cart" className="btn-primary px-6 py-3 cursor-pointer">Go to Cart</Link>
          </div>
        </div>
      </>
    );
  }

  const renderShippingForm = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="relative group">
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            className="w-full px-4 pt-6 pb-2 border-2 text-gray-700 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300 bg-white/80 backdrop-blur-sm peer placeholder-transparent"
            placeholder="Enter your first name"
            required
          />
          <label className="absolute left-4 top-2 text-xs font-semibold text-gray-500 transition-all duration-300 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary-600 peer-focus:font-bold">
            First Name *
          </label>
        </div>
        <div className="relative group">
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            className="w-full px-4 pt-6 pb-2 border-2 text-gray-700 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300 bg-white/80 backdrop-blur-sm peer placeholder-transparent"
            placeholder="Enter your last name"
            required
          />
          <label className="absolute left-4 top-2 text-xs font-semibold text-gray-500 transition-all duration-300 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary-600 peer-focus:font-bold">
            Last Name *
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="relative group">
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="w-full px-4 pt-6 pb-2 border-2 border-gray-200 text-gray-700 rounded-xl focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300 bg-white/80 backdrop-blur-sm peer placeholder-transparent"
            placeholder="your.email@example.com"
            required
          />
          <label className="absolute left-4 top-2 text-xs font-semibold text-gray-500 transition-all duration-300 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary-600 peer-focus:font-bold">
            Email Address *
          </label>
        </div>
        <div className="relative group">
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className="w-full px-4 pt-6 pb-2 border-2 border-gray-200 text-gray-700 rounded-xl focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300 bg-white/80 backdrop-blur-sm peer placeholder-transparent"
            placeholder="+91 98765 43210"
            required
          />
          <label className="absolute left-4 top-2 text-xs font-semibold text-gray-500 transition-all duration-300 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary-600 peer-focus:font-bold">
            Phone Number *
          </label>
        </div>
      </div>

      <div className="relative group">
        <input
          type="text"
          value={formData.address}
          onChange={(e) => handleInputChange('address', e.target.value)}
          className="w-full px-4 pt-6 pb-2 border-2 text-gray-700 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300 bg-white/80 backdrop-blur-sm peer placeholder-transparent"
          placeholder="House/Flat number, Street, Area"
          required
        />
        <label className="absolute left-4 top-2 text-xs font-semibold text-gray-500 transition-all duration-300 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary-600 peer-focus:font-bold">
          Street Address *
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="relative group">
          <input
            type="text"
            value={formData.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
            className="w-full px-4 pt-6 pb-2 border-2 text-gray-700 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300 bg-white/80 backdrop-blur-sm peer placeholder-transparent"
            placeholder="Mumbai"
            required
          />
          <label className="absolute left-4 top-2 text-xs font-semibold text-gray-500 transition-all duration-300 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary-600 peer-focus:font-bold">
            City *
          </label>
        </div>
        <div className="relative group">
          <input
            type="text"
            value={formData.state}
            onChange={(e) => handleInputChange('state', e.target.value)}
            className="w-full px-4 pt-6 pb-2 border-2 text-gray-700 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300 bg-white/80 backdrop-blur-sm peer placeholder-transparent"
            placeholder="Maharashtra"
            required
          />
          <label className="absolute left-4 top-2 text-xs font-semibold text-gray-500 transition-all duration-300 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary-600 peer-focus:font-bold">
            State *
          </label>
        </div>
        <div className="relative group">
          <input
            type="text"
            value={formData.pincode}
            onChange={(e) => handleInputChange('pincode', e.target.value)}
            className="w-full px-4 pt-6 pb-2 border-2 text-gray-700 border-gray-200 rounded-xl focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300 bg-white/80 backdrop-blur-sm peer placeholder-transparent"
            placeholder="400001"
            required
          />
          <label className="absolute left-4 top-2 text-xs font-semibold text-gray-500 transition-all duration-300 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary-600 peer-focus:font-bold">
            PIN Code *
          </label>
        </div>
      </div>

      <div className="flex items-center gap-4 p-4 bg-gray-50/50 rounded-xl border border-gray-100/50">
        <input
          type="checkbox"
          id="saveInfo"
          checked={formData.saveInfo}
          onChange={(e) => handleInputChange('saveInfo', e.target.checked)}
          className="w-5 h-5 accent-primary-600 border-2 border-gray-300 rounded-lg focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300"
        />
        <label htmlFor="saveInfo" className="text-sm font-medium text-gray-700 cursor-pointer">
          Save this information for next time
        </label>
      </div>
    </div>
  );

  const renderPaymentForm = () => (
    <div className="space-y-5">
      <h3 className="text-lg font-semibold text-gray-900">Choose Payment Method</h3>

      {/* Two payment options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Cash on Delivery */}
        <label className={`relative flex flex-col p-5 border-2 rounded-2xl cursor-pointer transition-all duration-200 ${
          formData.paymentMethod === 'cod'
            ? 'border-emerald-500 bg-emerald-50 shadow-md shadow-emerald-100'
            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
        }`}>
          <input
            type="radio"
            name="paymentMethod"
            value="cod"
            checked={formData.paymentMethod === 'cod'}
            onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
            className="sr-only"
          />
          {/* Selected indicator */}
          <div className={`absolute top-4 right-4 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
            formData.paymentMethod === 'cod' ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300'
          }`}>
            {formData.paymentMethod === 'cod' && <div className="w-2 h-2 rounded-full bg-white" />}
          </div>

          <div className="w-11 h-11 bg-emerald-100 rounded-xl flex items-center justify-center mb-3">
            <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p className="font-semibold text-gray-900 mb-0.5">Cash on Delivery</p>
          <p className="text-sm text-gray-500">Pay when your order arrives</p>
        </label>

        {/* Online Payment via Razorpay */}
        <label className={`relative flex flex-col p-5 border-2 rounded-2xl cursor-pointer transition-all duration-200 ${
          formData.paymentMethod === 'online'
            ? 'border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-100'
            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
        }`}>
          <input
            type="radio"
            name="paymentMethod"
            value="online"
            checked={formData.paymentMethod === 'online'}
            onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
            className="sr-only"
          />
          {/* Selected indicator */}
          <div className={`absolute top-4 right-4 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
            formData.paymentMethod === 'online' ? 'border-indigo-500 bg-indigo-500' : 'border-gray-300'
          }`}>
            {formData.paymentMethod === 'online' && <div className="w-2 h-2 rounded-full bg-white" />}
          </div>

          <div className="w-11 h-11 bg-indigo-100 rounded-xl flex items-center justify-center mb-3">
            <CreditCard className="w-6 h-6 text-indigo-600" />
          </div>
          <p className="font-semibold text-gray-900 mb-0.5">Online Payment</p>
          <p className="text-sm text-gray-500">Card, UPI, Net Banking & more</p>

          {/* Payment brand icons */}
          <div className="flex items-center gap-1.5 mt-3 flex-wrap">
            {/* UPI */}
            <span className="text-[10px] font-bold bg-orange-100 text-orange-600 px-2 py-0.5 rounded-md">UPI</span>
            {/* Visa */}
            <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md">VISA</span>
            {/* Mastercard */}
            <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-md">MC</span>
            {/* RuPay */}
            <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-md">RuPay</span>
          </div>
        </label>
      </div>

      {/* COD detail */}
      {formData.paymentMethod === 'cod' && (
        <div className="flex items-start gap-4 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
          <div className="p-2 bg-emerald-100 rounded-xl mt-0.5">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="font-semibold text-emerald-900 text-sm">No advance payment needed</p>
            <p className="text-sm text-emerald-700 mt-0.5">
              Keep <span className="font-bold">₹{total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span> ready when your order arrives.
            </p>
          </div>
        </div>
      )}

      {/* Online payment detail */}
      {formData.paymentMethod === 'online' && (
        <div className="flex items-start gap-4 p-4 bg-indigo-50 border border-indigo-200 rounded-2xl">
          <div className="p-2 bg-indigo-100 rounded-xl mt-0.5">
            <Lock className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <p className="font-semibold text-indigo-900 text-sm">Secure Razorpay Checkout</p>
            <p className="text-sm text-indigo-700 mt-0.5">
              Click <span className="font-bold">Place Order</span> to open the Razorpay window. Pay using Card, UPI, Net Banking, or Wallet — all secured by 256-bit encryption.
            </p>
          </div>
        </div>
      )}

      {/* Security strip */}
      <div className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-100 rounded-2xl">
        <Shield className="w-5 h-5 text-gray-400 flex-shrink-0" />
        <p className="text-sm text-gray-500">
          Your payment is <span className="font-medium text-gray-700">100% secure</span>. We never store card or UPI details.
        </p>
      </div>
    </div>
  );

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <Metadata {...generateCheckoutMetadata()} />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-50">
          <div className="container-custom py-6">
            <div className="flex items-center justify-between">
              <Link href="/cart" className="flex items-center gap-3 text-gray-600 hover:text-primary-600 transition-all duration-200 group">
                <div className="p-2 rounded-full bg-gray-100 group-hover:bg-primary-100 transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                </div>
                <span className="font-medium">Back to Cart</span>
              </Link>
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Secure Checkout</h1>
                <p className="text-sm text-gray-500">Complete your order safely</p>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-700 font-medium">SSL Secured</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-full">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span className="text-blue-700 font-medium">Protected</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container-custom py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
                {/* Progress Steps */}
                <div className="p-8 border-b border-gray-100/50 bg-gradient-to-r from-gray-50/50 to-white/50">
                  <div className="flex items-center justify-between max-w-2xl mx-auto">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${activeStep >= 1 ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25' : 'bg-gray-100 text-gray-400'}`}>
                        {activeStep > 1 ? <CheckCircle className="w-6 h-6" /> : '1'}
                      </div>
                      <div>
                        <span className={`font-semibold text-sm ${activeStep >= 1 ? 'text-primary-600' : 'text-gray-400'}`}>Shipping Info</span>
                        <p className="text-xs text-gray-500">Delivery details</p>
                      </div>
                    </div>
                    <div className={`w-20 h-1 rounded-full transition-all duration-300 ${activeStep >= 2 ? 'bg-gradient-to-r from-primary-500 to-primary-600' : 'bg-gray-200'}`}></div>
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${activeStep >= 2 ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25' : 'bg-gray-100 text-gray-400'}`}>
                        {activeStep > 2 ? <CheckCircle className="w-6 h-6" /> : '2'}
                      </div>
                      <div>
                        <span className={`font-semibold text-sm ${activeStep >= 2 ? 'text-primary-600' : 'text-gray-400'}`}>Payment</span>
                        <p className="text-xs text-gray-500">Secure payment</p>
                      </div>
                    </div>
                    <div className={`w-20 h-1 rounded-full transition-all duration-300 ${activeStep >= 3 ? 'bg-gradient-to-r from-primary-500 to-primary-600' : 'bg-gray-200'}`}></div>
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${activeStep >= 3 ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25' : 'bg-gray-100 text-gray-400'}`}>
                        {activeStep >= 3 ? <CheckCircle className="w-6 h-6" /> : '3'}
                      </div>
                      <div>
                        <span className={`font-semibold text-sm ${activeStep >= 3 ? 'text-primary-600' : 'text-gray-400'}`}>Confirmation</span>
                        <p className="text-xs text-gray-500">Order complete</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Content */}
                <div className="p-8">
                  {activeStep === 1 && (
                    <div>
                      <div className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Shipping Information</h2>
                        <p className="text-gray-600">Enter your delivery details to continue</p>
                      </div>
                      {renderShippingForm()}
                      <div className="mt-10">
                        <button
                          onClick={() => setActiveStep(2)}
                          className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-4 rounded-xl font-semibold text-lg shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 transition-all duration-300 transform hover:scale-105 cursor-pointer"
                        >
                          Continue to Payment
                        </button>
                      </div>
                    </div>
                  )}

                  {activeStep === 2 && (
                    <div>
                      <div className="mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Payment Information</h2>
                        <p className="text-gray-600">Choose your preferred payment method</p>
                      </div>
                      {renderPaymentForm()}
                      <div className="mt-10 flex gap-4">
                        <button
                          onClick={() => setActiveStep(1)}
                          className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-xl font-semibold text-lg hover:bg-gray-200 transition-all duration-300 cursor-pointer"
                        >
                          Back to Shipping
                        </button>
                        <button
                          onClick={handleSubmit}
                          disabled={isProcessing}
                          className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white py-4 rounded-xl font-semibold text-lg shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 cursor-pointer"
                        >
                          {isProcessing ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                              {formData.paymentMethod === 'online' ? 'Opening Payment...' : 'Placing Order...'}
                            </>
                          ) : (
                            <>
                              <Lock className="w-5 h-5" />
                              {formData.paymentMethod === 'online' ? 'Pay with Razorpay' : 'Place Order'}
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8 sticky top-8">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Summary</h2>
                  <p className="text-gray-600 text-sm">{cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in your order</p>
                </div>

                <div className="space-y-6 mb-8">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-4 p-4 bg-gray-50/50 rounded-2xl border border-gray-100/50">
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                        {item.product?.mainImages?.[0] && typeof item.product.mainImages[0] === 'string' && item.product.mainImages[0].trim() !== '' ? (
                          <Image src={item.product.mainImages[0]} alt={item.name} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1">{item.name}</h4>
                        <p className="text-xs text-gray-500 mb-2">
                          {item.variant && Object.keys(item.variant).length > 0
                            ? Object.entries(item.variant).map(([key, value]) => `${key}: ${value}`).join(', ')
                            : 'No variants selected'}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-primary-600">₹{(item.price * item.quantity).toFixed(2)}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">Qty:</span>
                            <span className="text-sm font-semibold text-gray-900">{item.quantity}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-4 border-t border-gray-200/50 pt-6">
                  <div className="flex justify-between text-gray-600">
                    <span className="font-medium">Subtotal</span>
                    <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span className="font-medium">Shipping</span>
                    <span className="text-green-600 font-semibold">Free</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span className="font-medium">Tax (GST 18%)</span>
                    <span className="font-semibold">₹{tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-200/50 pt-4 bg-gradient-to-r from-primary-50/50 to-primary-100/30 rounded-2xl p-4">
                    <div className="flex justify-between text-2xl font-bold text-gray-900">
                      <span>Total</span>
                      <span className="text-primary-600">₹{total.toFixed(2)}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Including all taxes and fees</p>
                  </div>
                </div>

                <div className="mt-8 space-y-4 pt-6 border-t border-gray-200/50">
                  <div className="flex items-center gap-3 p-3 bg-green-50/50 rounded-xl border border-green-100/50">
                    <div className="p-2 bg-green-100 rounded-lg"><Truck className="w-4 h-4 text-green-600" /></div>
                    <span className="text-sm font-medium text-green-700">Free shipping on all orders</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100/50">
                    <div className="p-2 bg-blue-100 rounded-lg"><Shield className="w-4 h-4 text-blue-600" /></div>
                    <span className="text-sm font-medium text-blue-700">30-day return policy</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-purple-50/50 rounded-xl border border-purple-100/50">
                    <div className="p-2 bg-purple-100 rounded-lg"><Lock className="w-4 h-4 text-purple-600" /></div>
                    <span className="text-sm font-medium text-purple-700">SSL encrypted checkout</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}