import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  MapPin,
  Clock,
  History,
  DollarSign,
  Menu,
  X,
  Bike,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { cn, getInitials } from '../../utils/helpers';

const navLinks = [
  { to: '/delivery/dashboard', label: 'Dashboard', icon: MapPin },
  { to: '/delivery/history', label: 'History', icon: History },
];

export default function DeliveryLayout({ children, title = 'Delivery Dashboard' }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const driverName = 'John Doe';
  const status = 'Online';

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Driver Branding */}
      <div className="p-6 border-b border-dark-200">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-accent-500 flex items-center justify-center shadow-md flex-shrink-0">
            <Bike className="w-6 h-6 text-white" />
          </div>
          <div className="min-w-0">
            <h2 className="font-display font-bold text-dark text-lg leading-tight truncate">
              Delivery Partner
            </h2>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <p className="text-xs text-dark-500 truncate">{status}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group',
                isActive
                  ? 'bg-accent text-dark-900 shadow-md'
                  : 'text-dark-600 hover:bg-dark-100 hover:text-dark-900'
              )
            }
          >
            {({ isActive }) => (
              <>
                <link.icon
                  className={cn(
                    'w-5 h-5 flex-shrink-0 transition-colors',
                    isActive ? 'text-dark-900' : 'text-dark-400 group-hover:text-accent-600'
                  )}
                />
                <span className="flex-1">{link.label}</span>
                {isActive && (
                  <ChevronRight className="w-4 h-4 text-dark-900/70" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-dark-200">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors cursor-pointer group">
          <LogOut className="w-5 h-5 text-dark-400 group-hover:text-red-500 transition-colors" />
          <span className="text-sm font-medium text-dark-600 group-hover:text-red-600 transition-colors">
            Logout
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-dark-100">
      {/* ─── Desktop Sidebar ──────────────────────────────────── */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r border-dark-200 z-30">
        <SidebarContent />
      </aside>

      {/* ─── Mobile Overlay ───────────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ─── Mobile Sidebar Drawer ────────────────────────────── */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 w-72 bg-white z-50 lg:hidden transform transition-transform duration-300 ease-in-out shadow-2xl',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Close Button */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-dark-100 transition-colors"
        >
          <X className="w-5 h-5 text-dark-500" />
        </button>
        <SidebarContent />
      </aside>

      {/* ─── Main Content Area ────────────────────────────────── */}
      <div className="lg:ml-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-dark-200 h-16">
          <div className="flex items-center justify-between h-full px-4 sm:px-6 lg:px-8">
            {/* Left: hamburger + title */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-dark-100 transition-colors"
              >
                <Menu className="w-5 h-5 text-dark-700" />
              </button>
              <div>
                <h1 className="text-lg sm:text-xl font-display font-bold text-dark leading-tight">
                  {title}
                </h1>
              </div>
            </div>

            {/* Right: notifications + avatar */}
            <div className="flex items-center gap-3">
              {/* Driver Avatar */}
              <div className="flex items-center gap-3 pl-3">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-semibold text-dark leading-tight">{driverName}</p>
                </div>
                <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center text-dark-900 text-sm font-bold shadow-sm">
                  {getInitials(driverName)}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
