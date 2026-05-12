import { useState } from 'react';
import { AlertTriangle, CheckCircle, Loader } from 'lucide-react';
import { triggerSOS } from '../services/sosService';
import { useAuth } from '../contexts/auth-context';

export default function SOSButton() {
  const { userProfile, role } = useAuth();
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error

  const handleSOS = async () => {
    if (status === 'sending') return;
    setStatus('sending');
    const name = userProfile?.displayName || 'Unknown';
    const res = await triggerSOS(role, name);
    setStatus(res.success ? 'sent' : 'error');
    // Reset after 3 seconds
    setTimeout(() => setStatus('idle'), 3000);
  };

  return (
    <>
      <button
        className={`sos-btn ${status}`}
        onClick={handleSOS}
        disabled={status === 'sending'}
        title={role === 'caregiver' ? 'SOS — Alert Admin' : 'SOS — Alert Family'}
      >
        {status === 'sending' ? (
          <Loader size={14} className="sos-spin" />
        ) : status === 'sent' ? (
          <CheckCircle size={14} />
        ) : (
          <AlertTriangle size={14} />
        )}
        <span>{status === 'sent' ? 'Sent!' : status === 'error' ? 'Retry' : 'SOS'}</span>
      </button>

      <style>{`
        .sos-btn {
          display: flex; align-items: center; gap: 4px;
          padding: 6px 12px; border-radius: 8px;
          background: #EF4444; color: white;
          font-weight: 700; font-size: 12px;
          border: none; cursor: pointer;
          transition: all 0.2s; flex-shrink: 0;
          letter-spacing: 0.5px;
        }
        .sos-btn:hover:not(:disabled) { background: #DC2626; transform: scale(1.05); }
        .sos-btn:disabled { opacity: 0.7; cursor: wait; }
        .sos-btn.sent { background: #10B981; }
        .sos-btn.error { background: #F59E0B; }
        .sos-spin { animation: sos-sp 0.8s linear infinite; }
        @keyframes sos-sp { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}
