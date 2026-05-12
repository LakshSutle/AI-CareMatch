import { Baby, User, PawPrint } from 'lucide-react';

const domains = [
  { key: 'child', label: 'Child', icon: Baby, color: '#818CF8', bg: 'rgba(129,140,248,0.12)' },
  { key: 'human', label: 'Human', icon: User, color: '#F472B6', bg: 'rgba(244,114,182,0.12)' },
  { key: 'pet', label: 'Pet', icon: PawPrint, color: '#34D399', bg: 'rgba(52,211,153,0.12)' },
];

export default function DomainSelector({ selected, onSelect }) {
  return (
    <div className="domain-selector">
      {domains.map((d) => {
        const Icon = d.icon;
        const active = selected === d.key;
        return (
          <button
            key={d.key}
            className={`domain-tab ${active ? 'active' : ''}`}
            onClick={() => onSelect(d.key)}
            style={{
              '--tab-color': d.color,
              '--tab-bg': d.bg,
            }}
          >
            <Icon size={20} />
            <span>{d.label}</span>
          </button>
        );
      })}

      <style>{`
        .domain-selector {
          display: flex;
          gap: var(--space-3);
          flex-wrap: wrap;
        }
        .domain-tab {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-3) var(--space-5);
          border-radius: var(--radius-full);
          background: var(--bg-card);
          border: 1px solid var(--border-glass);
          color: var(--text-secondary);
          font-weight: 500;
          font-size: var(--fs-sm);
          cursor: pointer;
          transition: all var(--transition-base);
        }
        .domain-tab:hover {
          background: var(--tab-bg);
          color: var(--tab-color);
          border-color: var(--tab-color);
        }
        .domain-tab.active {
          background: var(--tab-bg);
          color: var(--tab-color);
          border-color: var(--tab-color);
          box-shadow: 0 0 16px color-mix(in srgb, var(--tab-color) 30%, transparent);
        }
      `}</style>
    </div>
  );
}
