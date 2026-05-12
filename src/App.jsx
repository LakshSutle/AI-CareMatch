import { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const CaregiverProfilePage = lazy(() => import('./pages/CaregiverProfilePage'));
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const WhatsAppPage = lazy(() => import('./pages/WhatsAppPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const CareBot = lazy(() => import('./components/CareBot'));

function PageLoader() {
  return (
    <div style={{ minHeight: '50vh', display: 'grid', placeItems: 'center', color: 'var(--text-secondary)' }}>
      Loading...
    </div>
  );
}

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar theme={theme} setTheme={setTheme} />
        <main>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/caregiver/:id" element={<CaregiverProfilePage />} />
              <Route path="/onboarding" element={
                <ProtectedRoute requiredRole="caregiver">
                  <OnboardingPage />
                </ProtectedRoute>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } />
              <Route path="/whatsapp" element={<WhatsAppPage />} />
            </Routes>
          </Suspense>
        </main>
        <footer className="site-footer">
          <div className="container footer-inner">
            <p>© 2026 AI CareMatch — Trust-Based Caregiver Intelligence Platform</p>
            <p className="footer-tagline">AI CareMatch doesn't just find caregivers — it helps you choose the right one, safely and confidently.</p>
          </div>
          <style>{`
            .site-footer {
              padding: var(--space-8) 0;
              border-top: 1px solid var(--border-glass);
              text-align: center;
              margin-top: var(--space-16);
            }
            .footer-inner { display: flex; flex-direction: column; gap: var(--space-2); }
            .footer-inner p { font-size: var(--fs-sm); color: var(--text-muted); }
            .footer-tagline { font-style: italic; font-size: var(--fs-xs); }
          `}</style>
        </footer>
        <Suspense fallback={null}>
          <CareBot />
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}
