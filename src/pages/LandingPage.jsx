import { useNavigate } from 'react-router-dom';
import { Shield, ArrowRight, Search, Star, Baby, User, PawPrint, ChevronLeft, ChevronRight, BadgeCheck, Calendar, Bell, Briefcase } from 'lucide-react';
import { testimonials } from '../data/testimonials';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/auth-context';
import { useTranslation } from '../i18n/i18n';
import '../styles/animations.css';

export default function LandingPage() {
  const navigate = useNavigate();
  const { user, role, userProfile } = useAuth();
  const { t } = useTranslation();
  const isLoggedIn = !!user;
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTestimonialIdx((i) => (i + 1) % testimonials.length), 5000);
    return () => clearInterval(timer);
  }, []);

  const domains = [
    { icon: Baby, title: t('landing.child_care'), desc: t('landing.child_desc'), color: '#818CF8', bg: 'rgba(129,140,248,0.1)' },
    { icon: User, title: t('landing.human_care'), desc: t('landing.human_desc'), color: '#F472B6', bg: 'rgba(244,114,182,0.1)' },
    { icon: PawPrint, title: t('landing.pet_care'), desc: t('landing.pet_desc'), color: '#34D399', bg: 'rgba(52,211,153,0.1)' },
  ];

  const steps = [
    { num: '01', title: t('landing.step1_title'), desc: t('landing.step1_desc') },
    { num: '02', title: t('landing.step2_title'), desc: t('landing.step2_desc') },
    { num: '03', title: t('landing.step3_title'), desc: t('landing.step3_desc') },
    { num: '04', title: t('landing.step4_title'), desc: t('landing.step4_desc') },
  ];

  const stats = [
    { value: '10,000+', label: t('landing.stat_caregivers') },
    { value: '98%', label: t('landing.stat_satisfaction') },
    { value: '<30s', label: t('landing.stat_match_time') },
    { value: '4 hrs', label: t('landing.stat_focus') },
  ];

  const currentTestimonial = testimonials[testimonialIdx];

  return (
    <div className="landing">
      {/* Hero — Role-Aware */}
      <section className="hero">
        <div className="container hero-inner">
          {!isLoggedIn && (
            <>
              <div className="hero-badge animate-fade-in-down">
                <Shield size={14} /> {t('landing.hero_badge')}
              </div>
              <h1 className="hero-title animate-fade-in-up">
                <span className="gradient-text">{t('landing.hero_title')}</span>
              </h1>
              <p className="hero-sub animate-fade-in-up delay-2">
                {t('landing.hero_subtitle')}
              </p>
              <div className="hero-actions animate-fade-in-up delay-3">
                <button className="btn-primary hero-cta animate-pulse-glow" onClick={() => navigate('/login')}>
                  <Search size={18} /> {t('landing.get_started')} <ArrowRight size={18} />
                </button>
              </div>
            </>
          )}

          {isLoggedIn && role === 'patient' && (
            <>
              <div className="hero-badge animate-fade-in-down" style={{background:'rgba(59,130,246,0.12)',borderColor:'rgba(59,130,246,0.25)',color:'#60a5fa'}}>
                <User size={14} /> {t('dashboard.welcome')}, {userProfile?.displayName || 'Patient'}
              </div>
              <h1 className="hero-title animate-fade-in-up">
                <span className="gradient-text">{t('landing.hero_title')}</span>
              </h1>
              <p className="hero-sub animate-fade-in-up delay-2">
                {t('landing.hero_subtitle')}
              </p>
              <div className="hero-actions animate-fade-in-up delay-3">
                <button className="btn-primary hero-cta animate-pulse-glow" onClick={() => navigate('/search')}>
                  <Search size={18} /> {t('landing.find_caregiver')} <ArrowRight size={18} />
                </button>
                <button className="btn-secondary" onClick={() => navigate('/dashboard')}>
                  <Calendar size={18} /> {t('landing.my_dashboard')}
                </button>
              </div>
            </>
          )}

          {isLoggedIn && role === 'caregiver' && (
            <>
              <div className="hero-badge animate-fade-in-down" style={{background:'rgba(16,185,129,0.12)',borderColor:'rgba(16,185,129,0.25)',color:'#34d399'}}>
                <BadgeCheck size={14} /> {t('dashboard.welcome')}, {userProfile?.displayName || 'Caregiver'}
              </div>
              <h1 className="hero-title animate-fade-in-up">
                <span className="gradient-text">{t('landing.hero_title')}</span>
              </h1>
              <p className="hero-sub animate-fade-in-up delay-2">
                {t('landing.hero_subtitle')}
              </p>
              <div className="hero-actions animate-fade-in-up delay-3">
                <button className="btn-primary hero-cta animate-pulse-glow" onClick={() => navigate('/dashboard')}>
                  <Bell size={18} /> {t('landing.my_dashboard')} <ArrowRight size={18} />
                </button>
                <button className="btn-secondary" onClick={() => navigate('/onboarding')}>
                  <Briefcase size={18} /> {t('nav.onboarding')}
                </button>
              </div>
            </>
          )}
        </div>
        <div className="hero-gradient" />
      </section>

      {/* Stats */}
      <section className="stats-section">
        <div className="container stats-grid">
          {stats.map((s, i) => (
            <div key={i} className="stat-item animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
              <span className="stat-value gradient-text">{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Domains — visible to guests and patients */}
      {(!isLoggedIn || role === 'patient') && (
        <section className="section">
          <div className="container">
            <h2 className="section-title"><span className="gradient-text">{t('landing.categories_title')}</span></h2>
            <p className="section-sub">{t('landing.categories_sub')}</p>
            <div className="domain-grid">
              {domains.map((d, i) => {
                const Icon = d.icon;
                return (
                  <div key={i} className="domain-card glass-card" style={{ '--domain-color': d.color, '--domain-bg': d.bg }} onClick={() => navigate('/search')}>
                    <div className="domain-icon-wrap"><Icon size={32} /></div>
                    <h3>{d.title}</h3>
                    <p>{d.desc}</p>
                    <span className="domain-arrow"><ArrowRight size={16} /></span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Caregiver Quick Stats — only for caregivers */}
      {isLoggedIn && role === 'caregiver' && (
        <section className="section">
          <div className="container">
            <h2 className="section-title"><span className="gradient-text">{t('landing.cg_overview')}</span></h2>
            <div className="cg-quick-grid">
              <div className="cg-quick-card glass-card" onClick={() => navigate('/dashboard')}>
                <Bell size={28} className="cg-quick-icon" />
                <h3>{t('landing.cg_notifications')}</h3>
                <p>{t('landing.cg_notif_desc')}</p>
                <span className="domain-arrow"><ArrowRight size={16} /></span>
              </div>
              <div className="cg-quick-card glass-card" onClick={() => navigate('/onboarding')}>
                <Briefcase size={28} className="cg-quick-icon" />
                <h3>{t('landing.cg_profile')}</h3>
                <p>{t('landing.cg_profile_desc')}</p>
                <span className="domain-arrow"><ArrowRight size={16} /></span>
              </div>
              <div className="cg-quick-card glass-card" onClick={() => navigate('/dashboard')}>
                <Calendar size={28} className="cg-quick-icon" />
                <h3>{t('landing.cg_upcoming')}</h3>
                <p>{t('landing.cg_upcoming_desc')}</p>
                <span className="domain-arrow"><ArrowRight size={16} /></span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="section how-section">
        <div className="container">
          <h2 className="section-title"><span className="gradient-text">{t('landing.how_title')}</span></h2>
          <div className="steps-grid">
            {steps.map((s, i) => (
              <div key={i} className="step-card">
                <span className="step-num">{s.num}</span>
                <h4>{s.title}</h4>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section">
        <div className="container">
          <h2 className="section-title"><span className="gradient-text">{t('landing.testimonials_title')}</span></h2>
          <div className="testimonial-card glass-card">
            <div className="test-avatar">{currentTestimonial.avatar}</div>
            <p className="test-text">"{currentTestimonial.text}"</p>
            <div className="test-info">
              <strong>{currentTestimonial.name}</strong>
              <span>{currentTestimonial.location} • {currentTestimonial.domain === 'child' ? '👶 Child' : currentTestimonial.domain === 'human' ? '🧑 Human' : '🐾 Pet'}</span>
            </div>
            <div className="test-stars">
              {Array.from({ length: currentTestimonial.rating }).map((_, i) => <Star key={i} size={16} fill="#F59E0B" color="#F59E0B" />)}
            </div>
            <div className="test-nav">
              <button onClick={() => setTestimonialIdx((i) => (i - 1 + testimonials.length) % testimonials.length)}><ChevronLeft size={20} /></button>
              <div className="test-dots">
                {testimonials.map((_, i) => <span key={i} className={`dot ${i === testimonialIdx ? 'active' : ''}`} />)}
              </div>
              <button onClick={() => setTestimonialIdx((i) => (i + 1) % testimonials.length)}><ChevronRight size={20} /></button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA — role-aware */}
      <section className="section cta-section">
        <div className="container cta-inner">
          {!isLoggedIn && (
            <>
              <h2><span className="gradient-text">{t('landing.cta_guest_title')}</span></h2>
              <p>{t('landing.cta_guest_sub')}</p>
              <button className="btn-primary hero-cta animate-pulse-glow" onClick={() => navigate('/login')}>
                <Search size={18} /> {t('landing.cta_guest_btn')}
              </button>
            </>
          )}
          {isLoggedIn && role === 'patient' && (
            <>
              <h2><span className="gradient-text">{t('landing.cta_patient_title')}</span></h2>
              <p>{t('landing.cta_patient_sub')}</p>
              <button className="btn-primary hero-cta animate-pulse-glow" onClick={() => navigate('/search')}>
                <Search size={18} /> {t('landing.cta_patient_btn')}
              </button>
            </>
          )}
          {isLoggedIn && role === 'caregiver' && (
            <>
              <h2><span className="gradient-text">{t('landing.cta_cg_title')}</span></h2>
              <p>{t('landing.cta_cg_sub')}</p>
              <button className="btn-primary hero-cta animate-pulse-glow" onClick={() => navigate('/onboarding')}>
                <Briefcase size={18} /> {t('landing.cta_cg_btn')}
              </button>
            </>
          )}
        </div>
      </section>

      <style>{`
        .landing { padding-top: 64px; }
        .hero { position: relative; padding: var(--space-24) 0 var(--space-16); overflow: hidden; }
        .hero-inner { position: relative; z-index: 1; text-align: center; max-width: 800px; }
        .hero-badge {
          display: inline-flex; align-items: center; gap: var(--space-2);
          padding: var(--space-2) var(--space-4); border-radius: var(--radius-full);
          background: rgba(79,70,229,0.12); border: 1px solid rgba(79,70,229,0.25);
          color: var(--primary-400); font-size: var(--fs-sm); font-weight: 500;
          margin-bottom: var(--space-6);
        }
        .hero-title { font-size: clamp(2rem, 5vw, 3.5rem); margin-bottom: var(--space-4); line-height: 1.15; }
        .hero-sub { font-size: var(--fs-lg); color: var(--text-secondary); margin-bottom: var(--space-8); max-width: 600px; margin-left: auto; margin-right: auto; }
        .hero-actions { display: flex; gap: var(--space-4); justify-content: center; flex-wrap: wrap; }
        .hero-cta { padding: var(--space-4) var(--space-8); font-size: var(--fs-lg); }
        .hero-gradient {
          position: absolute; top: -50%; left: -20%; width: 140%; height: 200%;
          background: radial-gradient(ellipse at 50% 30%, rgba(79,70,229,0.15) 0%, transparent 60%);
          pointer-events: none;
        }
        .stats-section { padding: var(--space-8) 0; border-top: 1px solid var(--border-glass); border-bottom: 1px solid var(--border-glass); }
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-4); }
        .stat-item { text-align: center; }
        .stat-value { font-family: var(--font-heading); font-size: var(--fs-3xl); font-weight: 800; display: block; }
        .stat-label { font-size: var(--fs-sm); color: var(--text-tertiary); }
        .section-title { text-align: center; margin-bottom: var(--space-2); font-size: var(--fs-3xl); }
        .section-sub { text-align: center; color: var(--text-secondary); margin-bottom: var(--space-10); }
        .domain-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--space-6); }
        .domain-card {
          padding: var(--space-8); cursor: pointer; position: relative; overflow: hidden;
        }
        .domain-icon-wrap {
          width: 56px; height: 56px; border-radius: var(--radius-lg);
          background: var(--domain-bg); color: var(--domain-color);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: var(--space-4);
        }
        .domain-card h3 { font-size: var(--fs-xl); margin-bottom: var(--space-2); }
        .domain-card p { font-size: var(--fs-sm); color: var(--text-secondary); }
        .domain-arrow {
          position: absolute; top: var(--space-6); right: var(--space-6);
          color: var(--text-muted); transition: all var(--transition-base);
        }
        .domain-card:hover .domain-arrow { color: var(--domain-color); transform: translateX(4px); }
        .steps-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: var(--space-6); }
        .step-card { text-align: center; padding: var(--space-6); }
        .step-num {
          display: inline-block; font-family: var(--font-heading); font-size: var(--fs-4xl);
          font-weight: 800; background: linear-gradient(135deg, var(--primary-500), var(--violet-500));
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          margin-bottom: var(--space-3);
        }
        .step-card h4 { margin-bottom: var(--space-2); }
        .step-card p { font-size: var(--fs-sm); color: var(--text-secondary); }
        .testimonial-card {
          max-width: 600px; margin: 0 auto; padding: var(--space-8);
          text-align: center; display: flex; flex-direction: column;
          align-items: center; gap: var(--space-4);
        }
        .test-avatar { font-size: 3rem; }
        .test-text { font-size: var(--fs-base); color: var(--text-secondary); line-height: 1.7; font-style: italic; }
        .test-info strong { display: block; font-size: var(--fs-base); }
        .test-info span { font-size: var(--fs-sm); color: var(--text-tertiary); }
        .test-stars { display: flex; gap: 2px; }
        .test-nav { display: flex; align-items: center; gap: var(--space-4); }
        .test-nav button { background: none; border: none; color: var(--text-muted); cursor: pointer; padding: var(--space-1); }
        .test-nav button:hover { color: var(--text-primary); }
        .test-dots { display: flex; gap: 6px; }
        .dot { width: 8px; height: 8px; border-radius: var(--radius-full); background: var(--text-muted); transition: all var(--transition-fast); }
        .dot.active { background: var(--primary-500); width: 20px; }
        .cta-section { text-align: center; }
        .cta-inner { display: flex; flex-direction: column; align-items: center; gap: var(--space-4); }
        .cta-inner h2 { font-size: var(--fs-3xl); }
        .cta-inner p { color: var(--text-secondary); font-size: var(--fs-lg); }
        .cg-quick-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: var(--space-6); }
        .cg-quick-card {
          padding: var(--space-8); cursor: pointer; position: relative; overflow: hidden;
          transition: all var(--transition-base);
        }
        .cg-quick-card:hover { border-color: var(--primary-500); transform: translateY(-2px); }
        .cg-quick-icon { color: var(--primary-400); margin-bottom: var(--space-4); }
        .cg-quick-card h3 { font-size: var(--fs-xl); margin-bottom: var(--space-2); }
        .cg-quick-card p { font-size: var(--fs-sm); color: var(--text-secondary); }
        @media (max-width: 768px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .hero-cta { width: 100%; justify-content: center; }
        }
      `}</style>
    </div>
  );
}
