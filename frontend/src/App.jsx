import { useEffect, useRef, useState, lazy, Suspense, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Outlet, useNavigate, useLocation, NavLink } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import TopNavbar from './components/TopNavbar';
import GlobalSearch from './components/GlobalSearch';
import ErrorBoundary from './components/ErrorBoundary';
import Loader from './components/Loader';
import {
  HiOutlineViewGrid,
  HiOutlineUsers,
  HiOutlineClock,
  HiOutlineStar,
  HiOutlineSearch,
  HiOutlinePlus,
} from 'react-icons/hi';

const LoginPage = lazy(() => import('./pages/LoginPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const LeadsPage = lazy(() => import('./pages/LeadsPage'));
const LeadDetailPage = lazy(() => import('./pages/LeadDetailPage'));
const RecentLeadsPage = lazy(() => import('./pages/RecentLeadsPage'));
const RecentActivityPage = lazy(() => import('./pages/RecentActivityPage'));
const ServicePrompt = lazy(() => import('./pages/ServicePrompt'));

function PromptScheduler() {
  const navigate = useNavigate();
  const timerRef = useRef(null);

  const shouldShowPrompt = () => localStorage.getItem('servicePromptCompleted') !== 'true';

  const scheduleTenMin = useCallback(() => {
    if (!shouldShowPrompt()) return;
    timerRef.current = setTimeout(() => {
      navigate('/service-prompt');
    }, 10 * 60 * 1000);
  }, [navigate]);

  useEffect(() => {
    if (!shouldShowPrompt()) return;
    timerRef.current = setTimeout(() => {
      const skipped = localStorage.getItem('servicePromptSkipped') === 'true';
      if (skipped) {
        scheduleTenMin();
      } else {
        navigate('/service-prompt');
      }
    }, 3 * 60 * 1000);
    return () => clearTimeout(timerRef.current);
  }, [navigate, scheduleTenMin]);

  useEffect(() => {
    const handleStorage = () => {
      if (!shouldShowPrompt()) return;
      if (localStorage.getItem('servicePromptSkipped') === 'true') {
        scheduleTenMin();
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      clearTimeout(timerRef.current);
    };
  }, [scheduleTenMin]);

  return null;
}

const navItems = [
  { path: '/', icon: <HiOutlineViewGrid />, label: 'Dashboard' },
  { path: '/leads', icon: <HiOutlineUsers />, label: 'Leads' },
  { path: '/recent-leads', icon: <HiOutlineStar />, label: 'Recent' },
  { path: '/recent-activity', icon: <HiOutlineClock />, label: 'Activity' },
];

function BottomNav() {
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={`bottom-nav__link ${isActive(item.path) ? 'bottom-nav__link--active' : ''}`}
        >
          <span className="bottom-nav__link-icon">{item.icon}</span>
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

function AuthenticatedLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="app-layout">
      <TopNavbar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <GlobalSearch />
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <main className="main-content">
        <Outlet />
      </main>
      <BottomNav />
      <button
        className="mobile-fab"
        onClick={() => navigate('/leads', { state: { openAddLead: true } })}
        aria-label="Add Lead"
      >
        <HiOutlinePlus size={22} />
      </button>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <PromptScheduler />
          <Suspense fallback={<Loader />}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                element={
                  <ProtectedRoute>
                    <AuthenticatedLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/" element={<DashboardPage />} />
                <Route path="/leads" element={<LeadsPage />} />
                <Route path="/leads/:id" element={<LeadDetailPage />} />
                <Route path="/recent-leads" element={<RecentLeadsPage />} />
                <Route path="/recent-activity" element={<RecentActivityPage />} />
                <Route path="/service-prompt" element={<ServicePrompt />} />
              </Route>
              <Route path="*" element={<LoginPage />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            className: 'glass-card',
            style: {
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              backdropFilter: 'blur(16px)',
            },
          }}
        />
      </AuthProvider>
    </ErrorBoundary>
  );
}
