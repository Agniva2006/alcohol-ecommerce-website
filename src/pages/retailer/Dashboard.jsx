import { useState } from 'react';
import {
  IndianRupee,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Clock,
  CheckCircle2,
  Eye,
  ArrowUpRight,
  ChevronDown,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import RetailerLayout from '../../components/layout/RetailerLayout';
import { retailerData } from '../../data/mockData';
import { formatCurrency, formatNumber, cn } from '../../utils/helpers';
import api from '../../api';

// ─── Stat Card Component ─────────────────────────────────────────────────────
function StatCard({ icon: Icon, iconBg, iconColor, label, value, trend, trendLabel }) {
  const isPositive = trend >= 0;
  return (
    <div className="bg-white rounded-xl shadow-card p-5 sm:p-6 hover:shadow-card-hover transition-shadow duration-300 animate-fade-in">
      <div className="flex items-start justify-between">
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', iconBg)}>
          <Icon className={cn('w-6 h-6', iconColor)} />
        </div>
        {trend !== undefined && (
          <div
            className={cn(
              'flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full',
              isPositive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
            )}
          >
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl sm:text-3xl font-display font-bold text-dark">{value}</p>
        <p className="text-sm text-dark-500 mt-1">{label}</p>
      </div>
    </div>
  );
}

// ─── Bar Chart Component ─────────────────────────────────────────────────────
function SalesBarChart({ data }) {
  const maxSales = Math.max(...data.map((d) => d.sales));
  const [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <div className="flex items-end justify-between gap-3 sm:gap-4 h-52 sm:h-64 px-2">
      {data.map((item, index) => {
        const heightPercent = (item.sales / maxSales) * 100;
        const isHovered = hoveredIndex === index;
        return (
          <div
            key={index}
            className="flex flex-col items-center flex-1 h-full justify-end group"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {/* Value tooltip */}
            <div
              className={cn(
                'text-xs font-semibold text-primary mb-2 transition-all duration-200',
                isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
              )}
            >
              {formatCurrency(item.sales)}
            </div>
            {/* Bar */}
            <div
              className={cn(
                'w-full rounded-t-lg transition-all duration-500 ease-out cursor-pointer',
                isHovered
                  ? 'bg-gradient-to-t from-primary to-primary-700 shadow-premium'
                  : 'bg-gradient-to-t from-primary-800 to-primary-500'
              )}
              style={{
                height: `${heightPercent}%`,
                minHeight: '12px',
                transitionDelay: `${index * 60}ms`,
              }}
            />
            {/* Day label */}
            <p
              className={cn(
                'text-xs mt-2 font-medium transition-colors',
                isHovered ? 'text-primary' : 'text-dark-500'
              )}
            >
              {item.day}
            </p>
          </div>
        );
      })}
    </div>
  );
}

// ─── Status Badge ────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const styles = {
    new: 'bg-blue-50 text-blue-600 border-blue-200',
    accepted: 'bg-amber-50 text-amber-600 border-amber-200',
    completed: 'bg-green-50 text-green-600 border-green-200',
  };
  const labels = { new: 'New', accepted: 'Accepted', completed: 'Completed' };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border',
        styles[status] || 'bg-gray-50 text-gray-600 border-gray-200'
      )}
    >
      {labels[status] || status}
    </span>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────
export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [period, setPeriod] = useState('This Week');

  useEffect(() => {
    api.get('/retailer/orders?shopId=SH-JPG-001')
      .then(res => setOrders(res.data))
      .catch(err => console.error('Failed to fetch dashboard orders:', err));
  }, []);

  const totalSales = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'PLACED' || o.status === 'PAID').length;
  const deliveredOrders = orders.filter(o => o.status === 'DELIVERED').length;

  const stats = {
    totalSales: totalSales > 0 ? totalSales : retailerData.stats.totalSales,
    totalOrders: totalOrders > 0 ? totalOrders : retailerData.stats.totalOrders,
    pending: pendingOrders,
    delivered: deliveredOrders > 0 ? deliveredOrders : retailerData.stats.delivered,
    salesTrend: 12.5
  };

  const { weeklyData, topProducts } = retailerData;
  const maxQty = Math.max(...topProducts.map((p) => p.quantity));

  return (
    <RetailerLayout title="Dashboard">
      {/* ─── Stats Cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <StatCard
          icon={IndianRupee}
          iconBg="bg-emerald-100"
          iconColor="text-emerald-600"
          label="Total Sales"
          value={formatCurrency(stats.totalSales)}
          trend={stats.salesTrend}
        />
        <StatCard
          icon={ShoppingCart}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
          label="Total Orders"
          value={formatNumber(stats.totalOrders)}
          trend={8}
        />
        <StatCard
          icon={Clock}
          iconBg="bg-amber-100"
          iconColor="text-amber-600"
          label="Pending Orders"
          value={formatNumber(stats.pending)}
        />
        <StatCard
          icon={CheckCircle2}
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
          label="Delivered Today"
          value={formatNumber(stats.delivered)}
          trend={12}
        />
      </div>

      {/* ─── Sales Overview + Top Products ─────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {/* Sales Chart */}
        <div className="xl:col-span-2 bg-white rounded-xl shadow-card p-6 animate-fade-in-up">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
            <div>
              <h3 className="text-lg font-display font-bold text-dark">Sales Overview</h3>
              <p className="text-sm text-dark-500 mt-0.5">Weekly revenue breakdown</p>
            </div>
            <div className="relative">
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="appearance-none bg-dark-100 text-dark-700 text-sm font-medium pl-4 pr-10 py-2 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
              >
                <option>This Week</option>
                <option>Last Week</option>
                <option>This Month</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400 pointer-events-none" />
            </div>
          </div>
          <SalesBarChart data={weeklyData} />
        </div>

        {/* Top Selling Products */}
        <div className="bg-white rounded-xl shadow-card p-6 animate-fade-in-up">
          <h3 className="text-lg font-display font-bold text-dark mb-1">Top Selling</h3>
          <p className="text-sm text-dark-500 mb-6">Products by quantity</p>

          <div className="space-y-5">
            {topProducts.map((product, index) => (
              <div key={index} className="group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        'w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold',
                        index === 0
                          ? 'bg-accent text-dark'
                          : index === 1
                          ? 'bg-dark-200 text-dark-700'
                          : 'bg-dark-100 text-dark-500'
                      )}
                    >
                      {index + 1}
                    </span>
                    <span className="text-sm font-medium text-dark group-hover:text-primary transition-colors">
                      {product.name}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-dark">{product.quantity}</span>
                </div>
                <div className="ml-10">
                  <div className="w-full h-2 bg-dark-100 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-700 ease-out',
                        index === 0
                          ? 'bg-gradient-to-r from-primary to-primary-600'
                          : index === 1
                          ? 'bg-gradient-to-r from-accent-600 to-accent'
                          : 'bg-gradient-to-r from-blue-500 to-blue-400'
                      )}
                      style={{ width: `${(product.quantity / maxQty) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Recent Orders ────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-card animate-fade-in-up">
        <div className="flex items-center justify-between p-6 border-b border-dark-100">
          <div>
            <h3 className="text-lg font-display font-bold text-dark">Recent Orders</h3>
            <p className="text-sm text-dark-500 mt-0.5">Latest incoming orders</p>
          </div>
          <button className="text-primary text-sm font-semibold hover:underline flex items-center gap-1">
            View All <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-semibold text-dark-500 uppercase tracking-wider border-b border-dark-100">
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Items</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Time</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-100">
              {recentOrders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-dark-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-primary">#{order.id}</span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-dark">{order.customer}</td>
                  <td className="px-6 py-4 text-sm text-dark-600 max-w-[200px] truncate">
                    {order.items}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-dark">
                    {formatCurrency(order.total)}
                  </td>
                  <td className="px-6 py-4 text-sm text-dark-500">{order.time}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-6 py-4">
                    <button className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-800 transition-colors">
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-dark-100">
          {recentOrders.map((order) => (
            <div key={order.id} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-primary">#{order.id}</span>
                <StatusBadge status={order.status} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-dark">{order.customer}</p>
                  <p className="text-xs text-dark-500 mt-0.5">{order.items}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-dark">{formatCurrency(order.total)}</p>
                  <p className="text-xs text-dark-500">{order.time}</p>
                </div>
              </div>
              <button className="w-full py-2 text-sm font-medium text-primary border border-primary-100 rounded-lg hover:bg-primary-50 transition-colors flex items-center justify-center gap-1.5">
                <Eye className="w-4 h-4" />
                View Details
              </button>
            </div>
          ))}
        </div>
      </div>
    </RetailerLayout>
  );
}
