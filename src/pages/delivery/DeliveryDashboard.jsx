import { useEffect } from 'react';
import { MapPin, PhoneCall, CheckCircle, Clock } from 'lucide-react';
import useDeliveryStore from '../../store/deliveryStore';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';

export default function DeliveryDashboard() {
  const activeDeliveries = useDeliveryStore((state) => state.activeDeliveries);
  const updateStatus = useDeliveryStore((state) => state.updateDeliveryStatus);
  const fetchDeliveries = useDeliveryStore((state) => state.fetchDeliveries);
  const isOnline = useDeliveryStore((state) => state.isOnline);
  const toggleOnline = useDeliveryStore((state) => state.toggleOnlineStatus);

  useEffect(() => {
    fetchDeliveries();
    const interval = setInterval(fetchDeliveries, 5000);
    return () => clearInterval(interval);
  }, []);

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
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-dark">Active Deliveries</h2>
          <p className="text-dark-500 text-sm">You have {activeDeliveries.length} active tasks.</p>
        </div>
        <Button onClick={toggleOnline} variant="outline" className="text-red-500 border-red-200 hover:bg-red-50">
          Go Offline
        </Button>
      </div>

      {activeDeliveries.length === 0 ? (
        <EmptyState 
          icon={Clock} 
          title="No active deliveries" 
          message="Waiting for new orders. Stay near busy areas."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeDeliveries.map((delivery) => (
            <div key={delivery.id} className="bg-white p-6 rounded-2xl shadow-card flex flex-col justify-between border border-dark-100">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs font-semibold text-primary bg-primary-50 px-2.5 py-1 rounded-md mb-2 inline-block">
                      {delivery.status === 'assigned' ? 'PICKUP FROM SHOP' : delivery.status === 'in_transit' ? 'IN TRANSIT TO CUSTOMER' : delivery.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <h3 className="text-lg font-bold text-dark">{delivery.orderId}</h3>
                  </div>
                  <span className="text-xl font-bold text-emerald-600">₹{delivery.earnings}</span>
                </div>

                {/* 2-Step Route: Supplier (Shop) -> Customer */}
                <div className="space-y-4 mb-6 bg-dark-50/50 p-4 rounded-xl border border-dark-100">
                  {/* Step 1: Supplier Pickup */}
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                      1
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Pickup from Supplier (FL OFF Shop)</p>
                      <p className="text-sm font-bold text-dark">{delivery.shopName || 'Denguajhar FL OFF Shop'}</p>
                      <p className="text-xs text-dark-500">Denguajhar Station Road, Jalpaiguri</p>
                    </div>
                  </div>

                  <div className="w-0.5 h-4 bg-dark-200 ml-3.5" />

                  {/* Step 2: Customer Delivery */}
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                      2
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Deliver to Customer</p>
                      <p className="text-sm font-bold text-dark">{delivery.customerName}</p>
                      <p className="text-xs text-dark-500">{delivery.address}</p>
                      <p className="text-xs text-emerald-600 font-medium mt-1">Est. {delivery.estimatedTime} • {delivery.distance}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 flex justify-center gap-2">
                  <PhoneCall className="w-4 h-4" />
                  Call Customer
                </Button>
                {delivery.status === 'assigned' && (
                  <Button 
                    variant="primary" 
                    className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
                    onClick={() => updateStatus(delivery.id, 'picked_up')}
                  >
                    Confirm Shop Pickup
                  </Button>
                )}
                {delivery.status === 'picked_up' && (
                  <Button 
                    variant="primary" 
                    className="flex-1"
                    onClick={() => updateStatus(delivery.id, 'in_transit')}
                  >
                    Start Transit
                  </Button>
                )}
                {delivery.status === 'in_transit' && (
                  <Button 
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => updateStatus(delivery.id, 'delivered')}
                  >
                    <CheckCircle className="w-4 h-4 mr-2 inline" />
                    Verify ID & Complete
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
