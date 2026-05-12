import { useState } from 'react';
import { Star, X } from 'lucide-react';

function StarRow({ label, ratingKey, ratings, onRate }) {
  return (
    <div className="star-row">
      <span className="star-label">{label}</span>
      <div className="stars">
        {[1, 2, 3, 4, 5].map((value) => (
          <button key={value} className="star-btn" onClick={() => onRate(ratingKey, value)}>
            <Star size={20} fill={value <= ratings[ratingKey] ? '#F59E0B' : 'none'} color={value <= ratings[ratingKey] ? '#F59E0B' : 'var(--text-muted)'} />
          </button>
        ))}
      </div>
    </div>
  );
}

export default function FeedbackModal({ caregiver, onClose, onSubmit }) {
  const [ratings, setRatings] = useState({ reliability: 0, quality: 0, communication: 0 });
  const [comment, setComment] = useState('');

  const setRating = (key, value) => setRatings((r) => ({ ...r, [key]: value }));

  const handleSubmit = () => {
    onSubmit?.({ caregiverId: caregiver.id, ratings, comment });
    onClose?.();
  };

  return (
    <div className="feedback-overlay" onClick={onClose}>
      <div className="feedback-modal glass-card" onClick={(e) => e.stopPropagation()}>
        <div className="feedback-header">
          <h3>Rate Your Session</h3>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>
        <p className="feedback-sub">How did {caregiver.name} do?</p>

        <div className="star-rows">
          <StarRow label="Reliability" ratingKey="reliability" ratings={ratings} onRate={setRating} />
          <StarRow label="Care Quality" ratingKey="quality" ratings={ratings} onRate={setRating} />
          <StarRow label="Communication" ratingKey="communication" ratings={ratings} onRate={setRating} />
        </div>

        <textarea
          className="input-field feedback-comment"
          placeholder="Any additional comments? (optional)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
        />

        <button className="btn-primary feedback-submit" onClick={handleSubmit}>
          Submit Feedback
        </button>
      </div>

      <style>{`
        .feedback-overlay {
          position: fixed; inset: 0; z-index: var(--z-modal);
          background: rgba(0,0,0,0.6); backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center;
          animation: fadeIn 0.2s ease;
        }
        .feedback-modal {
          max-width: 400px; width: 90%; padding: var(--space-6);
          display: flex; flex-direction: column; gap: var(--space-4);
        }
        .feedback-header { display: flex; justify-content: space-between; align-items: center; }
        .feedback-header h3 { font-size: var(--fs-lg); }
        .close-btn {
          background: none; border: none; color: var(--text-muted);
          cursor: pointer; padding: var(--space-1);
        }
        .close-btn:hover { color: var(--text-primary); }
        .feedback-sub { font-size: var(--fs-sm); color: var(--text-tertiary); }
        .star-rows { display: flex; flex-direction: column; gap: var(--space-3); }
        .star-row { display: flex; justify-content: space-between; align-items: center; }
        .star-label { font-size: var(--fs-sm); font-weight: 500; color: var(--text-secondary); }
        .stars { display: flex; gap: 2px; }
        .star-btn { background: none; border: none; cursor: pointer; padding: 2px; }
        .feedback-comment { resize: none; }
        .feedback-submit { width: 100%; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}
