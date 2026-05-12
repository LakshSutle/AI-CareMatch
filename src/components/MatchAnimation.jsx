import { useEffect, useState } from 'react';
import { Shield, MapPin, Clock, Star, CheckCircle, Brain } from 'lucide-react';

const DIMENSIONS = [
  { key: 'proximity', label: 'Proximity', icon: MapPin, color: '#818CF8' },
  { key: 'availability', label: 'Availability', icon: Clock, color: '#34D399' },
  { key: 'experience', label: 'Experience', icon: Brain, color: '#F59E0B' },
  { key: 'verification', label: 'Verification', icon: Shield, color: '#F472B6' },
  { key: 'reliability', label: 'Reliability', icon: Star, color: '#A78BFA' },
  { key: 'budgetFit', label: 'Budget Fit', icon: CheckCircle, color: '#38BDF8' },
];

export default function MatchAnimation({ scores, onComplete }) {
  const [step, setStep] = useState(-1);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < DIMENSIONS.length) { setStep(i); i++; }
      else { setDone(true); clearInterval(interval); setTimeout(() => onComplete?.(), 600); }
    }, 400);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="match-overlay">
      <div className="match-modal">
        <div className="match-header">
          <div className={`match-brain ${done ? 'done' : ''}`}>
            <Brain size={32} />
          </div>
          <h3>{done ? 'Match Found!' : 'CareMatch'}</h3>
          <p>{done ? 'Your best caregiver match is ready' : 'Evaluating caregivers across 6 dimensions...'}</p>
        </div>

        <div className="match-dimensions">
          {DIMENSIONS.map((dim, i) => {
            const Icon = dim.icon;
            const isActive = step >= i;
            const score = scores?.[dim.key] || 0;
            return (
              <div key={dim.key} className={`match-dim ${isActive ? 'active' : ''}`}>
                <div className="dim-icon" style={{ color: isActive ? dim.color : 'var(--text-muted)' }}>
                  <Icon size={18} />
                </div>
                <div className="dim-info">
                  <span className="dim-label">{dim.label}</span>
                  <div className="dim-bar">
                    <div
                      className="dim-fill"
                      style={{
                        width: isActive ? `${score}%` : '0%',
                        background: dim.color,
                        boxShadow: isActive ? `0 0 10px ${dim.color}60` : 'none',
                      }}
                    />
                  </div>
                </div>
                <span className="dim-score" style={{ color: isActive ? dim.color : 'var(--text-muted)' }}>
                  {isActive ? score : '—'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .match-overlay {
          position: fixed;
          inset: 0;
          z-index: var(--z-modal);
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: fadeIn 0.3s ease;
        }
        .match-modal {
          background: var(--bg-secondary);
          border: 1px solid var(--border-glass);
          border-radius: var(--radius-2xl);
          padding: var(--space-8);
          max-width: 420px;
          width: 90%;
          animation: scaleIn 0.4s ease;
        }
        .match-header {
          text-align: center;
          margin-bottom: var(--space-6);
        }
        .match-brain {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 64px;
          height: 64px;
          border-radius: var(--radius-full);
          background: rgba(79, 70, 229, 0.15);
          color: var(--primary-400);
          margin-bottom: var(--space-3);
          animation: pulseScale 2s ease-in-out infinite;
        }
        .match-brain.done {
          background: rgba(16, 185, 129, 0.15);
          color: var(--trust-green);
          animation: none;
        }
        .match-header h3 { font-size: var(--fs-xl); margin-bottom: var(--space-1); }
        .match-header p { font-size: var(--fs-sm); color: var(--text-tertiary); }
        .match-dimensions { display: flex; flex-direction: column; gap: var(--space-3); }
        .match-dim {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          opacity: 0.3;
          transition: all 0.4s ease;
        }
        .match-dim.active { opacity: 1; }
        .dim-icon {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .dim-info { flex: 1; min-width: 0; }
        .dim-label {
          font-size: var(--fs-xs);
          font-weight: 600;
          color: var(--text-secondary);
          display: block;
          margin-bottom: 4px;
        }
        .dim-bar {
          height: 6px;
          background: rgba(255,255,255,0.06);
          border-radius: var(--radius-full);
          overflow: hidden;
        }
        .dim-fill {
          height: 100%;
          border-radius: var(--radius-full);
          transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .dim-score {
          font-size: var(--fs-sm);
          font-weight: 700;
          font-family: var(--font-heading);
          min-width: 28px;
          text-align: right;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        @keyframes pulseScale { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.08); } }
      `}</style>
    </div>
  );
}
