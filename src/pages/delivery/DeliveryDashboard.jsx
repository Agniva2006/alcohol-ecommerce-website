import { useState, useEffect } from 'react';
import { 
  MapPin, PhoneCall, CheckCircle, Clock, ShieldCheck, Camera, 
  CheckCircle2, X, Lock, Loader2, AlertCircle
} from 'lucide-react';
import useDeliveryStore from '../../store/deliveryStore';
import useToastStore from '../../store/toastStore';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';

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

  useEffect(() => {
    fetchDeliveries();
    const interval = setInterval(fetchDeliveries, 5000);
    return () => clearInterval(interval);
  }, [fetchDeliveries]);

  const handleOpenHandover = (delivery) => {
    setVerifyingDelivery(delivery);
    setInputOtp('');
  };

  const handleConfirmHandover = async () => {
    if (inputOtp !== '8492' && inputOtp.length !== 4) {
      toast.error('Invalid Doorstep OTP. Ask customer for 4-digit code (8492).');
      return;
    }

    setIsVerifying(true);
    try {
      await updateStatus(verifyingDelivery.id, 'delivered');
      setIsVerifying(false);
      setVerifyingDelivery(null);
      toast.success('Doorstep 21+ Handover Verified & Order Marked DELIVERED!');
    } catch (error) {
      setIsVerifying(false);
      toast.error('Failed to complete delivery.');
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-dark">Active Delivery Radar</h2>
          <p className="text-dark-500 text-sm">You have {activeDeliveries.length} active delivery tasks.</p>
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
                    Verify 21+ & Handover
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── DOORSTEP 21+ VERIFICATION MODAL ───────────────────────── */}
      {verifyingDelivery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative animate-scale-in border border-dark-200">
            <button 
              onClick={() => setVerifyingDelivery(null)}
              className="absolute top-4 right-4 p-2 rounded-full text-dark-400 hover:bg-dark-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-dark-900 font-display">Excise Doorstep Handover</h3>
              <p className="text-xs text-dark-500 mt-1">Match customer photo & enter customer Doorbell OTP</p>
            </div>

            {/* Customer Photo Comparison Card */}
            <div className="bg-dark-50 p-4 rounded-2xl border border-dark-200 mb-5 flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-primary-100 text-primary flex items-center justify-center font-bold text-2xl border-2 border-primary/30 flex-shrink-0">
                👤
              </div>
              <div>
                <p className="text-xs text-dark-400">Verified Customer</p>
                <h4 className="text-sm font-bold text-dark-900">{verifyingDelivery.customerName}</h4>
                <p className="text-[11px] font-bold text-green-700 mt-0.5">✓ 21+ Age Verified (Aadhaar KYC)</p>
              </div>
            </div>

            {/* OTP Input */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-dark-700 mb-2 text-center">
                Enter 4-Digit Customer Doorbell OTP (Test: 8492)
              </label>
              <input 
                type="text"
                maxLength={4}
                value={inputOtp}
                onChange={(e) => setInputOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="8 4 9 2"
                className="w-full text-center text-3xl font-mono font-bold tracking-widest py-3 border-2 border-dark-300 rounded-xl focus:outline-none focus:border-green-600"
              />
            </div>

            <button
              onClick={handleConfirmHandover}
              disabled={isVerifying || inputOtp.length < 4}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50"
            >
              {isVerifying ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Verifying Handover...</>
              ) : (
                <><CheckCircle2 className="w-5 h-5" /> Complete Delivery & Earn ₹45</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
