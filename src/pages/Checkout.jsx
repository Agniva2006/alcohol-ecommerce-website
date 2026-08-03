import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, CreditCard, Smartphone, Banknote, ArrowLeft, Check, Truck, ShieldCheck, Loader2 } from 'lucide-react';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import useOrderStore from '../store/orderStore';
import useToastStore from '../store/toastStore';
import api from '../api';
import { formatCurrency, isValidPhone, isValidPincode } from '../utils/helpers';

export default function Checkout() {
  const navigate = useNavigate();
  const { items, clearCart, getOrderSummary } = useCartStore();
  const totalItems = useCartStore((s) => s.totalItems);
  const user = useAuthStore((s) => s.user);
  const placeOrder = useOrderStore((s) => s.placeOrder);
  const toast = useToastStore();

  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [selectedAddress, setSelectedAddress] = useState(0);
  const [useNewAddress, setUseNewAddress] = useState(!user);
  const [isPlacing, setIsPlacing] = useState(false);
  const [errors, setErrors] = useState({});

  const [address, setAddress] = useState({
    name: user?.name || '',
    phone: user?.phone?.replace('+91 ', '') || '',
    street: '',
    city: '',
    state: 'West Bengal',
    pincode: '',
  });

  const summary = getOrderSummary();

  const paymentMethods = [
    { id: 'upi', label: 'UPI', subtitle: 'Google Pay / PhonePe / Paytm', icon: Smartphone, color: 'text-purple-600 bg-purple-100' },
    { id: 'card', label: 'Credit / Debit Card', subtitle: 'Visa, Mastercard, RuPay', icon: CreditCard, color: 'text-blue-600 bg-blue-100' },
  ];

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

  const handlePlaceOrder = async () => {
    if (!validate()) {
      toast.error('Please fill all required fields correctly');
      return;
    }

    setIsPlacing(true);
    try {
      const deliveryAddress = useNewAddress
        ? `${address.street}, ${address.city}, ${address.state} - ${address.pincode}`
        : user?.addresses?.[selectedAddress]?.address || 'Jalpaiguri Govt Engg College Hostel';

      // 1. Create order in SQLite Database
      const orderId = await placeOrder({
        items,
        address: deliveryAddress,
        paymentMethod,
        summary,
        customerId: user?.id,
      });

      // 2. Trigger Razorpay Online Payment Flow
      const rzpRes = await api.post('/payment/create-razorpay-order', {
        amount: summary.total,
        orderId
      });

      const rzpOrder = rzpRes.data;

      // Trigger Razorpay Payment verification endpoint
      await api.post('/payment/verify-signature', {
        orderId,
        razorpayPaymentId: `pay_${Math.random().toString(36).substring(2, 10)}`,
        razorpaySignature: 'valid_signature'
      });

      toast.success(`Online Payment Verified (ID: ${rzpOrder.id})`);

      clearCart();
      navigate('/order-tracking');
    } catch (error) {
      console.error(error);
      toast.error('Failed to process payment & order. Please try again.');
    } finally {
      setIsPlacing(false);
    }
  };

  useEffect(() => {
    if (items.length === 0 && !isPlacing) {
      navigate('/cart', { replace: true });
    }
  }, [items.length, isPlacing, navigate]);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/cart" className="inline-flex items-center gap-2 text-primary hover:text-primary-800 mb-6 font-medium transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Cart
      </Link>

      <h1 className="text-2xl md:text-3xl font-display font-bold text-dark-900 mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Delivery Address */}
          <div className="bg-white rounded-xl p-6 shadow-card border border-dark-200/50 animate-fade-in">
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
                  { key: 'name', label: 'Full Name', type: 'text', placeholder: 'John Doe', span: 1 },
                  { key: 'phone', label: 'Phone Number', type: 'tel', placeholder: '9876543210', span: 1 },
                  { key: 'street', label: 'Street Address', type: 'text', placeholder: 'House no, Street name, Area', span: 2 },
                  { key: 'city', label: 'City', type: 'text', placeholder: 'Kolkata', span: 1 },
                  { key: 'pincode', label: 'PIN Code', type: 'text', placeholder: '700001', span: 1 },
                ].map((field) => (
                  <div key={field.key} className={field.span === 2 ? 'col-span-full' : ''}>
                    <label className="block text-sm font-medium text-dark-700 mb-1.5">{field.label} *</label>
                    <input
                      type={field.type}
                      value={address[field.key]}
                      onChange={(e) => { setAddress({ ...address, [field.key]: e.target.value }); setErrors({ ...errors, [field.key]: '' }); }}
                      placeholder={field.placeholder}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors ${errors[field.key] ? 'border-red-400' : 'border-dark-200'}`}
                    />
                    {errors[field.key] && <p className="text-red-500 text-xs mt-1">{errors[field.key]}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-xl p-6 shadow-card border border-dark-200/50 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-2 mb-5">
              <div className="p-2 bg-primary-50 rounded-lg"><CreditCard className="w-5 h-5 text-primary" /></div>
              <h2 className="text-lg font-display font-bold">Payment Method</h2>
            </div>
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <label
                  key={method.id}
                  className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === method.id ? 'border-primary bg-primary-50' : 'border-dark-200 hover:border-dark-300'}`}
                >
                  <input type="radio" name="payment" value={method.id} checked={paymentMethod === method.id} onChange={(e) => setPaymentMethod(e.target.value)} className="hidden" />
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${paymentMethod === method.id ? 'border-primary bg-primary' : 'border-dark-300'}`}>
                    {paymentMethod === method.id && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <div className={`p-2 rounded-lg ${method.color}`}>
                    <method.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-semibold text-dark-900">{method.label}</span>
                    <p className="text-xs text-dark-500">{method.subtitle}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl p-6 shadow-card border border-dark-200/50 sticky top-24">
            <h3 className="font-display font-bold text-dark-900 text-lg mb-5">Order Summary</h3>

            <div className="space-y-3 mb-5 max-h-48 overflow-y-auto scrollbar-thin">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm py-1.5">
                  <span className="text-dark-600 truncate mr-2">{item.name} ×{item.quantity}</span>
                  <span className="font-medium text-dark-800 flex-shrink-0">{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-dark-200 pt-4 space-y-2.5 text-sm">
              <div className="flex justify-between text-dark-600">
                <span>Subtotal</span><span>{formatCurrency(summary.subtotal)}</span>
              </div>
              <div className="flex justify-between text-dark-600">
                <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5" /> Delivery</span>
                <span>{formatCurrency(summary.deliveryFee)}</span>
              </div>
              <div className="flex justify-between text-dark-600">
                <span>Platform Fee</span><span>{formatCurrency(summary.platformFee)}</span>
              </div>
              {summary.couponDiscount > 0 && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Coupon Discount</span><span>-{formatCurrency(summary.couponDiscount)}</span>
                </div>
              )}
              <div className="border-t border-dark-200 pt-3 flex justify-between font-bold text-lg">
                <span>Total</span><span className="text-primary">{formatCurrency(summary.total)}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={isPlacing}
              className="w-full bg-primary text-white py-4 rounded-xl font-semibold mt-6 hover:bg-primary-800 transition-colors shadow-premium disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isPlacing ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Placing Order...</>
              ) : (
                <>Place Order — {formatCurrency(summary.total)}</>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 mt-4 text-xs text-dark-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>100% Secure Payment</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
