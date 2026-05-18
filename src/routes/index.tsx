import { createBrowserRouter, RouterProvider, Outlet, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { useAuthStore } from '@/store/authStore';
import Navbar from '@/components/layout/Navbar';
import BottomNav from '@/components/layout/BottomNav';
import PageLoader from '@/components/shared/PageLoader';

// Lazy pages
const Home = lazy(() => import('@/features/home/HomePage'));
const Products = lazy(() => import('@/features/products/ProductsPage'));
const ProductDetail = lazy(() => import('@/features/products/ProductDetailPage'));
const Cart = lazy(() => import('@/features/cart/CartPage'));
const Wishlist = lazy(() => import('@/features/wishlist/WishlistPage'));
const Checkout = lazy(() => import('@/features/checkout/CheckoutPage'));
const PaymentResult = lazy(() => import('@/features/checkout/PaymentResultPage'));
const Login = lazy(() => import('@/features/auth/LoginPage'));
const Register = lazy(() => import('@/features/auth/RegisterPage'));
const ForgotPassword = lazy(() => import('@/features/auth/ForgotPasswordPage'));
const ResetPassword = lazy(() => import('@/features/auth/ResetPasswordPage'));
const VerifyEmail = lazy(() => import('@/features/auth/VerifyEmailPage'));
const Orders = lazy(() => import('@/features/orders/OrdersPage'));
const OrderDetail = lazy(() => import('@/features/orders/OrderDetailPage'));
const Profile = lazy(() => import('@/features/profile/ProfilePage'));
const Addresses = lazy(() => import('@/features/profile/AddressesPage'));
const GoogleCallback = lazy(() => import('@/pages/auth/GoogleCallback'));
const AdminDashboard = lazy(() => import('@/features/admin/DashboardPage'));
const AdminProducts = lazy(() => import('@/features/admin/ProductsPage'));
const AdminOrders = lazy(() => import('@/features/admin/OrdersPage'));
const AdminUsers = lazy(() => import('@/features/admin/UsersPage'));
const AdminCategories = lazy(() => import('@/features/admin/CategoriesPage'));
const AdminCoupons = lazy(() => import('@/features/admin/CouponsPage'));
const AdminInventoryPage = lazy(() => import('@/features/admin/StockManagementPage'));
const AdminProductMedia = lazy(() => import('@/features/admin/ProductMediaPage'));
const NotFound = lazy(() => import('@/features/misc/NotFoundPage'));

// ── Layouts ────────────────────────────────────────────────────
const RootLayout = () => (
  <div className="min-h-screen flex flex-col" style={{ background: 'rgb(var(--bg))' }}>
    <Navbar />
    <main className="flex-1 pb-20 md:pb-0">
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
    </main>
    <BottomNav />
  </div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/auth/login" replace />;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/auth/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return <>{children}</>;
};

const GuestRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <Navigate to="/" replace /> : <>{children}</>;
};

// ── Router ─────────────────────────────────────────────────────
const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'products', element: <Products /> },
      { path: 'products/:slug', element: <ProductDetail /> },
      { path: 'cart', element: <Cart /> },
      // Auth
      { path: 'auth/login', element: <GuestRoute><Login /></GuestRoute> },
      { path: 'auth/register', element: <GuestRoute><Register /></GuestRoute> },
      { path: 'auth/forgot-password', element: <GuestRoute><ForgotPassword /></GuestRoute> },
      { path: 'auth/reset-password', element: <ResetPassword /> },
      { path: 'auth/verify-email', element: <VerifyEmail /> },
      { path: 'auth/oauth-callback', element: <GoogleCallback /> },
      // Protected
      { path: 'wishlist', element: <ProtectedRoute><Wishlist /></ProtectedRoute> },
      { path: 'checkout', element: <Checkout /> },
      { path: 'payment/result', element: <ProtectedRoute><PaymentResult /></ProtectedRoute> },
      { path: 'orders', element: <ProtectedRoute><Orders /></ProtectedRoute> },
      { path: 'orders/:id', element: <ProtectedRoute><OrderDetail /></ProtectedRoute> },
      { path: 'profile', element: <ProtectedRoute><Profile /></ProtectedRoute> },
      { path: 'profile/addresses', element: <ProtectedRoute><Addresses /></ProtectedRoute> },
      // Admin
      { path: 'admin', element: <AdminRoute><AdminDashboard /></AdminRoute> },
      { path: 'admin/products', element: <AdminRoute><AdminProducts /></AdminRoute> },
      { path: 'admin/inventory', element: <AdminRoute><AdminInventoryPage /></AdminRoute> },
      { path: 'admin/orders', element: <AdminRoute><AdminOrders /></AdminRoute> },
      { path: 'admin/users', element: <AdminRoute><AdminUsers /></AdminRoute> },
      { path: 'admin/categories', element: <AdminRoute><AdminCategories /></AdminRoute> },
      { path: 'admin/coupons', element: <AdminRoute><AdminCoupons /></AdminRoute> },
      { path: 'admin/products/:id/media', element: <AdminRoute><AdminProductMedia /></AdminRoute> },
      // 404
      { path: '*', element: <NotFound /> },
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
