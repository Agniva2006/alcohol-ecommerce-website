import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Heart,
  Bell,
  ShoppingCart,
  User,
  Menu,
  X,
  Home,
  Package,
  LogIn,
  Store,
  Bike,
  Shield,
  ChevronDown,
} from 'lucide-react';
import useCartStore from '../../store/cartStore';
import useAuthStore from '../../store/authStore';
import useNotificationStore from '../../store/notificationStore';
import useWishlistStore from '../../store/wishlistStore';
import { cn, getInitials } from '../../utils/helpers';

function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPortalsOpen, setIsPortalsOpen] = useState(false);
  const navigate = useNavigate();

  const { items: cartItems } = useCartStore();
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const { isAuthenticated, user } = useAuthStore();
  const { unreadCount } = useNotificationStore();
  const { items: wishlistItems } = useWishlistStore();

  // Scroll listener for glassmorphism effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu & portals on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsPortalsOpen(false);
  }, [navigate]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const handleSearchClick = () => {
    setIsMobileMenuOpen(false);
    navigate('/search');
  };

  const navLinks = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Cart', path: '/cart', icon: ShoppingCart },
    { label: 'Wishlist', path: '/wishlist', icon: Heart },
    { label: 'Orders', path: '/order-history', icon: Package },
  ];

  return (
    <header
      className={cn(
        'sticky top-0 z-40 transition-all duration-300',
        isScrolled
          ? 'glass-dark shadow-glass-lg'
          : 'bg-primary'
      )}
    >
      <nav
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-between h-16">
          {/* ── Left: Logo ─────────────────────────────────── */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group flex-shrink-0"
            aria-label="Sip & Savor home"
          >
            <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
              <span className="text-dark-900 font-display font-bold text-base">
                S&S
              </span>
            </div>
            <span className="hidden sm:block text-white font-display font-bold text-lg tracking-tight">
              Sip & Savor
            </span>
          </Link>

          {/* ── Center: Search bar (desktop) ────────────────── */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <button
              onClick={handleSearchClick}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 text-white/60 hover:text-white/80 transition-all duration-200 text-sm"
              aria-label="Search products"
            >
              <Search size={18} strokeWidth={2} />
              <span>Search whisky, beer, wine...</span>
            </button>
          </div>

          {/* ── Right: Icon row (desktop) ──────────────────── */}
          <div className="hidden md:flex items-center gap-1">
            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="relative p-2.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200"
              aria-label={`Wishlist, ${wishlistItems.length} items`}
            >
              <Heart size={20} />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-accent text-dark-900 text-[10px] font-bold px-1">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Notifications */}
            <Link
              to="/notifications"
              className="relative p-2.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200"
              aria-label={`Notifications, ${unreadCount} unread`}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-accent text-dark-900 text-[10px] font-bold px-1">
                  {unreadCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200"
              aria-label={`Cart, ${totalItems} items`}
            >
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-accent text-dark-900 text-[10px] font-bold px-1">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Portals Dropdown (Retailer / Driver / Office) */}
            <div className="relative">
              <button
                onClick={() => setIsPortalsOpen(!isPortalsOpen)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 text-xs font-semibold uppercase tracking-wider transition-all duration-200"
                aria-label="Staff and Partner Portals"
                aria-expanded={isPortalsOpen}
              >
                <span>Portals</span>
                <ChevronDown size={14} className={cn('transition-transform duration-200', isPortalsOpen && 'rotate-180')} />
              </button>

              {isPortalsOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsPortalsOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-dark-900 border border-white/10 shadow-2xl p-2 z-50 animate-fade-in text-left">
                    <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-dark-400">
                      Partner & Staff Portals
                    </p>
                    <Link
                      to="/retailer/dashboard"
                      onClick={() => setIsPortalsOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white hover:bg-white/10 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                        <Store size={17} />
                      </div>
                      <div>
                        <div className="text-white font-semibold">Retailer Hub</div>
                        <div className="text-dark-400 text-xs">Inventory & Orders</div>
                      </div>
                    </Link>

                    <Link
                      to="/delivery/dashboard"
                      onClick={() => setIsPortalsOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white hover:bg-white/10 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <Bike size={17} />
                      </div>
                      <div>
                        <div className="text-white font-semibold">Driver Hub</div>
                        <div className="text-dark-400 text-xs">Deliveries & GPS</div>
                      </div>
                    </Link>

                    <Link
                      to="/admin/dashboard"
                      onClick={() => setIsPortalsOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white hover:bg-white/10 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                        <Shield size={17} />
                      </div>
                      <div>
                        <div className="text-white font-semibold">Office / Admin</div>
                        <div className="text-dark-400 text-xs">System Control</div>
                      </div>
                    </Link>
                  </div>
                </>
              )}
            </div>

            {/* Divider */}
            <div className="w-px h-6 bg-white/15 mx-1" />

            {/* User avatar / login */}
            {isAuthenticated && user ? (
              <Link
                to="/profile"
                className="flex items-center justify-center w-9 h-9 rounded-full bg-accent text-dark-900 font-bold text-sm hover:scale-105 transition-transform duration-200"
                aria-label="Profile"
              >
                {getInitials(user.name)}
              </Link>
            ) : (
              <Link
                to="/auth/login"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-sm font-medium transition-all duration-200"
                aria-label="Login"
              >
                <LogIn size={16} />
                <span>Login</span>
              </Link>
            )}
          </div>

          {/* ── Mobile: Right icons + Hamburger ─────────────── */}
          <div className="flex md:hidden items-center gap-1">
            {/* Cart (mobile) */}
            <Link
              to="/cart"
              className="relative p-2 rounded-lg text-white/80 hover:text-white transition-colors"
              aria-label={`Cart, ${totalItems} items`}
            >
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] flex items-center justify-center rounded-full bg-accent text-dark-900 text-[9px] font-bold px-0.5">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile Menu Drawer ──────────────────────────────── */}
      {isMobileMenuOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 top-16 bg-black/50 z-30 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer */}
          <div className="absolute top-16 inset-x-0 z-40 md:hidden bg-dark-900 border-t border-white/10 shadow-2xl animate-slide-up">
            <div className="px-4 py-5 space-y-4">
              {/* Mobile search */}
              <button
                onClick={handleSearchClick}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 text-sm"
                aria-label="Search products"
              >
                <Search size={18} />
                <span>Search whisky, beer, wine...</span>
              </button>

              {/* Nav links */}
              <div className="space-y-1">
                {navLinks.map(({ label, path, icon: Icon }) => (
                  <Link
                    key={path}
                    to={path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-dark-300 hover:text-white hover:bg-white/5 transition-all duration-200"
                  >
                    <Icon size={18} />
                    <span className="font-medium text-sm">{label}</span>
                  </Link>
                ))}

                {/* Notifications */}
                <Link
                  to="/notifications"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-dark-300 hover:text-white hover:bg-white/5 transition-all duration-200"
                >
                  <Bell size={18} />
                  <span className="font-medium text-sm">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="ml-auto min-w-[20px] h-[20px] flex items-center justify-center rounded-full bg-accent text-dark-900 text-[10px] font-bold px-1">
                      {unreadCount}
                    </span>
                  )}
                </Link>

                {/* Wishlist */}
                <Link
                  to="/wishlist"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-dark-300 hover:text-white hover:bg-white/5 transition-all duration-200"
                >
                  <Heart size={18} />
                  <span className="font-medium text-sm">Wishlist</span>
                  {wishlistItems.length > 0 && (
                    <span className="ml-auto min-w-[20px] h-[20px] flex items-center justify-center rounded-full bg-accent text-dark-900 text-[10px] font-bold px-1">
                      {wishlistItems.length}
                    </span>
                  )}
                </Link>

                {/* Portals Section in Mobile Drawer */}
                <div className="pt-2 border-t border-white/5 space-y-1">
                  <p className="px-4 py-1 text-[11px] font-bold uppercase tracking-wider text-dark-400">
                    Partner & Staff Portals
                  </p>
                  <Link
                    to="/retailer/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-dark-300 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <Store size={18} className="text-amber-400" />
                    <span className="font-medium text-sm">Retailer Portal</span>
                  </Link>

                  <Link
                    to="/delivery/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-dark-300 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <Bike size={18} className="text-emerald-400" />
                    <span className="font-medium text-sm">Driver / Delivery Hub</span>
                  </Link>

                  <Link
                    to="/admin/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-dark-300 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <Shield size={18} className="text-blue-400" />
                    <span className="font-medium text-sm">Office / Admin Portal</span>
                  </Link>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-white/5" />

              {/* Auth action */}
              {isAuthenticated && user ? (
                <Link
                  to="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5"
                >
                  <div className="w-9 h-9 rounded-full bg-accent text-dark-900 font-bold text-sm flex items-center justify-center">
                    {getInitials(user.name)}
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">
                      {user.name}
                    </p>
                    <p className="text-dark-500 text-xs">{user.phone || user.email}</p>
                  </div>
                </Link>
              ) : (
                <Link
                  to="/auth/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-accent text-dark-900 font-semibold text-sm hover:bg-accent-600 transition-colors"
                >
                  <User size={16} />
                  <span>Login / Register</span>
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  );
}

export default Navbar;
