import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/auth-context';
import { getBookings, getNotifications, saveFeedback } from '../services/firebase';
import { caregivers, getRemainingBlockTime } from '../data/caregivers';
import FeedbackModal from '../components/FeedbackModal';
import ScoreGauge from '../components/ScoreGauge';
import { Calendar, Clock, Star, Search, RefreshCw, Lock, BadgeCheck, Shield, AlertTriangle, User, Briefcase, IndianRupee, MapPin, Bell, CheckCircle, Heart, TrendingUp, Award, FileText } from 'lucide-react';

const DEMO_BOOKINGS = [
  { id: '1', caregiverId: 1, caregiverName: 'Priya Sharma', domain: 'child', status: 'confirmed', createdAt: '2026-05-12T09:00:00.000Z' },
  { id: '2', caregiverId: 3, caregiverName: 'Suresh Babu', domain: 'human', status: 'completed', createdAt: '2026-05-11T15:00:00.000Z' },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { userProfile, role } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [feedbackFor, setFeedbackFor] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [patientId] = useState(() => {
    const existingId = localStorage.getItem('cm_patient_id');
    if (existingId) return existingId;

    const randomBytes = new Uint32Array(1);
    crypto.getRandomValues(randomBytes);
    const nextId = `PT-${20000 + (randomBytes[0] % 80000)}`;
    localStorage.setItem('cm_patient_id', nextId);
    return nextId;
  });

  // Track rated bookings (persist in localStorage)
  const [ratedBookings, setRatedBookings] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cm_rated_bookings') || '[]'); }
    catch { return []; }
  });

  const markAsRated = (bookingId) => {
    const updated = [...ratedBookings, bookingId];
    setRatedBookings(updated);
    localStorage.setItem('cm_rated_bookings', JSON.stringify(updated));
  };

  const isRated = (bookingId) => ratedBookings.includes(bookingId);

  // Favourites (shared with SearchPage via localStorage)
  const favourites = (() => { try { return JSON.parse(localStorage.getItem('cm_favourites') || '[]'); } catch { return []; } })();
  const favCaregivers = caregivers.filter(c => favourites.includes(c.id));

  // Family Safety Profile (persisted in localStorage)
  const [safetyProfile, setSafetyProfile] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cm_safety_profile') || '{}'); } catch { return {}; }
  });
  const [editingSafety, setEditingSafety] = useState(false);
  const saveSafetyProfile = (profile) => {
    setSafetyProfile(profile);
    localStorage.setItem('cm_safety_profile', JSON.stringify(profile));
    setEditingSafety(false);
  };

  useEffect(() => {
    getBookings().then(setBookings).catch(() => setBookings([]));
    if (role === 'caregiver') {
      getNotifications().then(n => setNotifications(n.filter(x => x.targetRole === 'caregiver'))).catch(() => {});
    }
  }, [role]);

  // Filter real caregiver bookings (exclude profile/upload/screening entries)
  const realBookings = bookings.filter(b => b.caregiverId && b.caregiverName);
  const demoBookings = realBookings.length > 0 ? realBookings : DEMO_BOOKINGS;

  const getCg = (id) => caregivers.find(c => c.id === id);
  const safeDate = (d) => { try { const dt = new Date(d); return isNaN(dt.getTime()) ? new Date() : dt; } catch { return new Date(); } };

  const userName = userProfile?.displayName || 'User';

  return (
    <div className="dashboard-page">
      <div className="container">
        {/* Role indicator badge */}
        <div className="role-badge-wrap">
          <div className={`role-badge ${role}`}>
            {role === 'patient' ? <User size={14} /> : <Briefcase size={14} />}
            <span>Logged in as <strong>{role === 'patient' ? 'Patient' : 'Caregiver'}</strong></span>
          </div>
        </div>

        <div className="dash-header">
          <div>
            <h1>{role === 'patient' ? `Welcome Back, ${userName} 👋` : `${userName}'s Dashboard 💼`}</h1>
            <p>{role === 'patient' ? `Patient ID: ${patientId} • Your care dashboard` : 'Manage your jobs, earnings & profile'}</p>
          </div>
          <div className="dash-actions">
            {role === 'patient' && (
              <button className="btn-primary" onClick={() => navigate('/search')}>
                <Search size={16} /> New Search
              </button>
            )}
            {role === 'caregiver' && (
              <button className="btn-primary" onClick={() => navigate('/onboarding')}>
                <BadgeCheck size={16} /> My Profile
              </button>
            )}
          </div>
        </div>

        {/* ===== PATIENT VIEW ===== */}
        {role === 'patient' && (
          <>
            <section className="dash-section">
              <h2>Active Bookings</h2>
              <div className="bookings-grid">
                {demoBookings.filter((b) => b.status === 'confirmed').map((b) => {
                  const cg = getCg(b.caregiverId);
                  return (
                    <div key={b.id} className="booking-card glass-card">
                      <div className="booking-top">
                        <div className="booking-avatar-img">
                          <img src={cg?.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(b.caregiverName)}&size=100&background=60a5fa&color=fff&format=svg`} alt={b.caregiverName} />
                        </div>
                        <div className="booking-info">
                          <h4>{b.caregiverName}</h4>
                          <span className="booking-domain">{b.domain} care</span>
                          {cg?.uniqueId && <span className="booking-id">{cg.uniqueId}</span>}
                        </div>
                        <span className="badge badge-trust">Active</span>
                      </div>
                      {(() => { const bt = cg ? getRemainingBlockTime(cg) : null; return bt ? (
                        <div className="booking-block-notice">
                          <Lock size={14} />
                          <span>Caregiver blocked from new jobs — {bt} remaining. Full focus on your care.</span>
                        </div>
                      ) : (
                        <div className="booking-block-notice active-block">
                          <Lock size={14} />
                          <span>4-hour dedicated focus period active. No parallel assignments.</span>
                        </div>
                      ); })()}
                      {cg?.govVerified && (
                        <span className="badge badge-trust" style={{ alignSelf: 'flex-start' }}><BadgeCheck size={12} /> Verified</span>
                      )}
                      <div className="booking-meta">
                        <span><Calendar size={14} /> {safeDate(b.createdAt).toLocaleDateString()}</span>
                        <span><Clock size={14} /> {safeDate(b.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <div className="booking-actions">
                        <button className="btn-secondary btn-sm" onClick={() => cg && navigate(`/caregiver/${cg.id}`)}>View Profile</button>
                        {isRated(b.id) ? (
                          <span className="btn-ghost btn-sm rated-badge"><CheckCircle size={14} /> Rated</span>
                        ) : (
                          <button className="btn-ghost btn-sm" onClick={() => cg && setFeedbackFor({ ...cg, bookingId: b.id })}>
                            <Star size={14} /> Rate Session
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
                {demoBookings.filter(b => b.status === 'confirmed').length === 0 && (
                  <div className="empty-state glass-card">
                    <Search size={32} />
                    <p>No active bookings yet.</p>
                    <button className="btn-primary" onClick={() => navigate('/search')}>Find a Caregiver</button>
                  </div>
                )}
              </div>
            </section>

            <section className="dash-section">
              <h2>Past Sessions</h2>
              <div className="bookings-grid">
                {demoBookings.filter((b) => b.status === 'completed').map((b) => {
                  const cg = getCg(b.caregiverId);
                  return (
                    <div key={b.id} className="booking-card glass-card past">
                      <div className="booking-top">
                        <div className="booking-avatar-img">
                          <img src={cg?.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(b.caregiverName)}&size=100&background=94a3b8&color=fff&format=svg`} alt={b.caregiverName} />
                        </div>
                        <div className="booking-info">
                          <h4>{b.caregiverName}</h4>
                          <span className="booking-domain">{b.domain} care</span>
                          {cg?.uniqueId && <span className="booking-id">{cg.uniqueId}</span>}
                        </div>
                        <span className="badge badge-warning">Completed</span>
                      </div>
                      <div className="booking-meta">
                        <span><Calendar size={14} /> {new Date(b.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="booking-actions">
                        <button className="btn-secondary btn-sm" onClick={() => navigate('/search')}>
                          <RefreshCw size={14} /> Re-book
                        </button>
                        {isRated(b.id) ? (
                          <span className="btn-ghost btn-sm rated-badge"><CheckCircle size={14} /> Rated</span>
                        ) : (
                          <button className="btn-ghost btn-sm" onClick={() => cg && setFeedbackFor({ ...cg, bookingId: b.id })}>
                            <Star size={14} /> Rate
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="dash-section">
              <h2>Your Trust Insights</h2>
              <div className="trust-grid">
                <div className="trust-card glass-card">
                  <h4>Sessions Completed</h4>
                  <span className="trust-big gradient-text">{demoBookings.length}</span>
                </div>
                <div className="trust-card glass-card">
                  <h4>Avg Trust Score</h4>
                  <ScoreGauge score={89} label="" size={80} />
                </div>
                <div className="trust-card glass-card">
                  <h4>Satisfaction Rate</h4>
                  <span className="trust-big gradient-text">98%</span>
                </div>
              </div>
            </section>

            {/* Favourites Section */}
            {favCaregivers.length > 0 && (
              <section className="dash-section">
                <h2><Heart size={18} /> Favourite Caregivers</h2>
                <div className="bookings-grid">
                  {favCaregivers.map(cg => (
                    <div key={cg.id} className="booking-card glass-card">
                      <div className="booking-top">
                        <div className="booking-avatar-img">
                          <img src={cg.photo} alt={cg.name} />
                        </div>
                        <div className="booking-info">
                          <h4>{cg.name}</h4>
                          <span className="booking-domain">{cg.category} care</span>
                          {cg.uniqueId && <span className="booking-id">{cg.uniqueId}</span>}
                        </div>
                        <span className="badge badge-trust"><Heart size={10} fill="#F87171" color="#F87171" /> Saved</span>
                      </div>
                      <div className="booking-meta">
                        <span><Star size={14} /> Trust: {cg.trustScore}/100</span>
                        <span><MapPin size={14} /> {cg.location.name}</span>
                        <span><IndianRupee size={14} /> ₹{cg.dailyCost}/day</span>
                      </div>
                      <div className="booking-actions">
                        <button className="btn-primary btn-sm" onClick={() => navigate('/search')}>Book Again</button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Family Safety Profile */}
            <section className="dash-section">
              <h2><Shield size={18} /> Family Safety Profile</h2>
              <div className="safety-card glass-card">
                {!editingSafety ? (
                  <>
                    <div className="safety-grid">
                      <div className="safety-item">
                        <span className="safety-label">Emergency Contact</span>
                        <span className="safety-value">{safetyProfile.emergencyContact || 'Not set'}</span>
                      </div>
                      <div className="safety-item">
                        <span className="safety-label">Emergency Phone</span>
                        <span className="safety-value">{safetyProfile.emergencyPhone || 'Not set'}</span>
                      </div>
                      <div className="safety-item">
                        <span className="safety-label">Blood Group</span>
                        <span className="safety-value">{safetyProfile.bloodGroup || 'Not set'}</span>
                      </div>
                      <div className="safety-item">
                        <span className="safety-label">Allergies</span>
                        <span className="safety-value">{safetyProfile.allergies || 'None specified'}</span>
                      </div>
                      <div className="safety-item full">
                        <span className="safety-label">Health Conditions</span>
                        <span className="safety-value">{safetyProfile.healthConditions || 'None specified'}</span>
                      </div>
                      <div className="safety-item full">
                        <span className="safety-label">Medications</span>
                        <span className="safety-value">{safetyProfile.medications || 'None specified'}</span>
                      </div>
                    </div>
                    <button className="btn-secondary btn-sm" style={{ marginTop: 'var(--space-3)', alignSelf: 'flex-start' }} onClick={() => setEditingSafety(true)}>
                      <FileText size={14} /> {Object.keys(safetyProfile).length > 0 ? 'Edit Profile' : 'Set Up Profile'}
                    </button>
                  </>
                ) : (
                  <div className="safety-form">
                    <div className="safety-form-grid">
                      <input className="input-field" placeholder="Emergency Contact Name" value={safetyProfile.emergencyContact || ''} onChange={e => setSafetyProfile(p => ({...p, emergencyContact: e.target.value}))} />
                      <input className="input-field" placeholder="Emergency Phone" value={safetyProfile.emergencyPhone || ''} onChange={e => setSafetyProfile(p => ({...p, emergencyPhone: e.target.value}))} />
                      <input className="input-field" placeholder="Blood Group (e.g. O+)" value={safetyProfile.bloodGroup || ''} onChange={e => setSafetyProfile(p => ({...p, bloodGroup: e.target.value}))} />
                      <input className="input-field" placeholder="Allergies" value={safetyProfile.allergies || ''} onChange={e => setSafetyProfile(p => ({...p, allergies: e.target.value}))} />
                      <input className="input-field" placeholder="Health Conditions" value={safetyProfile.healthConditions || ''} onChange={e => setSafetyProfile(p => ({...p, healthConditions: e.target.value}))} style={{ gridColumn: '1 / -1' }} />
                      <input className="input-field" placeholder="Medications" value={safetyProfile.medications || ''} onChange={e => setSafetyProfile(p => ({...p, medications: e.target.value}))} style={{ gridColumn: '1 / -1' }} />
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-3)' }}>
                      <button className="btn-primary btn-sm" onClick={() => saveSafetyProfile(safetyProfile)}>✅ Save</button>
                      <button className="btn-ghost btn-sm" onClick={() => setEditingSafety(false)}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </>
        )}

        {/* ===== CAREGIVER VIEW ===== */}
        {role === 'caregiver' && (
          <>
            {/* Caregiver Notifications */}
            {notifications.length > 0 && (
              <section className="dash-section">
                <h2><Bell size={18} /> Notifications</h2>
                <div className="notif-list">
                  {notifications.slice(0, 5).map((n, i) => (
                    <div key={n.id || i} className="notif-item glass-card">
                      <div className="notif-icon">📋</div>
                      <div className="notif-content">
                        <strong>{n.title}</strong>
                        <p>{n.body}</p>
                        <span className="notif-time">{n.createdAt ? new Date(n.createdAt?.seconds ? n.createdAt.seconds * 1000 : n.createdAt).toLocaleString('en-IN') : 'Just now'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="dash-section">
              <h2>📊 Your Stats</h2>
              <div className="trust-grid">
                <div className="trust-card glass-card">
                  <h4>Total Jobs</h4>
                  <span className="trust-big gradient-text">12</span>
                </div>
                <div className="trust-card glass-card">
                  <h4>This Month's Earnings</h4>
                  <span className="trust-big" style={{ color: 'var(--trust-green)' }}>₹8,400</span>
                </div>
                <div className="trust-card glass-card">
                  <h4>Screening Rating</h4>
                  <span className="trust-big gradient-text">⭐⭐⭐⭐⭐</span>
                </div>
              </div>
            </section>

            <section className="dash-section">
              <h2>📋 Upcoming Jobs</h2>
              <div className="bookings-grid">
                <div className="booking-card glass-card">
                  <div className="booking-top">
                    <div className="booking-avatar-img patient">
                      <img src={`https://ui-avatars.com/api/?name=Ananya+R&size=100&background=f59e0b&color=fff&format=svg`} alt="Patient" />
                    </div>
                    <div className="booking-info">
                      <h4>Ananya R.</h4>
                      <span className="booking-domain">Child Care — ADHD Support</span>
                      <span className="booking-id">PT-24891</span>
                    </div>
                    <span className="badge badge-trust">Assigned</span>
                  </div>
                  <div className="booking-meta">
                    <span><Calendar size={14} /> Today, 3:00 PM — 7:00 PM</span>
                    <span><MapPin size={14} /> Banjara Hills</span>
                    <span><IndianRupee size={14} /> ₹1,800</span>
                  </div>
                  <div className="booking-block-notice active-block">
                    <Lock size={14} />
                    <span>You are dedicated to this job. No other assignments during this period.</span>
                  </div>
                </div>
              </div>
            </section>

            <section className="dash-section">
              <h2>✅ Completed Jobs</h2>
              <div className="bookings-grid">
                <div className="booking-card glass-card past">
                  <div className="booking-top">
                    <div className="booking-avatar-img patient">
                      <img src={`https://ui-avatars.com/api/?name=Deepak+M&size=100&background=f59e0b&color=fff&format=svg`} alt="Patient" />
                    </div>
                    <div className="booking-info">
                      <h4>Deepak M.</h4>
                      <span className="booking-domain">Child Care — Evening shift</span>
                      <span className="booking-id">PT-31206</span>
                    </div>
                    <span className="badge badge-warning">Completed</span>
                  </div>
                  <div className="booking-meta">
                    <span><Calendar size={14} /> Yesterday</span>
                    <span><IndianRupee size={14} /> ₹1,200 earned</span>
                    <span><Star size={14} /> 5.0 ⭐ rating</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Earnings Dashboard */}
            <section className="dash-section">
              <h2><IndianRupee size={18} /> Earnings Dashboard</h2>
              <div className="trust-grid">
                <div className="trust-card glass-card">
                  <h4>Total Earnings</h4>
                  <span className="trust-big" style={{ color: 'var(--trust-green)' }}>₹24,600</span>
                  <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>↑ 12% from last month</span>
                </div>
                <div className="trust-card glass-card">
                  <h4>Avg per Session</h4>
                  <span className="trust-big gradient-text">₹1,450</span>
                </div>
                <div className="trust-card glass-card">
                  <h4>Completion Rate</h4>
                  <span className="trust-big" style={{ color: 'var(--trust-green)' }}>98%</span>
                </div>
              </div>
            </section>

            {/* Skill Upgrade Pathway */}
            <section className="dash-section">
              <h2><Award size={18} /> Skill Upgrade Pathway</h2>
              <div className="skill-cards">
                <div className="skill-card glass-card">
                  <div className="skill-header">
                    <span className="skill-icon">🟢</span>
                    <div>
                      <h4>First Aid Certification</h4>
                      <p>Increases match rate by <strong style={{ color: 'var(--trust-green)' }}>+18%</strong></p>
                    </div>
                  </div>
                  <div className="skill-bar"><div className="skill-progress" style={{ width: '0%' }} /></div>
                  <span className="skill-status">Not started</span>
                </div>
                <div className="skill-card glass-card">
                  <div className="skill-header">
                    <span className="skill-icon">🔵</span>
                    <div>
                      <h4>Medical Screening</h4>
                      <p>Increases match rate by <strong style={{ color: 'var(--trust-green)' }}>+15%</strong></p>
                    </div>
                  </div>
                  <div className="skill-bar"><div className="skill-progress" style={{ width: '60%' }} /></div>
                  <span className="skill-status">In progress</span>
                </div>
                <div className="skill-card glass-card">
                  <div className="skill-header">
                    <span className="skill-icon">✅</span>
                    <div>
                      <h4>Police Clearance</h4>
                      <p>Verification tier: <strong style={{ color: '#A78BFA' }}>Advanced → Medical</strong></p>
                    </div>
                  </div>
                  <div className="skill-bar"><div className="skill-progress" style={{ width: '100%' }} /></div>
                  <span className="skill-status" style={{ color: 'var(--trust-green)' }}>✅ Completed</span>
                </div>
              </div>
            </section>

            {/* Trust Score Trend */}
            <section className="dash-section">
              <h2><TrendingUp size={18} /> Trust Score Trend</h2>
              <div className="trend-card glass-card">
                <div className="trend-row">
                  <div className="trend-item"><span className="trend-month">Jan</span><div className="trend-bar" style={{ height: '60%' }}><span>72</span></div></div>
                  <div className="trend-item"><span className="trend-month">Feb</span><div className="trend-bar" style={{ height: '68%' }}><span>78</span></div></div>
                  <div className="trend-item"><span className="trend-month">Mar</span><div className="trend-bar" style={{ height: '75%' }}><span>82</span></div></div>
                  <div className="trend-item"><span className="trend-month">Apr</span><div className="trend-bar" style={{ height: '82%' }}><span>87</span></div></div>
                  <div className="trend-item active"><span className="trend-month">May</span><div className="trend-bar" style={{ height: '88%' }}><span>92</span></div></div>
                </div>
                <p className="trend-caption"><TrendingUp size={14} /> Your Trust Score improved <strong>+20 points</strong> over the last 5 months. Keep it up!</p>
              </div>
            </section>
          </>
        )}

        {/* Assignment Rules - shared */}
        <section className="dash-section">
          <div className="assignment-rules glass-card">
            <h3><Shield size={18} /> Assignment & Safety Rules</h3>
            <div className="rules-grid">
              <div className="rule-item">
                <Lock size={16} />
                <div>
                  <strong>4-Hour Dedicated Focus</strong>
                  <p>Once assigned, caregivers are blocked from new jobs for 4 hours. No parallel assignments.</p>
                </div>
              </div>
              <div className="rule-item">
                <BadgeCheck size={16} />
                <div>
                  <strong>Verified Profiles</strong>
                  <p>All caregivers have mandatory Government ID verification visible on their profile.</p>
                </div>
              </div>
              <div className="rule-item">
                <AlertTriangle size={16} />
                <div>
                  <strong>Safety & Legal</strong>
                  <p>Details may be shared with authorities in cases of misconduct. Live tracking active during assignments.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {feedbackFor && (
        <FeedbackModal
          caregiver={feedbackFor}
          onClose={() => setFeedbackFor(null)}
          onSubmit={(fb) => {
            saveFeedback(fb);
            if (feedbackFor.bookingId) markAsRated(feedbackFor.bookingId);
            setFeedbackFor(null);
          }}
        />
      )}

      <style>{`
        .dashboard-page { padding-top: 96px; padding-bottom: var(--space-16); min-height: 100vh; }
        .role-badge-wrap { display: flex; justify-content: center; margin-bottom: var(--space-6); }
        .role-badge {
          display: inline-flex; align-items: center; gap: var(--space-2);
          padding: var(--space-2) var(--space-5); border-radius: var(--radius-full);
          font-size: var(--fs-sm); font-weight: 500;
          border: 1px solid var(--border-glass);
        }
        .role-badge.patient { background: rgba(59,130,246,0.1); color: #60a5fa; border-color: rgba(59,130,246,0.25); }
        .role-badge.caregiver { background: rgba(16,185,129,0.1); color: #34d399; border-color: rgba(16,185,129,0.25); }
        .role-badge strong { font-weight: 700; }
        .dash-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-8); flex-wrap: wrap; gap: var(--space-4); }
        .dash-header h1 { font-size: var(--fs-3xl); }
        .dash-header p { color: var(--text-secondary); font-family: monospace; font-size: var(--fs-sm); }
        .dash-actions { display: flex; gap: var(--space-3); align-items: center; }
        .dash-section { margin-bottom: var(--space-8); }
        .dash-section h2 { font-size: var(--fs-xl); margin-bottom: var(--space-4); }
        .bookings-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: var(--space-4); }
        .booking-card { padding: var(--space-5); display: flex; flex-direction: column; gap: var(--space-3); }
        .booking-card.past { opacity: 0.8; }
        .booking-top { display: flex; align-items: center; gap: var(--space-3); }
        .booking-avatar-img { width: 52px; height: 52px; border-radius: var(--radius-full); overflow: hidden; flex-shrink: 0; border: 2px solid var(--primary-500); }
        .booking-avatar-img.patient { border-color: #f59e0b; }
        .booking-avatar-img img { width: 100%; height: 100%; object-fit: cover; }
        .booking-info { flex: 1; }
        .booking-info h4 { font-size: var(--fs-base); }
        .booking-domain { font-size: var(--fs-xs); color: var(--text-tertiary); text-transform: capitalize; display: block; }
        .booking-id { font-size: 10px; color: var(--text-muted); font-family: monospace; background: rgba(255,255,255,0.05); padding: 1px 6px; border-radius: var(--radius-sm); }
        .booking-meta { display: flex; gap: var(--space-4); font-size: var(--fs-xs); color: var(--text-muted); flex-wrap: wrap; }
        .booking-meta span { display: flex; align-items: center; gap: 4px; }
        .booking-actions { display: flex; gap: var(--space-2); }
        .btn-sm { padding: var(--space-2) var(--space-3); font-size: var(--fs-xs); }
        .trust-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-4); }
        .trust-card { padding: var(--space-6); text-align: center; display: flex; flex-direction: column; align-items: center; gap: var(--space-3); }
        .trust-card h4 { font-size: var(--fs-sm); color: var(--text-secondary); }
        .trust-big { font-family: var(--font-heading); font-size: var(--fs-4xl); font-weight: 800; }
        .booking-block-notice {
          display: flex; align-items: center; gap: var(--space-2);
          padding: var(--space-2) var(--space-3); border-radius: var(--radius-md);
          background: rgba(79,70,229,0.08); border: 1px solid rgba(79,70,229,0.2);
          font-size: var(--fs-xs); color: var(--primary-400);
        }
        .booking-block-notice.active-block {
          background: rgba(16,185,129,0.08); border-color: rgba(16,185,129,0.2); color: var(--trust-green);
        }
        .empty-state { padding: var(--space-8); display: flex; flex-direction: column; align-items: center; gap: var(--space-3); color: var(--text-muted); text-align: center; }
        .assignment-rules { padding: var(--space-6); }
        .assignment-rules h3 { display: flex; align-items: center; gap: var(--space-2); font-size: var(--fs-lg); margin-bottom: var(--space-4); }
        .rules-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: var(--space-4); }
        .rule-item { display: flex; gap: var(--space-3); align-items: flex-start; }
        .rule-item svg { color: var(--primary-400); flex-shrink: 0; margin-top: 2px; }
        .rule-item strong { font-size: var(--fs-sm); display: block; margin-bottom: 2px; }
        .rule-item p { font-size: var(--fs-xs); color: var(--text-secondary); }
        @media (max-width: 768px) { .trust-grid { grid-template-columns: 1fr; } .bookings-grid { grid-template-columns: 1fr; } }

        /* ── Notifications ── */
        .notif-list { display: flex; flex-direction: column; gap: var(--space-3); }
        .notif-item { display: flex; gap: var(--space-3); padding: var(--space-4); align-items: flex-start; }
        .notif-icon { font-size: 1.5rem; flex-shrink: 0; }
        .notif-content { flex: 1; }
        .notif-content strong { font-size: var(--fs-sm); display: block; margin-bottom: 2px; }
        .notif-content p { font-size: var(--fs-xs); color: var(--text-secondary); margin: 0; }
        .notif-time { font-size: var(--fs-xs); color: var(--text-muted); margin-top: 4px; display: inline-block; }

        /* ── Rated badge ── */
        .rated-badge { color: var(--trust-green) !important; display: flex; align-items: center; gap: 4px; cursor: default; }

        /* ── Safety Profile ── */
        .safety-card { padding: var(--space-5); display: flex; flex-direction: column; }
        .safety-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--space-3); }
        .safety-item { display: flex; flex-direction: column; gap: 4px; }
        .safety-item.full { grid-column: 1 / -1; }
        .safety-label { font-size: var(--fs-xs); color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
        .safety-value { font-size: var(--fs-sm); color: var(--text-primary); }
        .safety-form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--space-2); }

        /* ── Skill Upgrade ── */
        .skill-cards { display: flex; flex-direction: column; gap: var(--space-3); }
        .skill-card { padding: var(--space-4); display: flex; flex-direction: column; gap: var(--space-2); }
        .skill-header { display: flex; gap: var(--space-3); align-items: center; }
        .skill-icon { font-size: 1.3rem; }
        .skill-header h4 { font-size: var(--fs-sm); margin: 0; }
        .skill-header p { font-size: var(--fs-xs); color: var(--text-secondary); margin: 0; }
        .skill-bar { height: 6px; background: rgba(255,255,255,0.06); border-radius: 99px; overflow: hidden; }
        .skill-progress { height: 100%; background: linear-gradient(90deg, var(--primary-400), var(--trust-green)); border-radius: 99px; transition: width 0.6s ease; }
        .skill-status { font-size: var(--fs-xs); color: var(--text-muted); }

        /* ── Trust Trend ── */
        .trend-card { padding: var(--space-5); }
        .trend-row { display: flex; align-items: flex-end; justify-content: space-around; gap: var(--space-3); height: 160px; padding-bottom: var(--space-2); }
        .trend-item { display: flex; flex-direction: column; align-items: center; gap: var(--space-1); flex: 1; height: 100%; justify-content: flex-end; }
        .trend-month { font-size: var(--fs-xs); color: var(--text-muted); }
        .trend-bar { width: 100%; max-width: 40px; background: linear-gradient(180deg, var(--primary-400), rgba(79,70,229,0.3)); border-radius: 6px 6px 0 0; display: flex; align-items: flex-start; justify-content: center; padding-top: var(--space-1); transition: height 0.5s ease; }
        .trend-bar span { font-size: 11px; font-weight: 700; color: white; }
        .trend-item.active .trend-bar { background: linear-gradient(180deg, var(--trust-green), rgba(16,185,129,0.3)); }
        .trend-caption { font-size: var(--fs-sm); color: var(--text-secondary); display: flex; align-items: center; gap: var(--space-2); margin-top: var(--space-3); }
      `}</style>
    </div>
  );
}
