'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useUser } from '@/contexts/UserContext';
import {
  ArrowLeft, CreditCard, Lock, Truck, Shield,
  MapPin, Phone, Mail, User, Building,
  CheckCircle, AlertCircle, Package, Star,
  Home, ShoppingBag, ArrowRight, Sparkles
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
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: '',
    upiId: '',
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const orderData = {
        userId: isAuthenticated ? user.id : null,
        customer: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip: formData.pincode,
          notes: formData.newsletter ? 'Subscribed to newsletter' : ''
        },
        items: cartItems.map(item => ({
          productId: item.productId,
          name: item.name,
          slug: item.slug || item.product?.slug,
          price: item.price,
          quantity: item.quantity,
          selectedOptions: item.variant,
          image: item.product?.mainImages?.[0] || null
        })),
        total: total,
        subtotal: subtotal,
        shipping: shipping,
        tax: tax,
        paymentMethod: formData.paymentMethod,
        paymentDetails: formData.paymentMethod !== 'cod' ? {
          cardNumber: formData.cardNumber ? formData.cardNumber.slice(-4) : null,
          cardName: formData.cardName,
          upiId: formData.upiId
        } : null
      };

      const api = (await import('@/services/api')).default;
      const order = await api.createOrder(orderData);

      setOrderDetails(order);
      setOrderSuccess(true);
      setActiveStep(3);

      // Clear cart AFTER setting success state to prevent "cart is empty" flash
      clearCart();

    } catch (error) {
      alert('Order creation failed. Please try again.');
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

  // ─── ORDER SUCCESS — must come BEFORE empty cart check ────────────────────────
  if (orderSuccess && orderDetails) {
    return (
      <>
        <Metadata {...generateCheckoutMetadata()} />
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center px-4 py-16">

          {/* Animated background blobs */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-green-100/40 rounded-full blur-2xl"></div>
          </div>

          <div className="relative z-10 max-w-2xl w-full">

            {/* Main success card */}
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 overflow-hidden">

              {/* Top banner */}
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-8 pt-12 pb-16 text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-2 left-8 w-20 h-20 border-2 border-white rounded-full"></div>
                  <div className="absolute top-6 right-12 w-12 h-12 border-2 border-white rounded-full"></div>
                  <div className="absolute bottom-4 left-1/3 w-8 h-8 border-2 border-white rounded-full"></div>
                </div>

                {/* Animated checkmark */}
                <div className="relative mx-auto w-24 h-24 mb-6">
                  <div className="absolute inset-0 bg-white/20 rounded-full animate-ping"></div>
                  <div className="relative w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <CheckCircle className="w-14 h-14 text-emerald-500" strokeWidth={1.5} />
                  </div>
                </div>

                <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">Order Placed!</h1>
                <p className="text-emerald-100 text-lg font-medium">Your order is confirmed and being processed</p>
              </div>

              {/* Content */}
              <div className="px-8 pb-8 -mt-6">

                {/* Order number badge */}
                <div className="flex justify-center my-8">
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 px-6 py-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                      <Package className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Order Number</p>
                      <p className="text-lg font-bold text-gray-900">
                        #{(orderDetails._id || orderDetails.id || orderDetails.orderNumber || '').toString().slice(-8).toUpperCase()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Thank you message */}
                <div className="text-center mb-8">
                  <p className="text-gray-600 leading-relaxed">
                    Thank you, <span className="font-semibold text-gray-900">{formData.firstName}</span>! 🎉
                    We've received your order and sent a confirmation to{' '}
                    <span className="font-semibold text-emerald-600">{formData.email}</span>.
                    You'll get a shipping update once your order is on the way.
                  </p>
                </div>

                {/* Order summary cards */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Payment</p>
                    <p className="font-bold text-gray-900 capitalize">
                      {orderDetails.paymentMethod === 'cod' ? 'Cash on Delivery' :
                        orderDetails.paymentMethod === 'card' ? 'Card' :
                        orderDetails.paymentMethod === 'upi' ? 'UPI' : 'Net Banking'}
                    </p>
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold mt-1 px-2 py-0.5 rounded-full ${
                      orderDetails.paymentStatus === 'paid'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${orderDetails.paymentStatus === 'paid' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                      {orderDetails.paymentStatus === 'paid' ? 'Paid' : 'Pay on delivery'}
                    </span>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Total Amount</p>
                    <p className="font-bold text-2xl text-emerald-600">₹{orderDetails.total?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                    <p className="text-xs text-gray-500 mt-1">Incl. GST & free shipping</p>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Deliver To</p>
                    <p className="font-semibold text-gray-900 text-sm">{formData.city}, {formData.state}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{formData.pincode}</p>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Est. Delivery</p>
                    <p className="font-semibold text-gray-900 text-sm">3–5 Business Days</p>
                    <p className="text-xs text-emerald-600 font-medium mt-0.5">Free Shipping</p>
                  </div>
                </div>

                {/* What's next */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100 mb-8">
                  <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> What happens next?
                  </h3>
                  <div className="space-y-2">
                    {[
                      'Confirmation email sent to your inbox',
                      'Our team will pack your order carefully',
                      'You\'ll receive a tracking link once shipped',
                    ].map((step, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-blue-700">{i + 1}</span>
                        </div>
                        <p className="text-sm text-blue-800">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  {isAuthenticated && (
                    <Link
                      href="/my-orders"
                      className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 px-6 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:scale-105"
                    >
                      <Package className="w-4 h-4" /> Track My Order
                    </Link>
                  )}
                  <Link
                    href="/"
                    className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 py-3.5 px-6 rounded-xl font-semibold border-2 border-gray-200 hover:border-gray-300 transition-all duration-200"
                  >
                    <Home className="w-4 h-4" /> Back to Home
                  </Link>
                  <Link
                    href="/collections"
                    className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 py-3.5 px-6 rounded-xl font-semibold border-2 border-gray-200 hover:border-gray-300 transition-all duration-200"
                  >
                    <ShoppingBag className="w-4 h-4" /> Shop More
                  </Link>
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
          className="w-5 h-5 text-primary-600 border-2 text-gray-700 border-gray-300 rounded-lg focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300"
        />
        <label htmlFor="saveInfo" className="text-sm font-medium text-gray-700 cursor-pointer">
          Save this information for next time
        </label>
      </div>
    </div>
  );

  const renderPaymentForm = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Payment Method</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cash on Delivery */}
          <label className={`relative flex items-center p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300 group ${formData.paymentMethod === 'cod'
            ? 'border-primary-500 bg-gradient-to-br from-primary-50 to-primary-100 shadow-lg shadow-primary-500/10'
            : 'border-gray-200 hover:border-primary-300 hover:shadow-md bg-white'
            }`}>
            <input type="radio" name="paymentMethod" value="cod" checked={formData.paymentMethod === 'cod'} onChange={(e) => handleInputChange('paymentMethod', e.target.value)} className="sr-only" />
            <div className="flex items-center gap-4 w-full">
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${formData.paymentMethod === 'cod' ? 'border-primary-500 bg-primary-500' : 'border-gray-300 group-hover:border-primary-400'}`}>
                {formData.paymentMethod === 'cod' && <div className="w-2 h-2 rounded-full bg-white"></div>}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div className="font-semibold text-gray-900">Cash on Delivery</div>
                </div>
                <div className="text-sm text-gray-600">Pay when your order arrives</div>
              </div>
            </div>
          </label>

          {/* Credit/Debit Card */}
          <label className={`relative flex items-center p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300 group ${formData.paymentMethod === 'card'
            ? 'border-primary-500 bg-gradient-to-br from-primary-50 to-primary-100 shadow-lg shadow-primary-500/10'
            : 'border-gray-200 hover:border-primary-300 hover:shadow-md bg-white'
            }`}>
            <input type="radio" name="paymentMethod" value="card" checked={formData.paymentMethod === 'card'} onChange={(e) => handleInputChange('paymentMethod', e.target.value)} className="sr-only" />
            <div className="flex items-center gap-4 w-full">
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${formData.paymentMethod === 'card' ? 'border-primary-500 bg-primary-500' : 'border-gray-300 group-hover:border-primary-400'}`}>
                {formData.paymentMethod === 'card' && <div className="w-2 h-2 rounded-full bg-white"></div>}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-100 rounded-lg"><CreditCard className="w-5 h-5 text-blue-600" /></div>
                  <div className="font-semibold text-gray-900">Credit/Debit Card</div>
                </div>
                <div className="text-sm text-gray-600">Visa, Mastercard, RuPay</div>
              </div>
            </div>
          </label>

          {/* UPI */}
          <label className={`relative flex items-center p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300 group ${formData.paymentMethod === 'upi'
            ? 'border-primary-500 bg-gradient-to-br from-primary-50 to-primary-100 shadow-lg shadow-primary-500/10'
            : 'border-gray-200 hover:border-primary-300 hover:shadow-md bg-white'
            }`}>
            <input type="radio" name="paymentMethod" value="upi" checked={formData.paymentMethod === 'upi'} onChange={(e) => handleInputChange('paymentMethod', e.target.value)} className="sr-only" />
            <div className="flex items-center gap-4 w-full">
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${formData.paymentMethod === 'upi' ? 'border-primary-500 bg-primary-500' : 'border-gray-300 group-hover:border-primary-400'}`}>
                {formData.paymentMethod === 'upi' && <div className="w-2 h-2 rounded-full bg-white"></div>}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                  </div>
                  <div className="font-semibold text-gray-900">UPI</div>
                </div>
                <div className="text-sm text-gray-600">Google Pay, PhonePe, Paytm</div>
              </div>
            </div>
          </label>

          {/* Net Banking */}
          <label className={`relative flex items-center p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300 group ${formData.paymentMethod === 'netbanking'
            ? 'border-primary-500 bg-gradient-to-br from-primary-50 to-primary-100 shadow-lg shadow-primary-500/10'
            : 'border-gray-200 hover:border-primary-300 hover:shadow-md bg-white'
            }`}>
            <input type="radio" name="paymentMethod" value="netbanking" checked={formData.paymentMethod === 'netbanking'} onChange={(e) => handleInputChange('paymentMethod', e.target.value)} className="sr-only" />
            <div className="flex items-center gap-4 w-full">
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${formData.paymentMethod === 'netbanking' ? 'border-primary-500 bg-primary-500' : 'border-gray-300 group-hover:border-primary-400'}`}>
                {formData.paymentMethod === 'netbanking' && <div className="w-2 h-2 rounded-full bg-white"></div>}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-indigo-100 rounded-lg"><Building className="w-5 h-5 text-indigo-600" /></div>
                  <div className="font-semibold text-gray-900">Net Banking</div>
                </div>
                <div className="text-sm text-gray-600">All major banks</div>
              </div>
            </div>
          </label>
        </div>
      </div>

      {formData.paymentMethod === 'card' && (
        <div className="space-y-6 p-6 bg-gray-50/50 rounded-2xl border border-gray-100/50">
          <h4 className="font-semibold text-gray-900 text-lg">Card Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 relative group">
              <input type="text" placeholder="1234 5678 9012 3456" value={formData.cardNumber} onChange={(e) => handleInputChange('cardNumber', e.target.value)} className="w-full px-4 pt-6 pb-2 border-2 border-gray-200 text-gray-700 rounded-xl focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300 bg-white/80 backdrop-blur-sm peer placeholder-transparent" required />
              <label className="absolute left-4 top-2 text-xs font-semibold text-gray-500 transition-all duration-300 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary-600 peer-focus:font-bold">Card Number *</label>
            </div>
            <div className="relative group">
              <input type="text" placeholder="John Doe" value={formData.cardName} onChange={(e) => handleInputChange('cardName', e.target.value)} className="w-full px-4 pt-6 pb-2 border-2 border-gray-200 text-gray-700 rounded-xl focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300 bg-white/80 backdrop-blur-sm peer placeholder-transparent" required />
              <label className="absolute left-4 top-2 text-xs font-semibold text-gray-500 transition-all duration-300 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary-600 peer-focus:font-bold">Cardholder Name *</label>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="relative group">
                <input type="text" placeholder="MM/YY" value={formData.expiry} onChange={(e) => handleInputChange('expiry', e.target.value)} className="w-full px-4 pt-6 pb-2 border-2 border-gray-200 text-gray-700 rounded-xl focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300 bg-white/80 backdrop-blur-sm peer placeholder-transparent" required />
                <label className="absolute left-4 top-2 text-xs font-semibold text-gray-500 transition-all duration-300 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary-600 peer-focus:font-bold">Expiry *</label>
              </div>
              <div className="relative group">
                <input type="text" placeholder="123" value={formData.cvv} onChange={(e) => handleInputChange('cvv', e.target.value)} className="w-full px-4 pt-6 pb-2 border-2 border-gray-200 text-gray-700 rounded-xl focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300 bg-white/80 backdrop-blur-sm peer placeholder-transparent" required />
                <label className="absolute left-4 top-2 text-xs font-semibold text-gray-500 transition-all duration-300 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary-600 peer-focus:font-bold">CVV *</label>
              </div>
            </div>
          </div>
        </div>
      )}

      {formData.paymentMethod === 'upi' && (
        <div className="space-y-6 p-6 bg-gray-50/50 rounded-2xl border border-gray-100/50">
          <h4 className="font-semibold text-gray-900 text-lg">UPI Details</h4>
          <div className="relative group">
            <input type="text" placeholder="yourname@paytm" value={formData.upiId} onChange={(e) => handleInputChange('upiId', e.target.value)} className="w-full px-4 pt-6 pb-2 border-2 border-gray-200 text-gray-700 rounded-xl focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300 bg-white/80 backdrop-blur-sm peer placeholder-transparent" required />
            <label className="absolute left-4 top-2 text-xs font-semibold text-gray-500 transition-all duration-300 peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-xs peer-focus:text-primary-600 peer-focus:font-bold">UPI ID *</label>
          </div>
        </div>
      )}

      {formData.paymentMethod === 'netbanking' && (
        <div className="space-y-6 p-6 bg-gray-50/50 rounded-2xl border border-gray-100/50">
          <h4 className="font-semibold text-gray-900 text-lg">Net Banking</h4>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-100 rounded-lg"><Building className="w-5 h-5 text-blue-600" /></div>
              <h5 className="font-semibold text-blue-900">Secure Bank Transfer</h5>
            </div>
            <p className="text-sm text-blue-700">You will be redirected to your bank's secure payment page to complete the transaction.</p>
          </div>
        </div>
      )}

      {formData.paymentMethod === 'cod' && (
        <div className="space-y-6 p-6 bg-gray-50/50 rounded-2xl border border-gray-100/50">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-xl"><CheckCircle className="w-6 h-6 text-green-600" /></div>
              <div>
                <h4 className="font-semibold text-green-900 text-lg">Cash on Delivery</h4>
                <p className="text-sm text-green-700 mt-1">Pay ₹{total.toLocaleString()} when your order arrives. No advance payment required.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-xl"><Shield className="w-6 h-6 text-blue-600" /></div>
          <div>
            <h4 className="font-semibold text-blue-900 text-lg">Secure Payment</h4>
            <p className="text-sm text-blue-700 mt-1">Your payment information is encrypted and secure. We never store your card details.</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 p-4 bg-gray-50/50 rounded-xl border border-gray-100/50">
        <input type="checkbox" id="newsletter" checked={formData.newsletter} onChange={(e) => handleInputChange('newsletter', e.target.checked)} className="w-5 h-5 text-primary-600 border-2 border-gray-300 rounded-lg focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-300" />
        <label htmlFor="newsletter" className="text-sm font-medium text-gray-700 cursor-pointer">Subscribe to our newsletter for updates and offers</label>
      </div>
    </div>
  );

  return (
    <>
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
                              Processing...
                            </>
                          ) : (
                            <>
                              <Lock className="w-5 h-5" />
                              Place Order
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