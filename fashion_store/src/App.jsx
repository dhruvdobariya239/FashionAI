import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Pages
import Home from './pages/Home';
import CategoryPage from './pages/category/CategoryPage';
import ProductDetail from './pages/ProductDetail';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Profile from './pages/profile/Profile';
import MobileUpload from './pages/profile/MobileUpload';
import SkinToneRecommendations from './pages/profile/SkinToneRecommendations';
import TryOnGallery from './pages/profile/TryOnGallery';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';

// Toast config
const TOAST_OPTIONS = {
  style: {
    background: '#FFFFFF',
    color: '#111110',
    border: '1px solid #E4E0D8',
    borderRadius: '0',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '0.875rem',
    boxShadow: '0 4px 20px rgba(17,17,16,0.12)',
  },
  success: { iconTheme: { primary: '#C9A84C', secondary: '#fff' } },
  error: { iconTheme: { primary: '#DC2626', secondary: '#fff' } },
};

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

// Main app shell (with Navbar + Footer)
const AppShell = () => (
  <>
    <Navbar />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/:gender" element={<CategoryPage />} />
      <Route path="/product/:id" element={<ProductDetail />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/profile/skin-tone" element={<ProtectedRoute><SkinToneRecommendations /></ProtectedRoute>} />
      <Route path="/profile/tryon-gallery" element={<ProtectedRoute><TryOnGallery /></ProtectedRoute>} />
      <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
      <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
      <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    <Footer />
    <Toaster position="top-right" toastOptions={TOAST_OPTIONS} />
  </>
);

// Standalone shell (no Navbar / Footer) — used for mobile upload page
const StandaloneShell = () => (
  <>
    <Routes>
      <Route path="/mobile-upload/:token" element={<MobileUpload />} />
    </Routes>
    <Toaster position="top-right" toastOptions={TOAST_OPTIONS} />
  </>
);

// Root: decide which shell to render based on pathname
const AppRoutes = () => {
  const isMobileUpload = window.location.pathname.startsWith('/mobile-upload/');
  return isMobileUpload ? <StandaloneShell /> : <AppShell />;
};

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <CartProvider>
        <AppRoutes />
      </CartProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
