import { AlertTriangle } from 'lucide-react';

export default function RiskBanner({ flags }) {
  if (!flags || flags.length === 0 || flags[0]?.level === 'none') return null;

  const highRisk = flags.some((f) => f.level === 'high');

  return (
    <div className={`risk-banner ${highRisk ? 'high' : 'medium'}`}>
      <AlertTriangle size={20} />
      <div className="risk-content">
        <strong>{highRisk ? '⚠️ Points to Look After' : '⚠️ Advisory'}</strong>
        {flags.filter((f) => f.level !== 'none').map((f, i) => (
          <p key={i}>{f.message}</p>
        ))}
      </div>

      <style>{`
        .risk-banner {
          display: flex;
          gap: var(--space-3);
          padding: var(--space-4);
          border-radius: var(--radius-lg);
          align-items: flex-start;
        }
        .risk-banner.high {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: var(--risk-red);
        }
        .risk-banner.medium {
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.3);
          color: var(--warning-amber);
        }
        .risk-content strong { display: block; margin-bottom: var(--space-1); font-size: var(--fs-sm); }
        .risk-content p { font-size: var(--fs-sm); opacity: 0.9; margin-top: var(--space-1); }
      `}</style>
    </div>
  );
}
