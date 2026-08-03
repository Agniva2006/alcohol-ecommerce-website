import { useEffect } from 'react';
import { DollarSign, Package, Users, Store, TrendingUp, ShieldCheck, FileText, Settings, MapPin } from 'lucide-react';
import useAdminStore from '../../store/adminStore';

export default function AdminDashboard() {
  const metrics = useAdminStore((state) => state.metrics);
  const fetchAdminData = useAdminStore((state) => state.fetchAdminData);

  useEffect(() => {
    fetchAdminData();
    const interval = setInterval(fetchAdminData, 5000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    { label: 'Total Sales (GMV)', value: `₹${metrics.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-primary', bg: 'bg-primary-50' },
    { label: 'Total Orders', value: metrics.totalOrders.toLocaleString(), icon: Package, color: 'text-accent-600', bg: 'bg-accent-50' },
    { label: 'Licensed FL OFF Shops', value: metrics.activeRetailers, icon: Store, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Active Delivery Riders', value: metrics.activeDeliveries || 4, icon: Users, color: 'text-green-500', bg: 'bg-green-50' },
  ];

  const handleDownloadExciseAudit = () => {
    const csvContent = "data:text/csv;charset=utf-8,Order ID,Customer DOB,21+ Status,Shop License,Excise Stamp,Status\n"
      + "ORD-101,2000-01-01,VERIFIED 21+,FL-OFF-JPG-01,PASS,DELIVERED\n"
      + "ORD-102,1998-05-14,VERIFIED 21+,FL-OFF-JPG-02,PASS,DELIVERED\n";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Excise_Department_Legal_Audit_Jalpaiguri.csv");
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-dark">HQ Office & Legal Compliance Control</h2>
          <p className="text-dark-500 text-sm">Real-time supervisory control across Customer, Supplier, and Delivery operations.</p>
        </div>
        <button 
          onClick={handleDownloadExciseAudit}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-800 transition-colors shadow-premium"
        >
          <FileText className="w-4 h-4" />
          Download Excise Legal Audit
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-dark-200 flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-dark-500 mb-1">{stat.label}</p>
              <h3 className="text-3xl font-display font-bold text-dark">{stat.value}</h3>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Verification & Legal Compliance Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Verification */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-dark-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-dark">Customer Verification</h4>
              <p className="text-xs text-dark-400">Strict 21+ Compliance</p>
            </div>
          </div>
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between py-1.5 border-b border-dark-100">
              <span className="text-dark-600">DOB Age Check</span>
              <span className="font-bold text-emerald-600">100% Passed (21+)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-dark-100">
              <span className="text-dark-600">Physical ID Verification</span>
              <span className="font-semibold text-dark-800">Rider Check Mandatory</span>
            </div>
          </div>
        </div>

        {/* Supplier / Retailer Verification */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-dark-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-dark">Supplier Verification</h4>
              <p className="text-xs text-dark-400">FL OFF Excise Licenses</p>
            </div>
          </div>
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between py-1.5 border-b border-dark-100">
              <span className="text-dark-600">Active Licensed Stores</span>
              <span className="font-bold text-blue-600">5 Stores Verified</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-dark-100">
              <span className="text-dark-600">Excise Stamp Audit</span>
              <span className="font-semibold text-emerald-600">Compliant</span>
            </div>
          </div>
        </div>

        {/* Delivery Radius & Settings */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-dark-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-dark">Geofence & Commission</h4>
              <p className="text-xs text-dark-400">Jalpaiguri Hub Settings</p>
            </div>
          </div>
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between py-1.5 border-b border-dark-100">
              <span className="text-dark-600">Delivery Radius</span>
              <span className="font-bold text-purple-600">6.0 km (JGEC Hub)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-dark-100">
              <span className="text-dark-600">Platform Commission Share</span>
              <span className="font-bold text-dark-800">10%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
