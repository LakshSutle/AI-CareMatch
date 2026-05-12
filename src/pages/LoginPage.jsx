import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/auth-context';
import { Shield, Mail, Lock, User, Briefcase, Heart, Eye, EyeOff, ArrowRight, AlertTriangle } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, signup, isAuthenticated } = useAuth();

  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [role, setRole] = useState('patient'); // 'patient' or 'caregiver'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // If already logged in, redirect
  if (isAuthenticated) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  const friendlyError = (code) => {
    const map = {
      'auth/email-already-in-use': 'An account with this email already exists. Try logging in.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/weak-password': 'Password must be at least 6 characters.',
      'auth/user-not-found': 'No account found with this email. Sign up first.',
      'auth/wrong-password': 'Incorrect password. Please try again.',
      'auth/invalid-credential': 'Invalid email or password. Please try again.',
      'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
    };
    return map[code] || 'Something went wrong. Please try again.';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (mode === 'signup') {
        if (!displayName.trim()) { setError('Please enter your full name.'); setSubmitting(false); return; }
        if (password.length < 6) { setError('Password must be at least 6 characters.'); setSubmitting(false); return; }
        await signup(email, password, role, displayName.trim());
      } else {
        await login(email, password);
      }
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(friendlyError(err.code));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Left — branding panel */}
        <div className="login-brand-panel">
          <div className="login-brand-content">
            <div className="login-logo">
              <Shield size={40} />
              <span>AI <span className="gradient-text">CareMatch</span></span>
            </div>
            <h2>Trust-Based Caregiver Intelligence</h2>
            <p>Securely access your personalized dashboard. Your data, your privacy — always protected.</p>
            <div className="login-features">
              <div className="login-feature"><Lock size={16} /> <span>End-to-end encrypted profiles</span></div>
              <div className="login-feature"><Shield size={16} /> <span>Role-based access control</span></div>
              <div className="login-feature"><Heart size={16} /> <span>Verified caregiver community</span></div>
            </div>
          </div>
          <div className="login-brand-gradient" />
        </div>

        {/* Right — form panel */}
        <div className="login-form-panel">
          <div className="login-form-inner">
            <h1>{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h1>
            <p className="login-subtitle">
              {mode === 'login'
                ? 'Sign in to access your dashboard'
                : 'Join AI CareMatch — choose your role below'}
            </p>

            {/* Role selector (signup only) */}
            {mode === 'signup' && (
              <div className="role-selector">
                <button
                  type="button"
                  className={`role-card ${role === 'patient' ? 'active' : ''}`}
                  onClick={() => setRole('patient')}
                >
                  <div className="role-icon patient-icon"><User size={24} /></div>
                  <strong>I'm a Patient</strong>
                  <span>Find & book trusted caregivers</span>
                </button>
                <button
                  type="button"
                  className={`role-card ${role === 'caregiver' ? 'active' : ''}`}
                  onClick={() => setRole('caregiver')}
                >
                  <div className="role-icon caregiver-icon"><Briefcase size={24} /></div>
                  <strong>I'm a Caregiver</strong>
                  <span>Get verified & receive jobs</span>
                </button>
              </div>
            )}

            {/* Error banner */}
            {error && (
              <div className="login-error">
                <AlertTriangle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="login-form">
              {mode === 'signup' && (
                <div className="input-group">
                  <label htmlFor="displayName">Full Name</label>
                  <div className="input-wrap">
                    <User size={18} className="input-icon" />
                    <input
                      id="displayName"
                      type="text"
                      placeholder="Enter your full name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      required
                      autoComplete="name"
                    />
                  </div>
                </div>
              )}

              <div className="input-group">
                <label htmlFor="email">Email Address</label>
                <div className="input-wrap">
                  <Mail size={18} className="input-icon" />
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="password">Password</label>
                <div className="input-wrap">
                  <Lock size={18} className="input-icon" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={mode === 'signup' ? 'Min 6 characters' : 'Enter your password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn-primary login-submit" disabled={submitting}>
                {submitting ? (
                  <span className="login-spinner" />
                ) : (
                  <>
                    {mode === 'login' ? 'Sign In' : 'Create Account'}
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            {/* Mode toggle */}
            <div className="login-mode-toggle">
              {mode === 'login' ? (
                <p>Don't have an account? <button type="button" onClick={() => { setMode('signup'); setError(''); }}>Sign Up</button></p>
              ) : (
                <p>Already have an account? <button type="button" onClick={() => { setMode('login'); setError(''); }}>Sign In</button></p>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-4);
          padding-top: 80px;
        }
        .login-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          max-width: 960px;
          width: 100%;
          border-radius: var(--radius-2xl);
          overflow: hidden;
          border: 1px solid var(--border-glass);
          background: var(--bg-card);
          box-shadow: 0 25px 80px rgba(0,0,0,0.4);
        }

        /* ── Brand panel ── */
        .login-brand-panel {
          position: relative;
          padding: var(--space-10);
          display: flex;
          flex-direction: column;
          justify-content: center;
          background: linear-gradient(145deg, rgba(79,70,229,0.15) 0%, rgba(139,92,246,0.08) 100%);
          overflow: hidden;
        }
        .login-brand-gradient {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 30% 70%, rgba(79,70,229,0.25) 0%, transparent 60%);
          pointer-events: none;
        }
        .login-brand-content { position: relative; z-index: 1; }
        .login-logo {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          margin-bottom: var(--space-6);
          color: var(--primary-400);
          font-family: var(--font-heading);
          font-weight: 700;
          font-size: var(--fs-2xl);
        }
        .login-logo span { color: var(--text-primary); }
        .login-brand-panel h2 {
          font-size: var(--fs-2xl);
          margin-bottom: var(--space-3);
          line-height: 1.3;
        }
        .login-brand-panel > .login-brand-content > p {
          color: var(--text-secondary);
          font-size: var(--fs-sm);
          line-height: 1.6;
          margin-bottom: var(--space-8);
        }
        .login-features { display: flex; flex-direction: column; gap: var(--space-3); }
        .login-feature {
          display: flex; align-items: center; gap: var(--space-2);
          font-size: var(--fs-sm); color: var(--text-secondary);
        }
        .login-feature svg { color: var(--primary-400); flex-shrink: 0; }

        /* ── Form panel ── */
        .login-form-panel {
          padding: var(--space-10);
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .login-form-inner h1 {
          font-size: var(--fs-2xl);
          margin-bottom: var(--space-1);
        }
        .login-subtitle {
          color: var(--text-secondary);
          font-size: var(--fs-sm);
          margin-bottom: var(--space-6);
        }

        /* ── Role selector ── */
        .role-selector {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-3);
          margin-bottom: var(--space-5);
        }
        .role-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-4) var(--space-3);
          border-radius: var(--radius-xl);
          border: 2px solid var(--border-glass);
          background: transparent;
          color: var(--text-primary);
          cursor: pointer;
          transition: all var(--transition-base);
          text-align: center;
        }
        .role-card:hover { border-color: var(--primary-500); }
        .role-card.active {
          border-color: var(--primary-500);
          background: rgba(79,70,229,0.1);
          box-shadow: 0 0 24px rgba(79,70,229,0.2);
        }
        .role-card strong { font-size: var(--fs-sm); }
        .role-card span { font-size: 11px; color: var(--text-muted); }
        .role-icon {
          width: 48px; height: 48px;
          border-radius: var(--radius-full);
          display: flex; align-items: center; justify-content: center;
        }
        .patient-icon { background: rgba(59,130,246,0.15); color: #60a5fa; }
        .caregiver-icon { background: rgba(16,185,129,0.15); color: #34d399; }

        /* ── Error ── */
        .login-error {
          display: flex; align-items: center; gap: var(--space-2);
          padding: var(--space-3) var(--space-4);
          border-radius: var(--radius-lg);
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.25);
          color: #f87171;
          font-size: var(--fs-sm);
          margin-bottom: var(--space-4);
        }
        .login-error svg { flex-shrink: 0; }

        /* ── Form ── */
        .login-form { display: flex; flex-direction: column; gap: var(--space-4); }
        .input-group { display: flex; flex-direction: column; gap: 4px; }
        .input-group label {
          font-size: var(--fs-xs);
          font-weight: 500;
          color: var(--text-tertiary);
        }
        .input-wrap {
          display: flex; align-items: center;
          background: var(--bg-primary);
          border: 1px solid var(--border-glass);
          border-radius: var(--radius-lg);
          padding: 0 var(--space-3);
          transition: border-color var(--transition-fast);
        }
        .input-wrap:focus-within { border-color: var(--primary-500); box-shadow: 0 0 0 3px rgba(79,70,229,0.15); }
        .input-icon { color: var(--text-muted); flex-shrink: 0; }
        .input-wrap input {
          flex: 1;
          padding: var(--space-3) var(--space-2);
          background: transparent;
          border: none;
          outline: none;
          color: var(--text-primary);
          font-size: var(--fs-sm);
          font-family: inherit;
        }
        .input-wrap input::placeholder { color: var(--text-muted); }
        .password-toggle {
          display: flex; align-items: center; justify-content: center;
          background: none; border: none; color: var(--text-muted);
          cursor: pointer; padding: 4px;
          transition: color var(--transition-fast);
        }
        .password-toggle:hover { color: var(--text-primary); }

        /* ── Submit ── */
        .login-submit {
          width: 100%;
          padding: var(--space-3) var(--space-6);
          font-size: var(--fs-base);
          display: flex; align-items: center; justify-content: center; gap: var(--space-2);
          margin-top: var(--space-2);
        }
        .login-submit:disabled { opacity: 0.6; cursor: not-allowed; }

        .login-spinner {
          width: 20px; height: 20px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Mode toggle ── */
        .login-mode-toggle {
          text-align: center;
          margin-top: var(--space-5);
        }
        .login-mode-toggle p {
          font-size: var(--fs-sm);
          color: var(--text-secondary);
        }
        .login-mode-toggle button {
          background: none; border: none;
          color: var(--primary-400);
          font-weight: 600; cursor: pointer;
          text-decoration: underline;
          font-size: var(--fs-sm);
          font-family: inherit;
        }
        .login-mode-toggle button:hover { color: var(--primary-300); }

        /* ── Loading spinner for ProtectedRoute ── */
        .auth-loading-spinner {
          width: 36px; height: 36px;
          border: 3px solid var(--border-glass);
          border-top-color: var(--primary-500);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .login-container { grid-template-columns: 1fr; }
          .login-brand-panel { display: none; }
          .login-form-panel { padding: var(--space-6); }
          .role-selector { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
