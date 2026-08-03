import { Store, Check, X, Search } from 'lucide-react';
import useAdminStore from '../../store/adminStore';
import Button from '../../components/common/Button';
import { cn } from '../../utils/helpers';

export default function ManageRetailers() {
  const retailers = useAdminStore((state) => state.retailers);
  const updateStatus = useAdminStore((state) => state.updateRetailerStatus);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-dark-200">
        <div>
          <h2 className="text-xl font-bold text-dark">Retailer Management</h2>
          <p className="text-dark-500 text-sm">Approve, suspend, or view all retail partners.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
          <input 
            type="text" 
            placeholder="Search retailers..." 
            className="pl-10 pr-4 py-2 border border-dark-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-dark-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-dark-50 border-b border-dark-200">
              <tr>
                <th className="py-4 px-6 text-sm font-semibold text-dark-600">Store Name</th>
                <th className="py-4 px-6 text-sm font-semibold text-dark-600">ID</th>
                <th className="py-4 px-6 text-sm font-semibold text-dark-600">Status</th>
                <th className="py-4 px-6 text-sm font-semibold text-dark-600">Orders</th>
                <th className="py-4 px-6 text-sm font-semibold text-dark-600">Revenue</th>
                <th className="py-4 px-6 text-sm font-semibold text-dark-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-100">
              {retailers.map((retailer) => (
                <tr key={retailer.id} className="hover:bg-dark-50/50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Store className="w-5 h-5 text-primary" />
                      </div>
                      <span className="font-medium text-dark">{retailer.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-dark-500">{retailer.id}</td>
                  <td className="py-4 px-6">
                    <span className={cn(
                      'px-2.5 py-1 rounded-full text-xs font-semibold',
                      retailer.status === 'active' && 'bg-green-100 text-green-700',
                      retailer.status === 'pending' && 'bg-yellow-100 text-yellow-700',
                      retailer.status === 'suspended' && 'bg-red-100 text-red-700'
                    )}>
                      {retailer.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-dark-600">{retailer.orders}</td>
                  <td className="py-4 px-6 text-sm font-medium text-dark">${retailer.revenue.toLocaleString()}</td>
                  <td className="py-4 px-6 text-right space-x-2">
                    {retailer.status !== 'active' && (
                      <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50" onClick={() => updateStatus(retailer.id, 'active')}>
                        <Check className="w-4 h-4 mr-1 inline" /> Approve
                      </Button>
                    )}
                    {retailer.status !== 'suspended' && (
                      <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => updateStatus(retailer.id, 'suspended')}>
                        <X className="w-4 h-4 mr-1 inline" /> Suspend
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
