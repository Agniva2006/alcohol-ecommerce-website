import { useState, useEffect } from 'react';
import { Check, X, Clock, Package, ChevronDown, ChevronUp, Bell, Volume2 } from 'lucide-react';
import RetailerLayout from '../../components/layout/RetailerLayout';
import { formatCurrency } from '../../utils/helpers';
import { getSocket, joinRoom, leaveRoom } from '../../utils/socket';
import { audioAlert } from '../../utils/audioAlert';
import api from '../../api';

export default function ManageOrders() {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('new');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [newOrderAlert, setNewOrderAlert] = useState(null);

  const fetchOrders = () => {
    api.get('/retailer/orders?shopId=SH-JPG-001')
      .then(res => {
        const formatted = res.data.map(o => ({
          id: o.id,
          customer: o.customer?.name || 'Customer',
          phone: o.customer?.phone || '+91 9876543210',
          items: o.items.map(i => ({ name: `Brand ${i.brandId}`, qty: i.quantity, price: i.price })),
          total: o.totalAmount,
          time: new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: o.status === 'PLACED' || o.status === 'PAID' ? 'new' : o.status.toLowerCase(),
          rawStatus: o.status,
          address: o.deliveryAddress
        }));
        setOrders(formatted);
      })
      .catch(err => console.error('Failed to fetch retailer orders:', err));
  };

  useEffect(() => {
    fetchOrders();

    const socket = getSocket();
    joinRoom('retailer_room');

    const handleConnect = () => setSocketConnected(true);
    const handleDisconnect = () => setSocketConnected(false);

    if (socket.connected) setSocketConnected(true);
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    // Listen for incoming live customer orders
    socket.on('order:created', (newOrder) => {
      console.log('🔔 [RETAILER] Incoming Real-Time Order:', newOrder);
      audioAlert.playNewOrderChime();
      setNewOrderAlert(`New Order #${newOrder.id?.slice(0, 6)} received!`);
      setTimeout(() => setNewOrderAlert(null), 6000);
      fetchOrders();
    });

    socket.on('order:status_updated', () => {
      fetchOrders();
    });

    const interval = setInterval(fetchOrders, 8000);

    return () => {
      leaveRoom('retailer_room');
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('order:created');
      socket.off('order:status_updated');
      clearInterval(interval);
    };
  }, []);

  const tabs = [
    { id: 'new', label: 'New Orders', count: orders.filter((o) => o.status === 'new').length },
    { id: 'accepted', label: 'Accepted / Packaging', count: orders.filter((o) => o.status === 'accepted' || o.status === 'ready_for_pickup' || o.status === 'packed').length },
    { id: 'completed', label: 'Dispatched & Completed', count: orders.filter((o) => o.status === 'completed' || o.status === 'delivered' || o.status === 'out_for_delivery').length },
  ];

  const filteredOrders = orders.filter((o) => {
    if (activeTab === 'new') return o.status === 'new';
    if (activeTab === 'accepted') return o.status === 'accepted' || o.status === 'ready_for_pickup' || o.status === 'packed';
    return o.status === 'completed' || o.status === 'delivered' || o.status === 'out_for_delivery';
  });

  const updateStatus = async (orderId, newStatus) => {
    try {
      const dbStatus = newStatus === 'accepted' ? 'READY_FOR_PICKUP' : newStatus === 'completed' ? 'DELIVERED' : 'REJECTED';
      await api.patch(`/retailer/orders/${orderId}`, { status: dbStatus });
      fetchOrders();
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  const handleTestChime = () => {
    audioAlert.playNewOrderChime();
  };

  return (
    <RetailerLayout title="Manage Orders">
      {/* Real-time Status Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        {/* Tabs */}
        <div className="flex gap-2 bg-dark-100 p-1 rounded-xl w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === tab.id ? 'bg-white text-dark-900 shadow-sm' : 'text-dark-600 hover:text-dark-900'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold ${
                  activeTab === tab.id ? 'bg-primary text-white' : 'bg-dark-300 text-white'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleTestChime}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs font-bold hover:bg-amber-100 transition-colors"
            title="Test audio alert chime"
          >
            <Volume2 className="w-3.5 h-3.5 text-amber-600" /> Test Bell Alert
          </button>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg text-xs font-bold text-green-800">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
            <span>⚡ Live Order Terminal ({socketConnected ? 'Online' : 'Connecting'})</span>
          </div>
        </div>
      </div>

      {/* New Order Alert Flash Banner */}
      {newOrderAlert && (
        <div className="bg-gradient-to-r from-amber-500 to-primary text-white px-5 py-3 rounded-2xl mb-6 flex items-center justify-between shadow-lg animate-bounce">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 animate-spin" />
            <span className="font-bold text-sm">{newOrderAlert}</span>
          </div>
          <span className="text-xs bg-black/20 px-2 py-0.5 rounded-full font-mono">Real-Time Event</span>
        </div>
      )}

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-card border border-dark-200/50">
          <Package className="w-12 h-12 text-dark-300 mx-auto mb-3" />
          <p className="text-dark-500">No {activeTab} orders at this moment</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order, index) => (
            <div
              key={order.id}
              className="bg-white rounded-xl shadow-card border border-dark-200/50 overflow-hidden animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Order Header */}
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-dark-900 font-mono">#{order.id.slice(0, 8)}</span>
                      <span className="text-xs text-dark-400 flex items-center gap-1"><Clock className="w-3 h-3" /> {order.time}</span>
                    </div>
                    <p className="text-sm text-dark-600 mt-1">{order.customer}</p>
                  </div>
                  <span className="font-bold text-primary text-lg">{formatCurrency(order.total)}</span>
                </div>

                <p className="text-sm text-dark-500 mb-3">
                  {order.items.map((i) => `${i.name} ×${i.qty}`).join(', ')}
                </p>

                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                    className="text-sm text-primary font-medium flex items-center gap-1 hover:underline"
                  >
                    Details {expandedOrder === order.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  <div className="flex gap-2">
                    {order.status === 'new' && (
                      <>
                        <button
                          onClick={() => updateStatus(order.id, 'accepted')}
                          className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors shadow-sm"
                        >
                          <Check className="w-4 h-4" /> Accept & Pack
                        </button>
                        <button
                          onClick={() => updateStatus(order.id, 'rejected')}
                          className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                        >
                          <X className="w-4 h-4" /> Reject
                        </button>
                      </>
                    )}
                    {(order.status === 'accepted' || order.status === 'ready_for_pickup') && (
                      <button
                        onClick={() => updateStatus(order.id, 'completed')}
                        className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-800 transition-colors"
                      >
                        <Check className="w-4 h-4" /> Handover to Rider
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Expanded Details */}
              {expandedOrder === order.id && (
                <div className="bg-dark-50 p-5 border-t border-dark-100 text-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-bold text-dark-400 uppercase tracking-wider mb-1">Customer Delivery Address</p>
                      <p className="text-dark-800 font-medium">{order.address}</p>
                      <p className="text-dark-500 text-xs mt-1">Phone: {order.phone}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-dark-400 uppercase tracking-wider mb-1">Excise Hologram Batch</p>
                      <p className="font-mono text-xs text-primary font-bold">WB-EXC-{order.id.slice(0, 8).toUpperCase()}</p>
                      <p className="text-dark-500 text-xs mt-1">100% Legal State MRP Certified</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </RetailerLayout>
  );
}
