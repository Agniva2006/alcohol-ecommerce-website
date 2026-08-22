import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  MapPin, CreditCard, Smartphone, ArrowLeft, Check, Truck, ShieldCheck, 
  Loader2, QrCode, Lock, CheckCircle2, X, Sparkles, Building, AlertCircle
} from 'lucide-react';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import useOrderStore from '../store/orderStore';
import useToastStore from '../store/toastStore';
import api from '../api';
import { formatCurrency, isValidPhone, isValidPincode } from '../utils/helpers';

export default function Checkout() {
  const navigate = useNavigate();
  const { items, clearCart, getOrderSummary } = useCartStore();
  const user = useAuthStore((s) => s.user);
  const placeOrder = useOrderStore((s) => s.placeOrder);
  const toast = useToastStore();

  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [selectedAddress, setSelectedAddress] = useState(0);
  const [useNewAddress, setUseNewAddress] = useState(!user);
  const [isPlacing, setIsPlacing] = useState(false);
  const [errors, setErrors] = useState({});

  // Razorpay Gateway Modal State
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);
  const [rzpStep, setRzpStep] = useState('qr'); // 'qr' | 'processing' | 'success'
  const [createdOrderId, setCreatedOrderId] = useState(null);
  const [rzpPaymentId, setRzpPaymentId] = useState('');
  const [upiTimer, setUpiTimer] = useState(300);

  const [address, setAddress] = useState({
    name: user?.name || '',
    phone: user?.phone?.replace('+91 ', '') || '',
    street: '',
    city: 'Jalpaiguri',
    state: 'West Bengal',
    pincode: '735102',
  });

  const summary = getOrderSummary();

  const paymentMethods = [
    { id: 'upi', label: 'UPI Instant Pay', subtitle: 'Google Pay / PhonePe / Paytm / CRED', icon: Smartphone, color: 'text-purple-600 bg-purple-100' },
    { id: 'card', label: 'Credit / Debit Card', subtitle: 'Visa, Mastercard, RuPay, Corporate', icon: CreditCard, color: 'text-blue-600 bg-blue-100' },
  ];

  // UPI Timer
  useEffect(() => {
    if (!showRazorpayModal || upiTimer <= 0) return;
    const interval = setInterval(() => setUpiTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [showRazorpayModal, upiTimer]);

  const validate = () => {
    const e = {};
    if (useNewAddress) {
      if (!address.name.trim()) e.name = 'Name is required';
      if (!address.phone.trim()) e.phone = 'Phone is required';
      else if (!isValidPhone(address.phone)) e.phone = 'Invalid phone number';
      if (!address.street.trim()) e.street = 'Address is required';
      if (!address.city.trim()) e.city = 'City is required';
      if (!address.pincode.trim()) e.pincode = 'PIN code is required';
      else if (!isValidPincode(address.pincode)) e.pincode = 'Invalid PIN code';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleInitiateOrder = async () => {
    if (!validate()) {
      toast.error('Please fill all required fields correctly');
      return;
    }

    setIsPlacing(true);
    try {
      const deliveryAddress = useNewAddress
        ? `${address.street}, ${address.city}, ${address.state} - ${address.pincode}`
        : user?.addresses?.[selectedAddress]?.address || 'Jalpaiguri Govt Engineering College, Hostel No. 3, Jalpaiguri 735102';

      // 1. Create order in SQLite Database
      const orderId = await placeOrder({
        items,
        address: deliveryAddress,
        paymentMethod,
        summary,
        customerId: user?.id || 'guest',
      });

      setCreatedOrderId(orderId);

      // 2. Create Razorpay Order
      await api.post('/payment/create-razorpay-order', {
        amount: summary.total,
        orderId
      });

      // Open Razorpay High-Fidelity Gateway Modal
      setIsPlacing(false);
      setShowRazorpayModal(true);
      setRzpStep('qr');
      setUpiTimer(300);
    } catch (error) {
      console.error(error);
      setIsPlacing(false);
      toast.error('Failed to initiate order. Please try again.');
    }
  };

  // Complete Payment Simulation
  const handleApprovePayment = async () => {
    setRzpStep('processing');
    const paymentId = `pay_rzp_${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
    setRzpPaymentId(paymentId);

    try {
      await api.post('/payment/verify-signature', {
        orderId: createdOrderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: 'valid_excise_authorized_signature'
      });

      setTimeout(() => {
        setRzpStep('success');
        clearCart();
        toast.success(`Payment Authorized! ID: ${paymentId}`);
        setTimeout(() => {
          setShowRazorpayModal(false);
          navigate('/order-tracking');
        }, 1800);
      }, 2000);
    } catch (error) {
      console.error(error);
      setRzpStep('qr');
      toast.error('Payment authorization failed.');
    }
  };

  useEffect(() => {
    if (items.length === 0 && !isPlacing && !showRazorpayModal) {
      navigate('/cart', { replace: true });
    }
  }, [items.length, isPlacing, showRazorpayModal, navigate]);

  if (items.length === 0 && !showRazorpayModal) {
    return null;
  }

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      <Link to="/cart" className="inline-flex items-center gap-2 text-primary hover:text-primary-800 mb-6 font-medium transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Cart
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-dark-900">Checkout & Order</h1>
          <p className="text-dark-500 text-sm mt-1">Direct Delivery from Nearest Licensed FL OFF Shop</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-3 py-1.5 rounded-full text-xs font-bold">
          <ShieldCheck className="w-4 h-4" />
          Excise Legal 21+ Compliant
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Delivery Address */}
          <div className="bg-white rounded-2xl p-6 shadow-card border border-dark-200/50 animate-fade-in">
            <div className="flex items-center gap-2 mb-5">
              <div className="p-2 bg-primary-50 rounded-lg"><MapPin className="w-5 h-5 text-primary" /></div>
              <h2 className="text-lg font-display font-bold">Delivery Address</h2>
            </div>

            {/* Saved Addresses */}
            {user?.addresses && user.addresses.length > 0 && !useNewAddress && (
              <div className="space-y-3 mb-4">
                {user.addresses.map((addr, i) => (
                  <label
                    key={addr.id}
                    className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedAddress === i ? 'border-primary bg-primary-50' : 'border-dark-200 hover:border-dark-300'}`}
                  >
                    <input type="radio" name="address" checked={selectedAddress === i} onChange={() => setSelectedAddress(i)} className="hidden" />
                    <div className={`w-5 h-5 mt-0.5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selectedAddress === i ? 'border-primary bg-primary' : 'border-dark-300'}`}>
                      {selectedAddress === i && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div>
                      <span className="font-semibold text-dark-900">{addr.label}</span>
                      {addr.isDefault && <span className="ml-2 text-xs bg-accent-100 text-accent-800 px-2 py-0.5 rounded-full font-medium">Default</span>}
                      <p className="text-sm text-dark-500 mt-1">{addr.address}</p>
                    </div>
                  </label>
                ))}
                <button onClick={() => setUseNewAddress(true)} className="text-primary font-medium text-sm hover:underline">
                  + Use a different address
                </button>
              </div>
            )}

            {/* New Address Form */}
            {useNewAddress && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                {user?.addresses?.length > 0 && (
                  <button onClick={() => setUseNewAddress(false)} className="col-span-full text-primary font-medium text-sm hover:underline text-left mb-1">
                    ← Use saved address
                  </button>
                )}
                {[
                  { key: 'name', label: 'Full Name', type: 'text', placeholder: 'Rupam Bhattacharya', span: 1 },
                  { key: 'phone', label: 'Phone Number', type: 'tel', placeholder: '9876543210', span: 1 },
                  { key: 'street', label: 'Delivery Location / Landmark', type: 'text', placeholder: 'Hostel No. 3, JGEC Campus, Jalpaiguri', span: 2 },
                  { key: 'city', label: 'City', type: 'text', placeholder: 'Jalpaiguri', span: 1 },
                  { key: 'pincode', label: 'PIN Code', type: 'text', placeholder: '735102', span: 1 },
                ].map((field) => (
                  <div key={field.key} className={field.span === 2 ? 'col-span-full' : ''}>
                    <label className="block text-sm font-medium text-dark-700 mb-1.5">{field.label} *</label>
                    <input
                      type={field.type}
                      value={address[field.key]}
                      onChange={(e) => { setAddress({ ...address, [field.key]: e.target.value }); setErrors({ ...errors, [field.key]: '' }); }}
                      placeholder={field.placeholder}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors ${errors[field.key] ? 'border-red-400' : 'border-dark-200'}`}
                    />
                    {errors[field.key] && <p className="text-red-500 text-xs mt-1">{errors[field.key]}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-2xl p-6 shadow-card border border-dark-200/50 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-2 mb-5">
              <div className="p-2 bg-primary-50 rounded-lg"><CreditCard className="w-5 h-5 text-primary" /></div>
              <h2 className="text-lg font-display font-bold">Select Payment Gateway</h2>
            </div>
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <label
                  key={method.id}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === method.id ? 'border-primary bg-primary-50/70 shadow-sm' : 'border-dark-200 hover:border-dark-300'}`}
                >
                  <input type="radio" name="payment" value={method.id} checked={paymentMethod === method.id} onChange={(e) => setPaymentMethod(e.target.value)} className="hidden" />
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${paymentMethod === method.id ? 'border-primary bg-primary' : 'border-dark-300'}`}>
                    {paymentMethod === method.id && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <div className={`p-2.5 rounded-xl ${method.color}`}>
                    <method.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-dark-900">{method.label}</span>
                    <p className="text-xs text-dark-500">{method.subtitle}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-6 shadow-card border border-dark-200/50 sticky top-24">
            <h3 className="font-display font-bold text-dark-900 text-lg mb-5">Order Summary</h3>

            <div className="space-y-3 mb-5 max-h-48 overflow-y-auto scrollbar-thin">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm py-1.5">
                  <span className="text-dark-700 truncate mr-2 font-medium">{item.name} ×{item.quantity}</span>
                  <span className="font-bold text-dark-900 flex-shrink-0">{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-dark-200 pt-4 space-y-2.5 text-sm">
              <div className="flex justify-between text-dark-600">
                <span>Subtotal MRP</span><span>{formatCurrency(summary.subtotal)}</span>
              </div>
              <div className="flex justify-between text-dark-600">
                <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5" /> Direct Store Delivery</span>
                <span>{formatCurrency(summary.deliveryFee)}</span>
              </div>
              <div className="flex justify-between text-dark-600">
                <span>Excise Compliance & Platform Fee</span><span>{formatCurrency(summary.platformFee)}</span>
              </div>
              {summary.couponDiscount > 0 && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Discount Applied</span><span>-{formatCurrency(summary.couponDiscount)}</span>
                </div>
              )}
              <div className="border-t border-dark-200 pt-3 flex justify-between font-bold text-lg">
                <span>Total Payable</span><span className="text-primary">{formatCurrency(summary.total)}</span>
              </div>
            </div>

            <button
              onClick={handleInitiateOrder}
              disabled={isPlacing}
              className="w-full bg-primary text-white py-4 rounded-xl font-bold mt-6 hover:bg-primary-800 transition-all shadow-premium hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isPlacing ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Securing Order...</>
              ) : (
                <>⚡ Pay & Order Now — {formatCurrency(summary.total)}</>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 mt-4 text-xs text-dark-400">
              <ShieldCheck className="w-4 h-4 text-green-600" />
              <span>Razorpay 256-Bit SSL Encrypted</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── RAZORPAY PAYMENT GATEWAY MODAL SIMULATOR ───────────────── */}
      {showRazorpayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden animate-scale-in border border-dark-200">
            {/* Razorpay Brand Header */}
            <div className="bg-[#0c2340] px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center font-bold text-lg">
                  ₹
                </div>
                <div>
                  <h4 className="text-sm font-bold tracking-wide">Razorpay Checkout</h4>
                  <p className="text-[11px] text-blue-200">Merchant: Sip & Savor Retail</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-blue-200">Amount</p>
                <p className="text-base font-bold text-accent">{formatCurrency(summary.total)}</p>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {rzpStep === 'qr' && (
                <div className="text-center animate-fade-in">
                  <div className="flex items-center justify-between text-xs text-dark-500 mb-4 bg-dark-50 p-2.5 rounded-xl">
                    <span className="flex items-center gap-1"><Smartphone className="w-3.5 h-3.5" /> Scan with any UPI App</span>
                    <span className="font-bold text-red-500">Expires in: {formatTimer(upiTimer)}</span>
                  </div>

                  {/* QR Code Box */}
                  <div className="bg-white p-4 rounded-2xl border-2 border-dashed border-dark-300 inline-block shadow-sm my-2 relative">
                    <div className="w-48 h-48 bg-dark-900 rounded-xl p-3 flex flex-col items-center justify-center relative overflow-hidden">
                      {/* Stylized QR Code Matrix Visual */}
                      <div className="grid grid-cols-6 gap-1 w-full h-full p-2 bg-white rounded-lg">
                        {[...Array(36)].map((_, i) => (
                          <div 
                            key={i} 
                            className={`rounded-sm ${
                              i === 0 || i === 5 || i === 30 || i === 35 || i === 14 || i === 21 || i === 17 || i === 8 || i === 27 
                                ? 'bg-dark-900' 
                                : i % 3 === 0 
                                ? 'bg-dark-800' 
                                : 'bg-dark-100'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-white px-2 py-1 rounded-md shadow-md text-[10px] font-bold text-primary border border-dark-200">
                          S&S UPI
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* UPI Logos */}
                  <div className="flex justify-center items-center gap-3 my-4">
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded bg-blue-50 text-blue-700">Google Pay</span>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded bg-purple-50 text-purple-700">PhonePe</span>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded bg-cyan-50 text-cyan-700">Paytm</span>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded bg-dark-50 text-dark-700">CRED</span>
                  </div>

                  <button
                    onClick={handleApprovePayment}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3.5 rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2 mt-4"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    Simulate Instant UPI Approval (Test Mode)
                  </button>
                </div>
              )}

              {rzpStep === 'processing' && (
                <div className="py-12 text-center animate-fade-in">
                  <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                  <h4 className="text-lg font-bold text-dark-900">Authorizing Payment...</h4>
                  <p className="text-xs text-dark-500 mt-1">Verifying digital signature with Excise Payment Gateway</p>
                </div>
              )}

              {rzpStep === 'success' && (
                <div className="py-10 text-center animate-scale-in">
                  <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h4 className="text-xl font-bold text-dark-900">Payment Authorized!</h4>
                  <p className="text-xs text-dark-500 mt-1">Transaction ID: {rzpPaymentId}</p>
                  <p className="text-xs font-semibold text-green-700 mt-3">Redirecting to Live Order Tracking...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
