import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

import useAuthStore from './store/authStore';
import useProductStore from './store/productStore';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import DeliveryLayout from './components/layout/DeliveryLayout';
import AdminLayout from './components/layout/AdminLayout';
import AgeGateModal from './components/common/AgeGateModal';
import Toast from './components/common/Toast';
import LoadingSpinner from './components/common/LoadingSpinner';

// ─── Lazy-loaded pages ───────────────────────────────────────────────────────
const Home = lazy(() => import('./pages/Home'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OrderTracking = lazy(() => import('./pages/OrderTracking'));
const OrderHistory = lazy(() => import('./pages/OrderHistory'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Profile = lazy(() => import('./pages/Profile'));
const Search = lazy(() => import('./pages/Search'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));

// Retailer pages
const RetailerLogin = lazy(() => import('./pages/retailer/RetailerLogin'));
const Dashboard = lazy(() => import('./pages/retailer/Dashboard'));
const ManageInventory = lazy(() => import('./pages/retailer/ManageInventory'));
const ManageOrders = lazy(() => import('./pages/retailer/ManageOrders'));
const Analytics = lazy(() => import('./pages/retailer/Analytics'));

// Delivery pages
const DeliveryLogin = lazy(() => import('./pages/delivery/DeliveryLogin'));
const DeliveryDashboard = lazy(() => import('./pages/delivery/DeliveryDashboard'));
const DeliveryHistory = lazy(() => import('./pages/delivery/DeliveryHistory'));

// Admin pages
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const ManageRetailers = lazy(() => import('./pages/admin/ManageRetailers'));
const ManageDeliveries = lazy(() => import('./pages/admin/ManageDeliveries'));

// ─── Scroll restoration ─────────────────────────────────────────────────────
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

// ─── Page loading fallback ──────────────────────────────────────────────────
function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <LoadingSpinner size="lg" text="Loading..." />
    </div>
  );
}

// ─── Customer layout wrapper ────────────────────────────────────────────────
function CustomerLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-dark-100">
      <Navbar />
      <main className="flex-grow">
        <Suspense fallback={<PageLoader />}>
          {children}
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

// ─── App ────────────────────────────────────────────────────────────────────
function App() {
  const isAgeVerified = useAuthStore((s) => s.isAgeVerified);
  const verifyAge = useAuthStore((s) => s.verifyAge);
  const fetchProducts = useProductStore((s) => s.fetchProducts);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  if (!isAgeVerified) {
    return (
      <>
        <AgeGateModal onVerify={verifyAge} />
        <Toast />
      </>
    );
  }

  return (
    <Router>
      <ScrollToTop />
      <Toast />

      <Routes>
        {/* ─── Customer Routes ──────────────────────────────── */}
        <Route path="/" element={<CustomerLayout><Home /></CustomerLayout>} />
        <Route path="/product/:id" element={<CustomerLayout><ProductDetails /></CustomerLayout>} />
        <Route path="/cart" element={<CustomerLayout><Cart /></CustomerLayout>} />
        <Route path="/checkout" element={<CustomerLayout><Checkout /></CustomerLayout>} />
        <Route path="/order-tracking" element={<CustomerLayout><OrderTracking /></CustomerLayout>} />
        <Route path="/order-history" element={<CustomerLayout><OrderHistory /></CustomerLayout>} />
        <Route path="/wishlist" element={<CustomerLayout><Wishlist /></CustomerLayout>} />
        <Route path="/notifications" element={<CustomerLayout><Notifications /></CustomerLayout>} />
        <Route path="/profile" element={<CustomerLayout><Profile /></CustomerLayout>} />
        <Route path="/search" element={<CustomerLayout><Search /></CustomerLayout>} />
        <Route path="/auth/login" element={<CustomerLayout><Login /></CustomerLayout>} />
        <Route path="/auth/register" element={<CustomerLayout><Register /></CustomerLayout>} />

        {/* ─── Retailer Routes (no customer layout) ─────────── */}
        <Route path="/retailer/login" element={<Suspense fallback={<PageLoader />}><RetailerLogin /></Suspense>} />
        <Route path="/retailer/dashboard" element={<Suspense fallback={<PageLoader />}><Dashboard /></Suspense>} />
        <Route path="/retailer/inventory" element={<Suspense fallback={<PageLoader />}><ManageInventory /></Suspense>} />
        <Route path="/retailer/orders" element={<Suspense fallback={<PageLoader />}><ManageOrders /></Suspense>} />
        <Route path="/retailer/analytics" element={<Suspense fallback={<PageLoader />}><Analytics /></Suspense>} />

        {/* ─── Delivery Routes ──────────────────────────────── */}
        <Route path="/delivery/login" element={<Suspense fallback={<PageLoader />}><DeliveryLogin /></Suspense>} />
        <Route path="/delivery/dashboard" element={<DeliveryLayout title="Dashboard"><Suspense fallback={<PageLoader />}><DeliveryDashboard /></Suspense></DeliveryLayout>} />
        <Route path="/delivery/active" element={<DeliveryLayout title="Active Deliveries"><Suspense fallback={<PageLoader />}><DeliveryDashboard /></Suspense></DeliveryLayout>} />
        <Route path="/delivery/history" element={<DeliveryLayout title="History"><Suspense fallback={<PageLoader />}><DeliveryHistory /></Suspense></DeliveryLayout>} />
        <Route path="/delivery/earnings" element={<DeliveryLayout title="Earnings"><Suspense fallback={<PageLoader />}><DeliveryHistory /></Suspense></DeliveryLayout>} />

        {/* ─── Admin Routes ─────────────────────────────────── */}
        <Route path="/admin/login" element={<Suspense fallback={<PageLoader />}><AdminLogin /></Suspense>} />
        <Route path="/admin/dashboard" element={<AdminLayout title="Dashboard"><Suspense fallback={<PageLoader />}><AdminDashboard /></Suspense></AdminLayout>} />
        <Route path="/admin/retailers" element={<AdminLayout title="Retailers"><Suspense fallback={<PageLoader />}><ManageRetailers /></Suspense></AdminLayout>} />
        <Route path="/admin/deliveries" element={<AdminLayout title="Deliveries"><Suspense fallback={<PageLoader />}><ManageDeliveries /></Suspense></AdminLayout>} />
        <Route path="/admin/users" element={<AdminLayout title="Users"><Suspense fallback={<PageLoader />}><ManageRetailers /></Suspense></AdminLayout>} />
        <Route path="/admin/reports" element={<AdminLayout title="Reports"><Suspense fallback={<PageLoader />}><AdminDashboard /></Suspense></AdminLayout>} />
      </Routes>
    </Router>
  );
}

export default App;
