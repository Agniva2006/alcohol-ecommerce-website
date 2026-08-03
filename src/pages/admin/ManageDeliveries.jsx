import { Bike, MapPin, Search } from 'lucide-react';
import useAdminStore from '../../store/adminStore';

// We can also import deliveryStore to show real-time mock data, but for admin we might just mock a broad list.
const mockPlatformDeliveries = [
  { id: 'DEL-101', partner: 'John Doe', status: 'in_transit', area: 'Downtown', time: '10 mins ago' },
  { id: 'DEL-102', partner: 'Jane Smith', status: 'picked_up', area: 'Westside', time: '2 mins ago' },
  { id: 'DEL-103', partner: 'Mike Johnson', status: 'assigned', area: 'North Hills', time: 'Just now' },
];

export default function ManageDeliveries() {
  const metrics = useAdminStore((state) => state.metrics);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-dark-200">
        <div>
          <h2 className="text-xl font-bold text-dark">Active Deliveries</h2>
          <p className="text-dark-500 text-sm">Monitoring {metrics.activeDeliveries} active tasks across the city.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
          <input 
            type="text" 
            placeholder="Search by ID or area..." 
            className="pl-10 pr-4 py-2 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active List */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-dark-200 overflow-hidden">
          <div className="p-4 border-b border-dark-100 bg-dark-50">
            <h3 className="font-semibold text-dark">Live Tracking</h3>
          </div>
          <div className="divide-y divide-dark-100">
            {mockPlatformDeliveries.map((del) => (
              <div key={del.id} className="p-4 flex items-center justify-between hover:bg-dark-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-accent-50 flex items-center justify-center">
                    <Bike className="w-5 h-5 text-accent-600" />
                  </div>
                  <div>
                    <p className="font-bold text-dark">{del.id}</p>
                    <p className="text-sm text-dark-500">{del.partner}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold px-2 py-1 rounded-md bg-dark-100 text-dark-700">
                    {del.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <div className="flex items-center gap-1 justify-end mt-2 text-xs text-dark-400">
                    <MapPin className="w-3 h-3" />
                    {del.area} ({del.time})
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Map Placeholder */}
        <div className="bg-dark-100 rounded-2xl border border-dark-200 flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
          <MapPin className="w-12 h-12 text-dark-300 mb-4" />
          <h3 className="text-lg font-bold text-dark-600 mb-2">Live Map View</h3>
          <p className="text-sm text-dark-400">Map integration (e.g. Google Maps) would render here to track partners in real-time.</p>
        </div>
      </div>
    </div>
  );
}
