import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronDown, ChevronUp, RotateCcw, Calendar } from 'lucide-react';
import useOrderStore from '../store/orderStore';
import useCartStore from '../store/cartStore';
import useToastStore from '../store/toastStore';
import { formatCurrency, formatDate } from '../utils/helpers';

const statusConfig = {
  delivered: { label: 'Delivered', classes: 'bg-green-100 text-green-800' },
  confirmed: { label: 'Ongoing', classes: 'bg-blue-100 text-blue-800' },
  cancelled: { label: 'Cancelled', classes: 'bg-red-100 text-red-800' },
  pending: { label: 'Pending', classes: 'bg-amber-100 text-amber-800' },
};

export default function OrderHistory() {
  const orders = useOrderStore((s) => s.orders);
  const fetchOrders = useOrderStore((s) => s.fetchOrders);
  const addItem = useCartStore((s) => s.addItem);
  const toast = useToastStore();
  const [activeTab, setActiveTab] = useState('all');
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'ongoing', label: 'Ongoing' },
    { id: 'completed', label: 'Completed' },
  ];

  const filteredOrders = orders.filter((o) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'ongoing') return o.status === 'confirmed' || o.status === 'pending';
    if (activeTab === 'completed') return o.status === 'delivered' || o.status === 'cancelled';
    return true;
  });

  const handleReorder = (order) => {
    order.items.forEach((item) => {
      addItem({ id: item.productId, name: item.name, price: item.price, volume: item.volume, image: '', quantity: 1 });
    });
    toast.success('Items added to cart!');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl md:text-3xl font-display font-bold text-dark-900 mb-6">Order History</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 bg-dark-100 p-1 rounded-xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === tab.id ? 'bg-primary text-white shadow-sm' : 'text-dark-600 hover:text-dark-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-16 animate-fade-in">
          <Package className="w-16 h-16 text-dark-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-dark-700 mb-1">No orders found</h3>
          <p className="text-dark-500 text-sm">You haven't placed any orders yet.</p>
          <Link to="/" className="inline-block mt-4 text-primary font-medium hover:underline">Browse Products</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order, index) => {
            const status = statusConfig[order.status] || statusConfig.pending;
            const isExpanded = expandedOrder === order.id;

            return (
              <div
                key={order.id}
                className="bg-white rounded-xl shadow-card border border-dark-200/50 overflow-hidden animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Order Header */}
                <button
                  onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-dark-50/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-bold text-dark-900">#{order.id}</span>
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${status.classes}`}>
                        {status.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-dark-500">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {formatDate(order.date)}</span>
                      <span>•</span>
                      <span>{order.items.length} item{order.items.length > 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-primary text-lg">{formatCurrency(order.total)}</span>
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-dark-400" /> : <ChevronDown className="w-5 h-5 text-dark-400" />}
                  </div>
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-dark-100 p-5 bg-dark-50/30 animate-fade-in">
                    <div className="space-y-2 mb-4">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-dark-700">{item.name} <span className="text-dark-400">×{item.quantity}</span></span>
                          <span className="font-medium text-dark-800">{formatCurrency(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-dark-200 pt-3 space-y-1 text-sm text-dark-500">
                      <div className="flex justify-between"><span>Delivery Fee</span><span>{formatCurrency(order.deliveryFee)}</span></div>
                      <div className="flex justify-between"><span>Platform Fee</span><span>{formatCurrency(order.platformFee)}</span></div>
                      <div className="flex justify-between font-medium text-dark-800 pt-1 border-t border-dark-200 mt-2">
                        <span>Total</span><span>{formatCurrency(order.total)}</span>
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-dark-400">
                      <p>Payment: {order.paymentMethod} • Address: {order.address}</p>
                    </div>

                    {order.status === 'delivered' && (
                      <button
                        onClick={() => handleReorder(order)}
                        className="mt-4 flex items-center gap-2 px-5 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-800 transition-colors"
                      >
                        <RotateCcw className="w-4 h-4" /> Reorder
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
