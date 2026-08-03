import { History, DollarSign } from 'lucide-react';
import useDeliveryStore from '../../store/deliveryStore';
import EmptyState from '../../components/common/EmptyState';

export default function DeliveryHistory() {
  const history = useDeliveryStore((state) => state.history);

  const totalEarnings = history.reduce((sum, delivery) => sum + delivery.earnings, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-dark-200">
        <div>
          <h2 className="text-xl font-bold text-dark">Delivery History</h2>
          <p className="text-dark-500 text-sm">{history.length} completed deliveries</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-dark-500 font-medium">Total Earnings</p>
          <p className="text-2xl font-bold text-green-600 flex items-center justify-end">
            <DollarSign className="w-5 h-5 mr-1" />
            {totalEarnings.toFixed(2)}
          </p>
        </div>
      </div>

      {history.length === 0 ? (
        <EmptyState 
          icon={History} 
          title="No delivery history" 
          message="Complete your first delivery to see it here."
        />
      ) : (
        <div className="space-y-4">
          {history.map((delivery) => (
            <div key={delivery.id} className="bg-white p-5 rounded-xl shadow-card flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <p className="text-sm font-bold text-dark mb-1">{delivery.orderId}</p>
                <p className="text-xs text-dark-500">{delivery.address}</p>
              </div>
              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-md">
                  DELIVERED
                </span>
                <span className="text-base font-bold text-dark">
                  ${delivery.earnings.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
