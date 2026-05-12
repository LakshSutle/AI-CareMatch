import { useParams, useNavigate } from 'react-router-dom';
import { caregivers, getRemainingBlockTime } from '../data/caregivers';
import ScoreGauge from '../components/ScoreGauge';
import RadarChart from '../components/RadarChart';
import { ShieldCheck, ShieldX, MapPin, Star, ArrowLeft, BadgeCheck, Lock, IndianRupee, MapPinned } from 'lucide-react';

export default function CaregiverProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const cg = caregivers.find((c) => c.id === Number(id));

  if (!cg) return (
    <div className="profile-page container" style={{ paddingTop: 120, textAlign: 'center' }}>
      <h2>Caregiver not found</h2>
      <button className="btn-primary" onClick={() => navigate('/search')}>Back to Search</button>
    </div>
  );

  const verifications = [
    { key: 'faceLiveness', label: 'Live Selfie Verification', passed: cg.verification.faceLiveness },
    { key: 'govId', label: 'Government ID', passed: cg.verification.govId },
    { key: 'digilocker', label: 'ID Upload Match', passed: cg.verification.digilocker },
    { key: 'documentOCR', label: 'Document OCR', passed: cg.verification.documentOCR },
    { key: 'policeClearance', label: 'Police Clearance', passed: cg.verification.policeClearance },
    { key: 'referenceCheck', label: 'Reference Check', passed: cg.verification.referenceCheck },
    { key: 'liveSelfie', label: 'AI Face Match', passed: cg.verification.liveSelfie },
    { key: 'medicalScreening', label: 'Medical Professor Screening', passed: cg.verification.medicalScreening },
  ];

  const blockTime = getRemainingBlockTime(cg);

  // Simulated dimension scores for radar
  const scores = {
    proximity: 75,
    availability: (cg.availability.morning + cg.availability.afternoon + cg.availability.evening + cg.availability.night + cg.availability.weekends) / 5 * 100,
    experience: Math.min(100, (cg.stats.totalSessions / 6)),
    verification: verifications.filter((v) => v.passed).length * 25,
    reliability: Math.round(cg.stats.onTimeRate * 40 + (1 - cg.stats.cancellationRate) * 30 + cg.stats.completionRate * 30),
    budgetFit: 70,
  };

  return (
    <div className="profile-page">
      <div className="container">
        <button className="back-btn btn-ghost" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Back
        </button>

        <div className="profile-header glass-card">
          <div className="profile-avatar"><img src={cg.photo} alt={cg.name} /></div>
          <div className="profile-info">
            <h1>{cg.name}</h1>
            {cg.uniqueId && <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', fontFamily: 'monospace' }}>ID: {cg.uniqueId}</span>}
            <div className="profile-meta">
              {cg.govVerified && <span className="badge badge-trust"><BadgeCheck size={12} /> Verified</span>}
              {cg.verified && <span className="badge badge-verified"><ShieldCheck size={12} /> Verified</span>}
              <span className="badge" style={{ background: 'rgba(139,92,246,0.12)', color: '#A78BFA', border: '1px solid rgba(139,92,246,0.3)' }}>
                {cg.category === 'child' ? '👶 Child' : cg.category === 'human' ? '🧑 Human' : '🐾 Pet'}
              </span>
              <span className="badge badge-trust">Trust {cg.trustScore}</span>
              {cg.screeningRating && (
                <span className="meta-item">
                  {Array.from({ length: cg.screeningRating }).map((_, i) => <Star key={i} size={12} fill="#F59E0B" color="#F59E0B" />)}
                  <span style={{ marginLeft: 4, fontSize: 'var(--fs-xs)' }}>Screening</span>
                </span>
              )}
              <span className="meta-item"><MapPin size={14} /> {cg.location.name}</span>
              <span className="meta-item"><IndianRupee size={14} /> {cg.pricing}/{cg.pricingUnit} • ₹{cg.dailyCost}/day</span>
              {blockTime && <span className="badge badge-warning"><Lock size={12} /> Active Job — {blockTime} remaining</span>}
            </div>
            <p className="profile-bio">{cg.bio}</p>
          </div>
          <div className="profile-score">
            <ScoreGauge score={cg.trustScore} label="Trust Score" size={100} />
          </div>
        </div>

        <div className="profile-grid">
          <div className="profile-section glass-card">
            <h3>Verification Status</h3>
            <div className="ver-list">
              {verifications.map((v) => (
                <div key={v.key} className={`ver-item ${v.passed ? 'passed' : 'failed'}`}>
                  {v.passed ? <ShieldCheck size={18} /> : <ShieldX size={18} />}
                  <span>{v.label}</span>
                  <span className={`ver-status badge ${v.passed ? 'badge-trust' : 'badge-risk'}`}>
                    {v.passed ? 'Passed' : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="profile-section glass-card">
            <h3>Scoring Dimensions</h3>
            <div className="radar-wrap">
              <RadarChart scores={scores} size={220} />
            </div>
          </div>

          <div className="profile-section glass-card">
            <h3>Performance Stats</h3>
            <div className="stats-list">
              <div className="profile-stat"><span>Total Sessions</span><strong>{cg.stats.totalSessions}</strong></div>
              <div className="profile-stat"><span>On-Time Rate</span><strong>{Math.round(cg.stats.onTimeRate * 100)}%</strong></div>
              <div className="profile-stat"><span>Cancellation Rate</span><strong>{Math.round(cg.stats.cancellationRate * 100)}%</strong></div>
              <div className="profile-stat"><span>Completion Rate</span><strong>{Math.round(cg.stats.completionRate * 100)}%</strong></div>
              <div className="profile-stat"><span>Avg Rating</span><strong>{cg.stats.avgRating} ⭐</strong></div>
            </div>
          </div>

          <div className="profile-section glass-card">
            <h3>Specializations</h3>
            <div className="spec-tags">
              {cg.specializations.map((s) => (
                <span key={s} className="spec-tag">{s}</span>
              ))}
            </div>
          </div>

          <div className="profile-section glass-card full-width">
            <h3>Family Reviews</h3>
            <div className="reviews-list">
              {cg.reviews.map((r, i) => (
                <div key={i} className="review-item">
                  <div className="review-head">
                    <strong>{r.family}</strong>
                    <div className="review-stars">
                      {Array.from({ length: r.rating }).map((_, j) => <Star key={j} size={12} fill="#F59E0B" color="#F59E0B" />)}
                    </div>
                  </div>
                  <p>{r.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Work Location History */}
          {cg.workHistory && cg.workHistory.length > 0 && (
            <div className="profile-section glass-card full-width">
              <h3><MapPinned size={18} style={{ verticalAlign: 'text-bottom' }} /> Work Location History</h3>
              <div className="work-history-list">
                {cg.workHistory.map((w, i) => (
                  <div key={i} className={`work-item ${w.status === 'in-progress' ? 'active' : ''}`}>
                    <div className="work-item-info">
                      <strong><MapPin size={14} /> {w.location}</strong>
                      <span>{w.date} • {w.duration}</span>
                    </div>
                    <span className={`badge ${w.status === 'completed' ? 'badge-trust' : 'badge-warning'}`}>
                      {w.status === 'completed' ? '✅ Completed' : '🟡 In Progress'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="profile-actions">
          <button className="btn-primary" onClick={() => navigate('/search')}>Book This Caregiver</button>
        </div>
      </div>

      <style>{`
        .profile-page { padding-top: 80px; padding-bottom: var(--space-16); }
        .back-btn { margin-bottom: var(--space-4); }
        .profile-header {
          display: flex; gap: var(--space-6); padding: var(--space-8);
          align-items: flex-start; margin-bottom: var(--space-6);
        }
        .profile-avatar { width: 80px; height: 80px; border-radius: var(--radius-full); overflow: hidden; flex-shrink: 0; }
        .profile-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .profile-info { flex: 1; }
        .profile-info h1 { margin-bottom: var(--space-2); font-size: var(--fs-3xl); }
        .profile-meta { display: flex; flex-wrap: wrap; gap: var(--space-2); align-items: center; margin-bottom: var(--space-3); }
        .meta-item { display: inline-flex; align-items: center; gap: 4px; font-size: var(--fs-sm); color: var(--text-tertiary); }
        .profile-bio { font-size: var(--fs-sm); color: var(--text-secondary); line-height: 1.6; }
        .profile-score { flex-shrink: 0; }
        .profile-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-6); margin-bottom: var(--space-8); }
        .profile-section { padding: var(--space-6); }
        .profile-section h3 { font-size: var(--fs-lg); margin-bottom: var(--space-4); }
        .full-width { grid-column: 1 / -1; }
        .ver-list { display: flex; flex-direction: column; gap: var(--space-3); }
        .ver-item {
          display: flex; align-items: center; gap: var(--space-3); font-size: var(--fs-sm);
        }
        .ver-item.passed { color: var(--trust-green); }
        .ver-item.failed { color: var(--text-muted); }
        .ver-item span:first-of-type { flex: 1; color: var(--text-secondary); }
        .ver-status { font-size: var(--fs-xs); }
        .radar-wrap { display: flex; justify-content: center; }
        .stats-list { display: flex; flex-direction: column; gap: var(--space-3); }
        .profile-stat {
          display: flex; justify-content: space-between; font-size: var(--fs-sm);
          padding: var(--space-2) 0; border-bottom: 1px solid var(--border-glass);
        }
        .profile-stat span { color: var(--text-secondary); }
        .profile-stat strong { color: var(--text-primary); }
        .spec-tags { display: flex; flex-wrap: wrap; gap: var(--space-2); }
        .spec-tag {
          padding: var(--space-1) var(--space-3); background: rgba(79,70,229,0.1);
          border: 1px solid rgba(79,70,229,0.2); border-radius: var(--radius-full);
          font-size: var(--fs-xs); color: var(--primary-400); font-weight: 500;
        }
        .reviews-list { display: flex; flex-direction: column; gap: var(--space-4); }
        .review-item { padding: var(--space-4); background: var(--bg-card); border-radius: var(--radius-lg); }
        .review-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-2); }
        .review-head strong { font-size: var(--fs-sm); }
        .review-stars { display: flex; gap: 2px; }
        .review-item p { font-size: var(--fs-sm); color: var(--text-secondary); }
        .profile-actions { text-align: center; }
        .profile-actions .btn-primary { padding: var(--space-4) var(--space-10); font-size: var(--fs-lg); }
        .work-history-list { display: flex; flex-direction: column; gap: var(--space-3); }
        .work-item { display: flex; justify-content: space-between; align-items: center; padding: var(--space-3); background: var(--bg-card); border-radius: var(--radius-lg); }
        .work-item.active { border: 1px solid rgba(245,158,11,0.3); background: rgba(245,158,11,0.05); }
        .work-item-info { display: flex; flex-direction: column; gap: 2px; }
        .work-item-info strong { display: flex; align-items: center; gap: var(--space-1); font-size: var(--fs-sm); }
        .work-item-info span { font-size: var(--fs-xs); color: var(--text-tertiary); }
        @media (max-width: 768px) {
          .profile-header { flex-direction: column; align-items: center; text-align: center; }
          .profile-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
