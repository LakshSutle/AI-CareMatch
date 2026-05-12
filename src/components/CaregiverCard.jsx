import ScoreGauge from './ScoreGauge';
import { MapPin, Clock, AlertTriangle, ChevronDown, ChevronUp, Star, Lock, BadgeCheck, IndianRupee, Heart, Zap } from 'lucide-react';
import { useState } from 'react';
import { getRemainingBlockTime } from '../data/caregivers';

// WhatsApp numbers — alternate between caregivers
export default function CaregiverCard({ result, isPrimary = false, onViewProfile, onBook, onToggleFav, isFav = false }) {
  const [expanded, setExpanded] = useState(isPrimary);
  const { caregiver, matchScore, trustScore, reasons, riskFlags, distance, travelMin, confidence, availabilityPrediction } = result;

  const hasRisk = riskFlags && riskFlags[0]?.level !== 'none';
  const blockTime = getRemainingBlockTime(caregiver);
  const isBlocked = !!blockTime;

  // Verification Tier — computed from 8 checks
  const verChecks = caregiver.verification ? Object.values(caregiver.verification).filter(Boolean).length : 0;
  const verTier = verChecks >= 7 ? { label: 'Medical', color: '#A78BFA', bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.3)', icon: '🟣' }
    : verChecks >= 4 ? { label: 'Advanced', color: '#60A5FA', bg: 'rgba(96,165,250,0.12)', border: 'rgba(96,165,250,0.3)', icon: '🔵' }
    : { label: 'Basic', color: '#34D399', bg: 'rgba(52,211,153,0.12)', border: 'rgba(52,211,153,0.3)', icon: '🟢' };

  return (
    <div className={`caregiver-card glass-card ${isPrimary ? 'primary' : 'compact'}`}>
      <div className="card-header">
        <div className="card-avatar"><img src={caregiver.photo} alt={caregiver.name} /></div>
        <div className="card-info">
          <h3 className="card-name">{caregiver.name} {caregiver.uniqueId && <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', fontFamily: 'monospace', fontWeight: 400 }}>{caregiver.uniqueId}</span>}</h3>
          <div className="card-meta">
            {caregiver.govVerified && (
              <span className="badge badge-trust"><BadgeCheck size={12} /> Verified</span>
            )}
            <span className="badge" style={{ background: verTier.bg, color: verTier.color, border: `1px solid ${verTier.border}` }}>
              {verTier.icon} {verTier.label}
            </span>
            <span className="badge" style={{ background: 'rgba(139,92,246,0.12)', color: '#A78BFA', border: '1px solid rgba(139,92,246,0.3)' }}>
              {caregiver.category === 'child' ? '👶 Child' : caregiver.category === 'human' ? '🧑 Human' : '🐾 Pet'}
            </span>
            {confidence && (
              <span className="badge" style={{ background: confidence >= 80 ? 'rgba(52,211,153,0.12)' : confidence >= 60 ? 'rgba(251,191,36,0.12)' : 'rgba(239,68,68,0.12)', color: confidence >= 80 ? '#34D399' : confidence >= 60 ? '#FBBF24' : '#F87171', border: `1px solid ${confidence >= 80 ? 'rgba(52,211,153,0.3)' : confidence >= 60 ? 'rgba(251,191,36,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
                <Zap size={10} /> {confidence}% confident
              </span>
            )}
            {caregiver.screeningRating && (
              <span className="card-meta-item">
                {Array.from({ length: caregiver.screeningRating }).map((_, i) => <Star key={i} size={10} fill="#F59E0B" color="#F59E0B" />)}
              </span>
            )}
            <span className="card-meta-item"><MapPin size={12} /> {distance ? `${distance} km` : caregiver.location.name}</span>
            {travelMin && <span className="card-meta-item"><Clock size={12} /> ~{travelMin} min</span>}
            <span className="card-meta-item"><IndianRupee size={12} /> {caregiver.dailyCost}/day</span>
            {isBlocked && <span className="badge badge-warning"><Lock size={12} /> Active Job — {blockTime}</span>}
            {availabilityPrediction && <span className="card-meta-item" style={{ color: '#60A5FA' }}><Clock size={12} /> {availabilityPrediction}</span>}
          </div>
        </div>
        <div className="card-scores">
          <ScoreGauge score={matchScore} label="Match" size={isPrimary ? 80 : 64} />
          <ScoreGauge score={trustScore} label="Trust" size={isPrimary ? 80 : 64} />
        </div>
      </div>

      {isPrimary && (
        <div className="card-body">
          <div className="why-section">
            <h4>✅ Why Recommended</h4>
            <ul>
              {reasons.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </div>

          <div className={`risk-section ${hasRisk ? 'has-risk' : ''}`}>
            <h4>{hasRisk ? '⚠️ Points to Look After' : '✅ Risk Assessment'}</h4>
            <ul>
              {riskFlags.map((f, i) => <li key={i} className={`risk-${f.level}`}>{f.message}</li>)}
            </ul>
          </div>
        </div>
      )}

      {!isPrimary && (
        <button className="expand-btn" onClick={() => setExpanded(!expanded)}>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          {expanded ? 'Less' : 'Details'}
        </button>
      )}

      {!isPrimary && expanded && (
        <div className="card-body compact-body">
          <ul className="compact-reasons">
            {reasons.slice(0, 3).map((r, i) => <li key={i}>{r}</li>)}
          </ul>
          {hasRisk && (
            <p className="compact-risk"><AlertTriangle size={14} /> {riskFlags[0].message}</p>
          )}
        </div>
      )}

      <div className="card-actions">
        <button className="btn-secondary" onClick={() => onViewProfile?.(caregiver.id)}>View Profile</button>
        <button className="btn-primary" onClick={() => onBook?.(caregiver)} disabled={isBlocked}>
          {isBlocked ? `Busy — ${blockTime}` : 'Book Now'}
        </button>
        <button className={`btn-fav ${isFav ? 'fav-active' : ''}`} onClick={() => onToggleFav?.(caregiver.id)} title={isFav ? 'Remove from favourites' : 'Save to favourites'}>
          <Heart size={16} fill={isFav ? '#F87171' : 'none'} color={isFav ? '#F87171' : 'var(--text-muted)'} />
        </button>
      </div>

      <style>{`
        .caregiver-card {
          padding: var(--space-6);
          display: flex;
          flex-direction: column;
          gap: var(--space-5);
        }
        .caregiver-card.primary {
          border: 1px solid rgba(79,70,229,0.3);
          box-shadow: 0 0 30px rgba(79,70,229,0.1);
        }
        .card-header {
          display: flex;
          align-items: flex-start;
          gap: var(--space-4);
        }
        .card-avatar {
          width: 56px;
          height: 56px;
          border-radius: var(--radius-full);
          overflow: hidden;
          flex-shrink: 0;
          background: var(--bg-card);
        }
        .card-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .card-info { flex: 1; min-width: 0; }
        .card-name {
          font-size: var(--fs-lg);
          margin-bottom: var(--space-1);
        }
        .card-meta {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-2);
          align-items: center;
        }
        .card-meta-item {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: var(--fs-xs);
          color: var(--text-tertiary);
        }
        .card-scores {
          display: flex;
          gap: var(--space-3);
          flex-shrink: 0;
        }
        .card-body { display: flex; flex-direction: column; gap: var(--space-4); }
        .why-section h4, .risk-section h4 {
          font-size: var(--fs-sm);
          margin-bottom: var(--space-2);
          font-weight: 600;
        }
        .why-section ul, .risk-section ul, .compact-reasons {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }
        .why-section li, .compact-reasons li {
          font-size: var(--fs-sm);
          color: var(--text-secondary);
          padding-left: var(--space-4);
          position: relative;
        }
        .why-section li::before, .compact-reasons li::before {
          content: '•';
          position: absolute;
          left: 0;
          color: var(--trust-green);
        }
        .risk-section li {
          font-size: var(--fs-sm);
          padding-left: var(--space-4);
          position: relative;
        }
        .risk-none { color: var(--trust-green); }
        .risk-low { color: var(--warning-amber); }
        .risk-medium { color: var(--warning-amber); }
        .risk-high { color: var(--risk-red); }
        .compact-risk {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: var(--fs-sm);
          color: var(--warning-amber);
        }
        .expand-btn {
          display: flex;
          align-items: center;
          gap: var(--space-1);
          font-size: var(--fs-xs);
          color: var(--text-tertiary);
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
        }
        .expand-btn:hover { color: var(--text-secondary); }
        .card-actions {
          display: flex;
          gap: var(--space-3);
        }
        .card-actions .btn-primary,
        .card-actions .btn-secondary {
          flex: 1;
          padding: var(--space-3);
          font-size: var(--fs-sm);
        }
        .btn-fav {
          width: 40px; height: 40px; border-radius: var(--radius-lg); background: var(--bg-card);
          border: 1px solid var(--border-glass); display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all var(--transition-fast); flex-shrink: 0;
        }
        .btn-fav:hover { border-color: #F87171; background: rgba(248,113,113,0.08); }
        .btn-fav.fav-active { border-color: #F87171; background: rgba(248,113,113,0.12); }
        .btn-wa {
          display: flex; align-items: center; gap: 6px;
          padding: 8px 14px; border-radius: var(--radius-lg);
          background: #25D366; color: white; font-size: var(--fs-sm); font-weight: 600;
          text-decoration: none; border: none; cursor: pointer;
          transition: all var(--transition-fast); flex-shrink: 0;
        }
        .btn-wa:hover { background: #1ebe5d; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(37,211,102,0.3); }
        .btn-wa:active { transform: translateY(0); }
        @media (max-width: 640px) {
          .card-header { flex-wrap: wrap; }
          .card-scores { width: 100%; justify-content: center; }
          .btn-wa span { display: none; }
        }
      `}</style>
    </div>
  );
}
