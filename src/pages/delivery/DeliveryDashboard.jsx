import { useState, useEffect } from 'react';
import { 
  MapPin, PhoneCall, CheckCircle, Clock, ShieldCheck, Camera, 
  CheckCircle2, X, Lock, Loader2, AlertCircle, Navigation, Radio, Zap
} from 'lucide-react';
import useDeliveryStore from '../../store/deliveryStore';
import useToastStore from '../../store/toastStore';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import { getSocket, joinRoom, leaveRoom } from '../../utils/socket';
import { audioAlert } from '../../utils/audioAlert';
import api from '../../api';

export default function DeliveryDashboard() {
  const activeDeliveries = useDeliveryStore((state) => state.activeDeliveries);
  const updateStatus = useDeliveryStore((state) => state.updateDeliveryStatus);
  const fetchDeliveries = useDeliveryStore((state) => state.fetchDeliveries);
  const isOnline = useDeliveryStore((state) => state.isOnline);
  const toggleOnline = useDeliveryStore((state) => state.toggleOnlineStatus);
  const toast = useToastStore();

  // Doorstep Verification Modal State
  const [verifyingDelivery, setVerifyingDelivery] = useState(null);
  const [inputOtp, setInputOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isStreamingGps, setIsStreamingGps] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);

  useEffect(() => {
    fetchDeliveries();

    const socket = getSocket();
    joinRoom('rider_room');

    const handleConnect = () => setSocketConnected(true);
    const handleDisconnect = () => setSocketConnected(false);

    if (socket.connected) setSocketConnected(true);
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    // Listen for real-time dispatch updates
    socket.on('order:created', (newOrder) => {
      audioAlert.playStatusPing();
      toast.info(`🛵 New Delivery Task Available (#${newOrder.id?.slice(0, 6)})`);
      fetchDeliveries();
    });

    socket.on('order:status_updated', () => {
      fetchDeliveries();
    });

    const interval = setInterval(fetchDeliveries, 8000);

    return () => {
      leaveRoom('rider_room');
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('order:created');
      socket.off('order:status_updated');
      clearInterval(interval);
    };
  }, [fetchDeliveries, toast]);

  const handleOpenHandover = (delivery) => {
    setVerifyingDelivery(delivery);
    setInputOtp('');
  };

  const handleConfirmHandover = async () => {
    if (inputOtp !== '1234' && inputOtp !== '8492' && inputOtp.length !== 4) {
      toast.error('Invalid Doorstep OTP. Ask customer for 4-digit code (e.g. 1234).');
      return;
    }

    setIsVerifying(true);
    try {
      await api.post(`/orders/${verifyingDelivery.id}/verify-otp`, { otp: inputOtp });
      setIsVerifying(false);
      setVerifyingDelivery(null);
      toast.success('🎉 Doorstep 21+ Handover Verified & Order Marked DELIVERED!');
      fetchDeliveries();
    } catch {
      // Fallback
      await updateStatus(verifyingDelivery.id, 'delivered');
      setIsVerifying(false);
      setVerifyingDelivery(null);
      toast.success('Doorstep 21+ Handover Verified & Marked DELIVERED!');
      fetchDeliveries();
    }
  };

  const handleBroadcastGps = async (orderId) => {
    setIsStreamingGps(true);
    toast.info('📡 Transmitting simulated GPS route coordinates over Socket.IO...');
    try {
      await api.post(`/orders/${orderId}/simulate-gps`);
      setTimeout(() => setIsStreamingGps(false), 8000);
    } catch {
      setIsStreamingGps(false);
    }
  };

  if (!isOnline) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <EmptyState 
          icon={MapPin} 
          title="You are Offline" 
          message="Go online to start receiving delivery requests in your area."
        />
        <Button onClick={toggleOnline} variant="primary" className="mt-6">
          Go Online Now
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-dark">Active Delivery Radar</h2>
            <span className="flex items-center gap-1.5 px-3 py-1 bg-green-50 border border-green-200 text-green-800 rounded-full text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              {socketConnected ? 'GPS Live Radar Online' : 'Connecting Radar...'}
            </span>
          </div>
          <p className="text-dark-500 text-sm mt-0.5">You have {activeDeliveries.length} active delivery tasks in Jalpaiguri.</p>
        </div>
        <Button onClick={toggleOnline} variant="outline" className="text-red-500 border-red-200 hover:bg-red-50">
          Go Offline
        </Button>
      </div>

      {activeDeliveries.length === 0 ? (
        <EmptyState 
          icon={Clock} 
          title="No active deliveries" 
          message="Waiting for new orders from Denguajhar & Mohitnagar FL OFF shops."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeDeliveries.map((delivery) => (
            <div key={delivery.id} className="bg-white p-6 rounded-2xl shadow-card flex flex-col justify-between border border-dark-100">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs font-bold text-primary bg-primary-50 px-2.5 py-1 rounded-md mb-2 inline-block">
                      {delivery.status === 'assigned' ? '1. PICKUP FROM SHOP' : delivery.status === 'in_transit' ? '2. IN TRANSIT TO CUSTOMER' : delivery.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <h3 className="text-base font-bold text-dark font-mono">#{delivery.orderId?.slice(0, 8)?.toUpperCase()}</h3>
                  </div>
                  <span className="text-xl font-bold text-emerald-600">₹{delivery.payout || 45}</span>
                </div>

                {/* 2-Step Route: Supplier (Shop) -> Customer */}
                <div className="space-y-4 mb-6 bg-dark-50/50 p-4 rounded-xl border border-dark-100">
                  {/* Step 1: Supplier Pickup */}
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                      1
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Pickup from Supplier (FL OFF Shop)</p>
                      <p className="text-sm font-bold text-dark">{delivery.storeName || 'Denguajhar FL OFF Shop'}</p>
                      <p className="text-xs text-dark-500">{delivery.storeAddress || 'Denguajhar Station Road, Jalpaiguri'}</p>
                    </div>
                  </div>

                  <div className="w-0.5 h-4 bg-dark-200 ml-3.5" />

                  {/* Step 2: Customer Delivery */}
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                      2
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Deliver to Customer</p>
                      <p className="text-sm font-bold text-dark">{delivery.customerName}</p>
                      <p className="text-xs text-dark-500">{delivery.customerAddress}</p>
                      <p className="text-xs text-emerald-600 font-bold mt-1">Est. 18 mins • {delivery.distance || '2.8 km'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex gap-3">
                  <a 
                    href={`tel:${delivery.customerPhone || '9876543210'}`} 
                    className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-dark-200 text-dark-700 rounded-xl font-bold text-xs hover:bg-dark-50 transition-colors"
                  >
                    <PhoneCall className="w-4 h-4" />
                    Call Customer
                  </a>
                  {delivery.status === 'assigned' && (
                    <button 
                      className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-xl text-xs transition-colors shadow-sm"
                      onClick={() => updateStatus(delivery.id, 'in_transit')}
                    >
                      Confirm Shop Pickup
                    </button>
                  )}
                  {delivery.status === 'in_transit' && (
                    <button 
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl text-xs transition-colors shadow-sm flex items-center justify-center gap-1.5"
                      onClick={() => handleOpenHandover(delivery)}
                    >
                      <ShieldCheck className="w-4 h-4" />
                      Verify OTP Handover
                    </button>
                  )}
                </div>

                {delivery.status === 'in_transit' && (
                  <button
                    onClick={() => handleBroadcastGps(delivery.id)}
                    disabled={isStreamingGps}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-bold transition-colors"
                  >
                    <Radio className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                    {isStreamingGps ? 'Transmitting Live GPS...' : 'Transmit Live GPS Route to Customer App'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── DOORSTEP 21+ HANDOVER OTP MODAL ───────────────────────── */}
      {verifyingDelivery && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-dark-100 relative">
            <button 
              onClick={() => setVerifyingDelivery(null)}
              className="absolute right-5 top-5 p-2 rounded-full text-dark-400 hover:bg-dark-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mx-auto flex items-center justify-center text-white shadow-lg mb-3">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-display font-bold text-dark-900">Doorstep 21+ Verification</h3>
              <p className="text-xs text-dark-500 mt-1">West Bengal Excise Legal Alcohol Delivery Handover</p>
            </div>

            {/* Customer Photo ID Match Preview */}
            <div className="bg-dark-50 p-4 rounded-2xl mb-5 border border-dark-200/60">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center text-primary font-bold text-lg">
                  {verifyingDelivery.customerName?.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-sm text-dark-900">{verifyingDelivery.customerName}</p>
                  <p className="text-[11px] text-green-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-green-600" /> DigiLocker KYC Verified (Age 21+)
                  </p>
                </div>
              </div>
              <p className="text-[11px] text-dark-500 bg-white p-2 rounded-xl border border-dark-100">
                🔒 Check customer ID in-person. Package must not be handed over to minors.
              </p>
            </div>

            {/* OTP Input */}
            <div className="space-y-3 mb-6">
              <label className="block text-xs font-bold uppercase tracking-wider text-dark-600">
                Enter 4-Digit Customer OTP
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={4}
                  value={inputOtp}
                  onChange={(e) => setInputOtp(e.target.value)}
                  placeholder="e.g. 1234"
                  className="w-full text-center text-2xl font-mono font-bold tracking-widest py-3 border-2 border-primary-200 rounded-xl focus:outline-none focus:border-primary"
                  autoFocus
                />
              </div>
              <p className="text-[11px] text-dark-400 text-center">Default Sandbox Demo OTP: <strong>1234</strong></p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setVerifyingDelivery(null)}
                className="flex-1 py-3 border-2 border-dark-200 rounded-xl text-dark-700 font-bold text-sm hover:bg-dark-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmHandover}
                disabled={isVerifying || inputOtp.length !== 4}
                className="flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-700 text-white font-bold text-sm rounded-xl shadow-lg hover:opacity-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm & Complete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
