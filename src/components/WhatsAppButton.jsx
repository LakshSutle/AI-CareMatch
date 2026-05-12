import { useState } from 'react';

const PHONE = '917396397130';
const MESSAGE = 'Hi, I found you on AI CareMatch and I\'d like to book a caregiver!';
const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
const WA_URL = isMobile
  ? `https://wa.me/${PHONE}?text=${encodeURIComponent(MESSAGE)}`
  : `https://web.whatsapp.com/send?phone=${PHONE}&text=${encodeURIComponent(MESSAGE)}`;

export default function WhatsAppButton() {
  const [hovered, setHovered] = useState(false);
  const [tooltip, setTooltip] = useState(true);

  // Auto-hide tooltip after 5 seconds
  useState(() => {
    const timer = setTimeout(() => setTooltip(false), 5000);
    return () => clearTimeout(timer);
  });

  return (
    <>
      {/* Tooltip */}
      {tooltip && (
        <div className="wa-tooltip" onClick={() => setTooltip(false)}>
          <span>💬 Chat with us on WhatsApp!</span>
          <button className="wa-tooltip-close" onClick={(e) => { e.stopPropagation(); setTooltip(false); }}>✕</button>
        </div>
      )}

      {/* Floating Button */}
      <a
        href={WA_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={`wa-fab ${hovered ? 'wa-fab-hover' : ''}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-label="Chat on WhatsApp"
        title="Chat on WhatsApp"
      >
        {/* WhatsApp SVG Icon */}
        <svg viewBox="0 0 32 32" width="28" height="28" fill="white">
          <path d="M16.004 0h-.008C7.174 0 0 7.176 0 16.004c0 3.5 1.128 6.744 3.046 9.378L1.054 31.29l6.118-1.958A15.926 15.926 0 0016.004 32C24.826 32 32 24.826 32 16.004 32 7.176 24.826 0 16.004 0zm9.31 22.606c-.39 1.1-1.932 2.014-3.164 2.28-.844.18-1.944.324-5.654-1.214-4.748-1.966-7.8-6.79-8.034-7.104-.226-.314-1.886-2.512-1.886-4.792s1.194-3.4 1.618-3.866c.39-.428.924-.642 1.438-.642.174 0 .33.016.472.03.424.018.636.042.916.708.348.832 1.198 2.916 1.302 3.128.106.212.212.49.076.774-.128.292-.212.472-.424.726-.212.256-.446.57-.636.766-.212.218-.432.454-.186.89.248.434 1.1 1.812 2.362 2.936 1.622 1.446 2.99 1.894 3.414 2.104.424.212.672.178.918-.106.256-.292 1.086-1.264 1.376-1.698.288-.434.576-.362.972-.218.398.148 2.524 1.192 2.956 1.408.434.218.72.324.826.504.108.178.108 1.04-.282 2.14z"/>
        </svg>
        {hovered && <span className="wa-label">WhatsApp</span>}
      </a>

      <style>{`
        .wa-fab {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 9999;
          display: flex;
          align-items: center;
          gap: 8px;
          width: 56px;
          height: 56px;
          border-radius: 28px;
          background: #25D366;
          box-shadow: 0 4px 16px rgba(37, 211, 102, 0.4), 0 2px 8px rgba(0,0,0,0.2);
          justify-content: center;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
        }
        .wa-fab:hover, .wa-fab-hover {
          width: auto;
          padding: 0 20px;
          border-radius: 28px;
          box-shadow: 0 6px 24px rgba(37, 211, 102, 0.5), 0 4px 12px rgba(0,0,0,0.3);
          transform: scale(1.05);
        }
        .wa-fab:active {
          transform: scale(0.95);
        }
        .wa-label {
          color: white;
          font-weight: 600;
          font-size: 14px;
          white-space: nowrap;
          letter-spacing: 0.3px;
        }

        /* Pulse animation */
        .wa-fab::before {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          background: rgba(37, 211, 102, 0.3);
          animation: wa-pulse 2s ease-in-out infinite;
          z-index: -1;
        }
        .wa-fab:hover::before { animation: none; opacity: 0; }

        @keyframes wa-pulse {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.2); opacity: 0; }
        }

        /* Tooltip */
        .wa-tooltip {
          position: fixed;
          bottom: 90px;
          right: 24px;
          z-index: 9999;
          background: var(--bg-card, #1e1e2e);
          color: var(--text-primary, #fff);
          padding: 10px 16px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 500;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
          border: 1px solid rgba(37, 211, 102, 0.3);
          display: flex;
          align-items: center;
          gap: 10px;
          animation: wa-slide-in 0.4s ease-out;
          cursor: pointer;
        }
        .wa-tooltip::after {
          content: '';
          position: absolute;
          bottom: -6px;
          right: 24px;
          width: 12px;
          height: 12px;
          background: var(--bg-card, #1e1e2e);
          border-right: 1px solid rgba(37, 211, 102, 0.3);
          border-bottom: 1px solid rgba(37, 211, 102, 0.3);
          transform: rotate(45deg);
        }
        .wa-tooltip-close {
          background: none;
          border: none;
          color: var(--text-muted, #888);
          cursor: pointer;
          font-size: 12px;
          padding: 0;
          line-height: 1;
        }
        .wa-tooltip-close:hover { color: var(--text-primary, #fff); }

        @keyframes wa-slide-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Mobile responsiveness */
        @media (max-width: 768px) {
          .wa-fab { bottom: 16px; right: 16px; width: 50px; height: 50px; }
          .wa-fab svg { width: 24px; height: 24px; }
          .wa-tooltip { bottom: 76px; right: 16px; font-size: 12px; }
        }
      `}</style>
    </>
  );
}
