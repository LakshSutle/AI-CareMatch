import { useState } from 'react';
import { Mic, MicOff, Globe } from 'lucide-react';
import { isVoiceSupported, createVoiceRecognition, LANGUAGES } from '../services/voiceService';

export default function VoiceInput({ onTranscript }) {
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState('');
  const [lang, setLang] = useState('en-IN');
  const [recognition, setRecognition] = useState(null);
  const supported = isVoiceSupported();

  const startListening = () => {
    const rec = createVoiceRecognition({
      lang,
      onResult: (text) => { onTranscript?.(text); setInterim(''); setListening(false); },
      onInterim: setInterim,
      onEnd: () => setListening(false),
      onError: () => setListening(false),
    });
    if (rec) { rec.start(); setRecognition(rec); setListening(true); }
  };

  const stopListening = () => {
    recognition?.stop();
    setListening(false);
  };

  if (!supported) return null;

  return (
    <div className="voice-input">
      <div className="voice-lang">
        <Globe size={14} />
        <select value={lang} onChange={(e) => setLang(e.target.value)} className="lang-select">
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>{l.flag} {l.name}</option>
          ))}
        </select>
      </div>

      <button
        className={`voice-btn ${listening ? 'active' : ''}`}
        onClick={listening ? stopListening : startListening}
        title={listening ? 'Stop recording' : 'Start voice input'}
      >
        {listening ? <MicOff size={20} /> : <Mic size={20} />}
        {listening && (
          <div className="voice-rings">
            <span className="ring ring-1" />
            <span className="ring ring-2" />
            <span className="ring ring-3" />
          </div>
        )}
      </button>

      {interim && <div className="voice-interim">{interim}</div>}

      <style>{`
        .voice-input {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          flex-wrap: wrap;
        }
        .voice-lang {
          display: flex;
          align-items: center;
          gap: var(--space-1);
          color: var(--text-tertiary);
        }
        .lang-select {
          background: var(--bg-card);
          border: 1px solid var(--border-glass);
          border-radius: var(--radius-sm);
          color: var(--text-secondary);
          font-size: var(--fs-xs);
          padding: 2px 4px;
          cursor: pointer;
        }
        .voice-btn {
          position: relative;
          width: 48px;
          height: 48px;
          border-radius: var(--radius-full);
          background: var(--bg-card);
          border: 2px solid var(--border-glass);
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all var(--transition-base);
        }
        .voice-btn:hover { border-color: var(--primary-500); color: var(--primary-400); }
        .voice-btn.active {
          background: rgba(239, 68, 68, 0.15);
          border-color: var(--risk-red);
          color: var(--risk-red);
        }
        .voice-rings {
          position: absolute;
          inset: -8px;
          pointer-events: none;
        }
        .ring {
          position: absolute;
          inset: 0;
          border-radius: var(--radius-full);
          border: 2px solid var(--risk-red);
          animation: voicePulse 1.5s ease-in-out infinite;
        }
        .ring-2 { animation-delay: 0.3s; }
        .ring-3 { animation-delay: 0.6s; }
        @keyframes voicePulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.4); opacity: 0; }
        }
        .voice-interim {
          width: 100%;
          font-size: var(--fs-sm);
          color: var(--text-tertiary);
          font-style: italic;
          padding: var(--space-2) var(--space-3);
          background: var(--bg-card);
          border-radius: var(--radius-md);
        }
      `}</style>
    </div>
  );
}
