import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, Truck, CheckCircle, Clock, MapPin, Phone, MessageCircle, Star, 
  ShieldCheck, FileText, ArrowLeft, Copy, Check, Navigation, AlertCircle, Zap, Activity
} from 'lucide-react';
import useOrderStore from '../store/orderStore';
import useToastStore from '../store/toastStore';
import { formatCurrency } from '../utils/helpers';
import { getSocket, joinRoom, leaveRoom } from '../utils/socket';
import { audioAlert } from '../utils/audioAlert';
import api from '../api';

export default function OrderTracking() {
  const navigate = useNavigate();
  const activeOrder = useOrderStore((s) => s.activeOrder);
  const trackingStep = useOrderStore((s) => s.trackingStep);
  const advanceTracking = useOrderStore((s) => s.advanceTracking);
  const toast = useToastStore();

  const [eta, setEta] = useState(22);
  const [copiedOtp, setCopiedOtp] = useState(false);
  const [deliveryOtp, setDeliveryOtp] = useState('1234');
  const [isSimulatingGps, setIsSimulatingGps] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [liveGpsStep, setLiveGpsStep] = useState(null);
  const [hologramId, setHologramId] = useState('WB-EXC-99887766');

  const order = activeOrder || {
    id: 'ff1fafcd-d52c-4e7b-a36c-0691e5246b97',
    total: 400,
    address: 'Jalpaiguri Govt Engineering College, Hostel No. 3, Jalpaiguri 735102',
  };

  // Socket.IO Real-Time Connection
  useEffect(() => {
    const socket = getSocket();
    const orderRoom = `order_${order.id}`;

    const handleConnect = () => setSocketConnected(true);
    const handleDisconnect = () => setSocketConnected(false);

    if (socket.connected) {
      setSocketConnected(true);
    }

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    joinRoom(orderRoom);

    // Listen for live status changes from Retailer or Rider
    socket.on('order:status_updated', (updatedOrder) => {
      if (updatedOrder && updatedOrder.id === order.id) {
        audioAlert.playStatusPing();
        toast.info(`⚡ Status Update: Order #${order.id.slice(0, 6)} is now ${updatedOrder.status}`);
        advanceTracking();
      }
    });

    // Listen for live GPS coordinates streamed from Rider
    socket.on('rider:location_update', (gpsData) => {
      setLiveGpsStep(gpsData);
      if (gpsData.etaMinutes) {
        setEta(gpsData.etaMinutes);
      }
    });

    return () => {
      leaveRoom(orderRoom);
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('order:status_updated');
      socket.off('rider:location_update');
    };
  }, [order.id, advanceTracking, toast]);

  // Fetch initial telemetry from backend if available
  useEffect(() => {
    if (order.id) {
      api.get(`/orders/${order.id}/track`)
        .then((res) => {
          if (res.data) {
            if (res.data.otp) setDeliveryOtp(res.data.otp);
            if (res.data.hologramId) setHologramId(res.data.hologramId);
            if (res.data.estimatedDeliveryMinutes) setEta(res.data.estimatedDeliveryMinutes);
          }
        })
        .catch(() => {});
    }
  }, [order.id]);

  const steps = [
    { id: 1, label: 'Order Confirmed & Paid', description: 'Excise digital signature verified via Razorpay', icon: CheckCircle, time: 'Just now' },
    { id: 2, label: 'Store Packaging & Hologram Check', description: 'FL OFF Shop scanned bottle batch & excise barcode', icon: Package, time: '1 min ago' },
    { id: 3, label: 'Rider Assigned & Reached Store', description: 'Delivery partner arrived at store counter', icon: Truck, time: '3 mins ago' },
    { id: 4, label: 'Out for Delivery (Live GPS)', description: 'Rider en route to your hostel doorstep', icon: Navigation, time: 'In transit' },
    { id: 5, label: 'Doorstep 21+ Handover Complete', description: 'Face matched & alcohol package delivered safely', icon: CheckCircle, time: 'Done' },
  ];

  const rider = {
    name: 'Rohan Sharma',
    phone: '+91 98321 45678',
    vehicle: 'Hero Electric (WB-74-E-1234)',
    rating: 4.9,
    trips: '1,420 deliveries',
  };

  const handleCopyOtp = () => {
    navigator.clipboard.writeText(deliveryOtp);
    setCopiedOtp(true);
    toast.success('Doorstep OTP copied to clipboard');
    setTimeout(() => setCopiedOtp(false), 2000);
  };

  const handleTriggerGpsSimulation = async () => {
    setIsSimulatingGps(true);
    toast.info('⚡ Streaming Real-Time Rider GPS coordinates over Socket.IO...');
    try {
      await api.post(`/orders/${order.id}/simulate-gps`);
      setTimeout(() => setIsSimulatingGps(false), 10000);
    } catch {
      setIsSimulatingGps(false);
    }
  };

  const handleDownloadInvoice = () => {
    toast.info(`Official West Bengal Excise Invoice (${hologramId}) generated.`);
  };

  // Calculate moving rider position
  let riderProgress = '45%';
  if (liveGpsStep) {
    riderProgress = `${Math.min(90, 20 + (liveGpsStep.step / liveGpsStep.totalSteps) * 70)}%`;
  } else if (trackingStep === 1) riderProgress = '22%';
  else if (trackingStep === 2) riderProgress = '35%';
  else if (trackingStep === 3) riderProgress = '52%';
  else if (trackingStep === 4) riderProgress = '72%';
  else if (trackingStep >= 5) riderProgress = '88%';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={() => navigate('/')} 
          className="inline-flex items-center gap-2 text-primary hover:text-primary-800 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Store
        </button>

        {/* Live Real-Time Socket Indicator */}
        <div className="flex items-center gap-2 px-3 py-1 bg-dark-100 rounded-full text-xs font-semibold">
          <span className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`} />
          <span className="text-dark-700">{socketConnected ? '⚡ Real-Time Socket Connected' : 'Connecting WebSocket...'}</span>
        </div>
      </div>

      {/* Order Status Banner */}
      <div className="bg-white rounded-3xl shadow-card border border-dark-200/50 p-6 sm:p-8 mb-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <h1 className="text-2xl font-display font-bold text-dark-900">
                Order #{order.id?.slice(0, 8)?.toUpperCase()}
              </h1>
              <span className="bg-green-100 text-green-800 px-3 py-0.5 rounded-full text-xs font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
                Live Radar
              </span>
            </div>
            <p className="text-dark-500 text-sm">
              Estimated Delivery: <strong className="text-primary font-bold">{trackingStep >= 5 ? 'Delivered' : `${eta} mins`}</strong>
              <span className="text-xs text-dark-400 ml-3">Excise Hologram: <code className="bg-dark-100 px-1.5 py-0.5 rounded font-mono text-dark-800">{hologramId}</code></span>
            </p>
          </div>

          {/* Doorstep Delivery OTP Badge */}
          <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-3.5 rounded-2xl border border-primary/20 flex items-center gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-wider font-bold text-primary-800">Doorstep Handover OTP</p>
              <p className="text-2xl font-mono font-bold text-primary tracking-widest">{deliveryOtp}</p>
            </div>
            <button 
              onClick={handleCopyOtp}
              className="p-2 rounded-xl bg-white shadow-sm hover:bg-primary-50 text-primary transition-colors"
              title="Copy OTP"
            >
              {copiedOtp ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative">
          <div className="h-2.5 bg-dark-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary via-accent to-green-500 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${(Math.min(trackingStep, 5) / 5) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] font-bold text-dark-500 mt-2">
            <span>Placed</span>
            <span>Packaging</span>
            <span>Picked Up</span>
            <span>In Transit</span>
            <span>Delivered</span>
          </div>
        </div>
      </div>

      {/* ─── LIVE GPS RADAR MAP ───────────────────────────── */}
      <div className="bg-white rounded-3xl shadow-card border border-dark-200/50 p-6 mb-6 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="font-display font-bold text-dark-900 text-lg flex items-center gap-2">
              <Navigation className="w-5 h-5 text-primary" /> Live GPS Delivery Map
            </h2>
            <p className="text-xs text-dark-500">Denguajhar FL OFF Shop → JGEC Campus (2.8 km corridor)</p>
          </div>

          <button
            onClick={handleTriggerGpsSimulation}
            disabled={isSimulatingGps}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-primary-800 text-white font-bold text-xs shadow-md hover:opacity-95 transition-all disabled:opacity-50"
          >
            <Zap className="w-3.5 h-3.5 text-accent animate-spin" />
            {isSimulatingGps ? 'Streaming GPS Route...' : 'Simulate Live Rider GPS Stream'}
          </button>
        </div>

        <div className="relative bg-gradient-to-br from-slate-900 via-dark-900 to-indigo-950 rounded-2xl h-72 flex items-center justify-center overflow-hidden border border-white/10 shadow-inner">
          {/* Stylized Street Grid Lines */}
          <div className="absolute inset-0 opacity-15">
            <div className="w-full h-full" style={{
              backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }} />
          </div>

          {/* Route path dashed line */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <path 
              d="M 120 180 Q 250 80, 480 140" 
              fill="none" 
              stroke="#22d3ee" 
              strokeWidth="4" 
              strokeDasharray="8 6" 
              className="animate-pulse"
            />
          </svg>

          {/* Store Pin (Left) */}
          <div className="absolute left-16 bottom-14 flex flex-col items-center">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-dark flex items-center justify-center font-bold text-lg shadow-lg border-2 border-white">
              🏬
            </div>
            <span className="text-[10px] font-bold text-white bg-black/70 px-2 py-0.5 rounded-full mt-1">
              FL OFF Counter
            </span>
          </div>

          {/* Moving Rider Pin (Dynamic position based on WebSocket stream) */}
          <div 
            className="absolute flex flex-col items-center transition-all duration-700 z-20"
            style={{
              left: riderProgress,
              top: '32%'
            }}
          >
            <div className="relative">
              <span className="animate-ping absolute inset-0 rounded-full bg-primary-400 opacity-75"></span>
              <div className="w-12 h-12 rounded-full gradient-primary text-white flex items-center justify-center text-xl shadow-2xl border-2 border-white relative z-10">
                🛵
              </div>
            </div>
            <span className="text-[10px] font-bold text-dark bg-accent px-2 py-0.5 rounded-full mt-1 shadow-md whitespace-nowrap">
              Rohan {liveGpsStep ? `(${liveGpsStep.speed} km/h • ETA ${liveGpsStep.etaMinutes}m)` : '(In Transit)'}
            </span>
          </div>

          {/* Customer Destination Pin (Right) */}
          <div className="absolute right-16 top-16 flex flex-col items-center">
            <div className="w-10 h-10 rounded-2xl bg-green-500 text-white flex items-center justify-center font-bold text-lg shadow-lg border-2 border-white">
              📍
            </div>
            <span className="text-[10px] font-bold text-white bg-black/70 px-2 py-0.5 rounded-full mt-1">
              JGEC Hostel 3
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tracking Steps Timeline */}
        <div className="bg-white rounded-3xl shadow-card border border-dark-200/50 p-6 sm:p-7">
          <h2 className="font-display font-bold text-dark-900 text-lg mb-6">Excise Delivery Milestones</h2>
          <div className="space-y-2">
            {steps.map((step, index) => {
              const isCompleted = index < trackingStep;
              const isCurrent = index === trackingStep - 1;
              const Icon = step.icon;

              return (
                <div key={step.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                        isCompleted ? 'bg-primary text-white shadow-premium' : 'bg-dark-100 text-dark-400'
                      } ${isCurrent ? 'ring-4 ring-primary-100 scale-110 bg-primary text-white' : ''}`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-0.5 h-12 transition-colors duration-500 ${isCompleted ? 'bg-primary' : 'bg-dark-200'}`} />
                    )}
                  </div>
                  <div className="pt-1 pb-3">
                    <h3 className={`text-sm font-bold transition-colors ${isCompleted ? 'text-dark-900' : 'text-dark-400'}`}>
                      {step.label}
                    </h3>
                    <p className={`text-xs mt-0.5 leading-relaxed ${isCompleted ? 'text-dark-500' : 'text-dark-300'}`}>
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rider & Delivery Information */}
        <div className="space-y-6">
          {/* Rider Card */}
          <div className="bg-white rounded-3xl shadow-card border border-dark-200/50 p-6">
            <h2 className="font-display font-bold text-dark-900 text-lg mb-4">Assigned Delivery Partner</h2>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary-800 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-premium">
                {rider.name.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-dark-900">{rider.name}</p>
                <p className="text-xs text-dark-500">{rider.vehicle}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{rider.rating}</span>
                  </div>
                  <span className="text-[11px] text-dark-400 font-medium">{rider.trips}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <a 
                href={`tel:${rider.phone}`}
                className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-primary text-primary rounded-xl font-bold text-sm hover:bg-primary-50 transition-colors"
              >
                <Phone className="w-4 h-4" /> Call Rider
              </a>
              <button 
                onClick={() => toast.info('Rider chat connected: "I am picking up your bottles from Denguajhar FL OFF shop."')}
                className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-dark-200 text-dark-700 rounded-xl font-bold text-sm hover:bg-dark-50 transition-colors"
              >
                <MessageCircle className="w-4 h-4" /> Chat
              </button>
            </div>
          </div>

          {/* Delivery Location & Invoice Download */}
          <div className="bg-white rounded-3xl shadow-card border border-dark-200/50 p-6">
            <h3 className="font-bold text-dark-900 text-sm mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" /> Delivery Destination
            </h3>
            <p className="text-xs text-dark-600 leading-relaxed mb-5">{order.address}</p>

            <button 
              onClick={handleDownloadInvoice}
              className="w-full flex items-center justify-center gap-2 py-3 bg-dark-50 hover:bg-dark-100 text-dark-800 rounded-xl font-semibold text-xs border border-dark-200 transition-colors"
            >
              <FileText className="w-4 h-4 text-primary" /> Download Excise E-Receipt / Tax Invoice (PDF)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
