import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/auth-context';
import { Menu, X, Sun, Moon, Shield, LogOut, Globe } from 'lucide-react';
import { useTranslation, LANGUAGES } from '../i18n/i18n';
import SOSButton from './SOSButton';

export default function Navbar({ theme, setTheme }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const { t, lang: currentLang, setLang } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, userProfile, role, logout, loading } = useAuth();

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    navigate('/');
  };

  // Build links dynamically based on auth state
  const links = [
    { path: '/', label: t('nav.home') },
    { path: '/search', label: t('nav.search') },
  ];
  if (isAuthenticated && role === 'caregiver') {
    links.push({ path: '/onboarding', label: t('nav.onboarding') });
  }
  if (isAuthenticated) {
    links.push({ path: '/dashboard', label: t('nav.dashboard') });
  }

  const displayName = userProfile?.displayName || 'User';
  const initials = displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <nav className="navbar">
      <div className="navbar-inner container">
        <Link to="/" className="navbar-brand">
          <Shield size={28} strokeWidth={2.5} />
          <span className="brand-text">
            AI <span className="gradient-text">CareMatch</span>
          </span>
        </Link>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}

          {!loading && !isAuthenticated && (
            <button
              className="btn-primary nav-cta"
              onClick={() => { setMenuOpen(false); navigate('/login'); }}
            >
              {t('nav.login')}
            </button>
          )}

          {!loading && isAuthenticated && (
            <div className="nav-user-section">
              <div className="nav-user-badge" onClick={() => { setMenuOpen(false); navigate('/dashboard'); }}>
                <div className="nav-avatar">{initials}</div>
                <div className="nav-user-info">
                  <span className="nav-user-name">{displayName}</span>
                  <span className="nav-user-role">{role === 'caregiver' ? '💼 Caregiver' : '🩺 Patient'}</span>
                </div>
              </div>
              <SOSButton />
              <button className="nav-logout-btn" onClick={handleLogout} title="Logout">
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>

        <div className="navbar-actions">
          {/* Language Selector */}
          <div className="lang-selector">
            <button className="theme-toggle" onClick={() => setLangOpen(!langOpen)} title="Language">
              <Globe size={18} />
            </button>
            {langOpen && (
              <div className="lang-dropdown">
                {LANGUAGES.map(l => (
                  <button
                    key={l.code}
                    className={`lang-option ${currentLang === l.code ? 'active' : ''}`}
                    onClick={() => { setLang(l.code); setLangOpen(false); }}
                  >
                    <span>{l.flag}</span>
                    <span>{l.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            className="theme-toggle"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <style>{`
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: var(--z-sticky);
          background: rgba(15, 13, 26, 0.8);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border-glass);
        }
        [data-theme="light"] .navbar {
          background: rgba(248, 250, 255, 0.85);
        }
        .navbar-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 64px;
          gap: var(--space-8);
        }
        .navbar-brand {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          color: var(--text-primary);
          text-decoration: none;
        }
        .navbar-brand svg { color: var(--primary-500); }
        .brand-text {
          font-family: var(--font-heading);
          font-weight: 700;
          font-size: var(--fs-xl);
        }
        .navbar-links {
          display: flex;
          align-items: center;
          gap: var(--space-6);
        }
        .nav-link {
          color: var(--text-secondary);
          font-weight: 500;
          font-size: var(--fs-sm);
          text-decoration: none;
          padding: var(--space-2) 0;
          position: relative;
          transition: color var(--transition-fast);
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, var(--primary-500), var(--violet-500));
          border-radius: 1px;
          transition: width var(--transition-base);
        }
        .nav-link:hover, .nav-link.active { color: var(--text-primary); }
        .nav-link:hover::after, .nav-link.active::after { width: 100%; }
        .nav-cta { padding: var(--space-2) var(--space-5); font-size: var(--fs-sm); }
        .navbar-actions { display: flex; align-items: center; gap: var(--space-2); }
        .theme-toggle {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: var(--radius-md);
          background: var(--bg-card);
          color: var(--text-secondary);
          border: 1px solid var(--border-glass);
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .theme-toggle:hover { background: var(--bg-card-hover); color: var(--text-primary); }
        .menu-toggle {
          display: none;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          background: none;
          border: none;
          color: var(--text-primary);
          cursor: pointer;
        }

        /* ── User section in navbar ── */
        .nav-user-section {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          margin-left: var(--space-2);
        }
        .nav-user-badge {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: 4px var(--space-3) 4px 4px;
          border-radius: var(--radius-full);
          background: var(--bg-card);
          border: 1px solid var(--border-glass);
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .nav-user-badge:hover { border-color: var(--primary-500); }
        .nav-avatar {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-full);
          background: var(--primary-gradient);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          font-family: var(--font-heading);
        }
        .nav-user-info {
          display: flex;
          flex-direction: column;
          line-height: 1.2;
        }
        .nav-user-name {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-primary);
        }
        .nav-user-role {
          font-size: 10px;
          color: var(--text-muted);
        }
        .nav-logout-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: var(--radius-md);
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.15);
          color: #f87171;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .nav-logout-btn:hover {
          background: rgba(239,68,68,0.15);
          border-color: rgba(239,68,68,0.3);
        }

        @media (max-width: 768px) {
          .navbar-links {
            display: none;
            position: fixed;
            top: 64px;
            left: 0;
            right: 0;
            bottom: 0;
            flex-direction: column;
            justify-content: flex-start;
            padding: var(--space-8);
            gap: var(--space-4);
            background: var(--bg-primary);
          }
          .navbar-links.open { display: flex; }
          .menu-toggle { display: flex; }
          .nav-cta { width: 100%; margin-top: var(--space-4); }
          .nav-user-section { flex-direction: column; gap: var(--space-3); width: 100%; margin-left: 0; margin-top: var(--space-4); }
          .nav-user-badge { width: 100%; justify-content: center; }
          .nav-logout-btn { width: 100%; border-radius: var(--radius-lg); padding: var(--space-2); }
        }

        /* ── Language Selector ── */
        .lang-selector { position: relative; }
        .lang-dropdown {
          position: absolute; top: 100%; right: 0; margin-top: var(--space-2);
          background: var(--bg-card); border: 1px solid var(--border-glass);
          border-radius: var(--radius-lg); padding: var(--space-1);
          min-width: 140px; z-index: 100;
          box-shadow: 0 8px 32px rgba(0,0,0,0.3);
          animation: fadeIn 0.15s ease;
        }
        .lang-option {
          display: flex; align-items: center; gap: var(--space-2);
          width: 100%; padding: var(--space-2) var(--space-3);
          background: none; border: none; color: var(--text-secondary);
          font-size: var(--fs-sm); cursor: pointer; border-radius: var(--radius-md);
          transition: all var(--transition-fast);
        }
        .lang-option:hover { background: rgba(255,255,255,0.06); color: var(--text-primary); }
        .lang-option.active { background: rgba(79,70,229,0.12); color: var(--primary-400); font-weight: 600; }
      `}</style>
    </nav>
  );
}
