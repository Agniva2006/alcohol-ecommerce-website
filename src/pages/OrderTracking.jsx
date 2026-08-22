import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, Truck, CheckCircle, Clock, MapPin, Phone, MessageCircle, Star, 
  ShieldCheck, FileText, ArrowLeft, Copy, Check, Navigation, AlertCircle
} from 'lucide-react';
import useOrderStore from '../store/orderStore';
import useToastStore from '../store/toastStore';
import { formatCurrency } from '../utils/helpers';

export default function OrderTracking() {
  const navigate = useNavigate();
  const activeOrder = useOrderStore((s) => s.activeOrder);
  const trackingStep = useOrderStore((s) => s.trackingStep);
  const advanceTracking = useOrderStore((s) => s.advanceTracking);
  const toast = useToastStore();

  const [eta, setEta] = useState(22);
  const [copiedOtp, setCopiedOtp] = useState(false);
  const [deliveryOtp] = useState('8492');

  // Auto-advance tracking steps for simulation
  useEffect(() => {
    if (trackingStep >= 5) return;
    const timer = setInterval(() => {
      advanceTracking();
    }, 6000);
    return () => clearInterval(timer);
  }, [trackingStep, advanceTracking]);

  // Countdown ETA
  useEffect(() => {
    if (trackingStep >= 5 || eta <= 0) return;
    const timer = setInterval(() => setEta((prev) => Math.max(0, prev - 1)), 60000);
    return () => clearInterval(timer);
  }, [trackingStep, eta]);

  const order = activeOrder || {
    id: 'ff1fafcd-d52c-4e7b-a36c-0691e5246b97',
    total: 400,
    address: 'Jalpaiguri Govt Engineering College, Hostel No. 3, Jalpaiguri 735102',
  };

  const steps = [
    { id: 1, label: 'Order Confirmed & Paid', description: 'Excise digital signature verified via Razorpay', icon: CheckCircle, time: 'Just now' },
    { id: 2, label: 'Store Packaging & Hologram Check', description: 'FL OFF Shop scanned bottle batch & excise barcode', icon: Package, time: '1 min ago' },
    { id: 3, label: 'Rider Assigned & Reached Store', description: 'Delivery partner arrived at store counter', icon: Truck, time: '3 mins ago' },
    { id: 4, label: 'Out for Delivery', description: 'Rider en route to your hostel doorstep (Live GPS)', icon: Navigation, time: 'In transit' },
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
    toast.success('Doorbell OTP copied to clipboard');
    setTimeout(() => setCopiedOtp(false), 2000);
  };

  const handleDownloadInvoice = () => {
    toast.info('Downloading official West Bengal Excise Tax Invoice...');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <button 
        onClick={() => navigate('/')} 
        className="inline-flex items-center gap-2 text-primary hover:text-primary-800 mb-6 font-medium transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Store
      </button>

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

      {/* ─── LIVE GPS RADAR MAP SIMULATOR ───────────────────────────── */}
      <div className="bg-white rounded-3xl shadow-card border border-dark-200/50 p-6 mb-6 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-dark-900 text-lg flex items-center gap-2">
            <Navigation className="w-5 h-5 text-primary" /> Live Delivery Map Radar
          </h2>
          <span className="text-xs font-semibold text-dark-500 bg-dark-100 px-3 py-1 rounded-full">
            Denguajhar FL OFF → JGEC Campus (2.8 km)
          </span>
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

          {/* Moving Rider Pin (Center) */}
          <div 
            className="absolute flex flex-col items-center transition-all duration-1000 z-20"
            style={{
              left: trackingStep === 1 ? '22%' : trackingStep === 2 ? '35%' : trackingStep === 3 ? '52%' : trackingStep === 4 ? '72%' : '86%',
              top: '32%'
            }}
          >
            <div className="relative">
              <span className="animate-ping absolute inset-0 rounded-full bg-primary-400 opacity-75"></span>
              <div className="w-12 h-12 rounded-full gradient-primary text-white flex items-center justify-center text-xl shadow-2xl border-2 border-white relative z-10">
                🛵
              </div>
            </div>
            <span className="text-[10px] font-bold text-dark bg-accent px-2 py-0.5 rounded-full mt-1 shadow-md">
              Rohan (2.8 km away)
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
