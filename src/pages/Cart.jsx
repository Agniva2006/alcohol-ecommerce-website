import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, Tag, X, Percent } from 'lucide-react';
import { useState } from 'react';
import useCartStore from '../store/cartStore';
import useToastStore from '../store/toastStore';
import { formatCurrency } from '../utils/helpers';
import ProductCard from '../components/product/ProductCard';
import useProductStore from '../store/productStore';

export default function Cart() {
  const { items, removeItem, updateQuantity, clearCart, applyCoupon, removeCoupon, getOrderSummary } = useCartStore();
  const totalItems = useCartStore((s) => s.totalItems);
  const toast = useToastStore();
  const [couponInput, setCouponInput] = useState('');
  const couponCode = useCartStore((s) => s.couponCode);

  const summary = getOrderSummary();

  const products = useProductStore((s) => s.products);

  // Suggested products (not in cart)
  const cartIds = items.map((i) => i.id);
  const suggestions = products.filter((p) => !cartIds.includes(p.id)).slice(0, 4);

  const handleApplyCoupon = () => {
    if (!couponInput.trim()) return;
    const result = applyCoupon(couponInput);
    if (result.success) {
      toast.success(result.message);
      setCouponInput('');
    } else {
      toast.error(result.message);
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    toast.info('Coupon removed');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center animate-fade-in-up">
          <div className="w-28 h-28 bg-dark-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-14 h-14 text-dark-400" />
          </div>
          <h2 className="text-2xl font-display font-bold text-dark-900 mb-2">Your cart is empty</h2>
          <p className="text-dark-500 mb-8 max-w-sm mx-auto">Looks like you haven't added anything yet. Browse our collection and find something you love.</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-primary-800 transition-colors shadow-premium"
          >
            <ArrowLeft className="w-4 h-4" />
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl md:text-3xl font-display font-bold text-dark-900">
          My Cart <span className="text-dark-500 text-lg font-normal">({totalItems} {totalItems === 1 ? 'item' : 'items'})</span>
        </h1>
        <button onClick={() => { clearCart(); toast.info('Cart cleared'); }} className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors">
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="bg-white rounded-xl p-4 shadow-card border border-dark-200/50 flex gap-4 animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <Link to={`/product/${item.id}`} className="flex-shrink-0">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-dark-50 rounded-lg overflow-hidden">
                  <img src={item.image} alt={item.name} className="w-full h-full object-contain p-2" />
                </div>
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/product/${item.id}`}>
                  <h3 className="font-semibold text-dark-900 truncate hover:text-primary transition-colors">{item.name}</h3>
                </Link>
                <p className="text-sm text-dark-500 mt-0.5">{item.volume}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-lg font-bold text-primary">{formatCurrency(item.price * item.quantity)}</span>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-dark-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-2 hover:bg-dark-50 transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-4 text-sm font-semibold min-w-[2rem] text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-2 hover:bg-dark-50 transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <button
                      onClick={() => { removeItem(item.id); toast.info('Removed from cart'); }}
                      className="p-2 text-dark-400 hover:text-red-500 transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Coupon Section */}
          <div className="bg-white rounded-xl p-5 shadow-card border border-dark-200/50">
            <div className="flex items-center gap-2 mb-3">
              <Tag className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-dark-900">Apply Coupon</h3>
            </div>
            {couponCode ? (
              <div className="flex items-center justify-between bg-primary-50 border border-primary-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Percent className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-primary">{couponCode}</span>
                  <span className="text-sm text-primary-700">— {formatCurrency(summary.couponDiscount)} off</span>
                </div>
                <button onClick={handleRemoveCoupon} className="text-dark-400 hover:text-red-500">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="Enter coupon code"
                  className="flex-1 px-4 py-2.5 border border-dark-200 rounded-lg focus:outline-none focus:border-primary text-sm uppercase"
                  onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                />
                <button
                  onClick={handleApplyCoupon}
                  className="px-6 py-2.5 bg-primary text-white rounded-lg font-medium text-sm hover:bg-primary-800 transition-colors"
                >
                  Apply
                </button>
              </div>
            )}
            <p className="text-xs text-dark-400 mt-2">Try: WHISKY20, FIRST50, SAVE10</p>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl p-6 shadow-card border border-dark-200/50 sticky top-24">
            <h3 className="font-display font-bold text-dark-900 text-lg mb-5">Order Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-dark-600">
                <span>Subtotal ({totalItems} items)</span>
                <span>{formatCurrency(summary.subtotal)}</span>
              </div>
              <div className="flex justify-between text-dark-600">
                <span>Delivery Fee</span>
                <span>{formatCurrency(summary.deliveryFee)}</span>
              </div>
              <div className="flex justify-between text-dark-600">
                <span>Platform Fee</span>
                <span>{formatCurrency(summary.platformFee)}</span>
              </div>
              {summary.couponDiscount > 0 && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Coupon Discount</span>
                  <span>-{formatCurrency(summary.couponDiscount)}</span>
                </div>
              )}
              <div className="border-t border-dark-200 pt-3 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">{formatCurrency(summary.total)}</span>
              </div>
            </div>
            <Link
              to="/checkout"
              className="block w-full bg-primary text-white text-center py-3.5 rounded-xl font-semibold mt-6 hover:bg-primary-800 transition-colors shadow-premium"
            >
              Proceed to Checkout
            </Link>
            <Link
              to="/"
              className="block w-full text-center text-primary font-medium text-sm mt-3 hover:underline"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-display font-bold text-dark-900 mb-6">You might also like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {suggestions.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
