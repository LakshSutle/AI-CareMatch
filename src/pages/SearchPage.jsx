import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Zap, MapPin, Map, Calendar, Clock, X, CheckCircle } from 'lucide-react';
import DomainSelector from '../components/DomainSelector';
import VoiceInput from '../components/VoiceInput';
import CaregiverCard from '../components/CaregiverCard';
import CaregiverMap from '../components/CaregiverMap';
import MatchAnimation from '../components/MatchAnimation';
import RiskBanner from '../components/RiskBanner';
import { parseInput } from '../engine/nlpParser';
import { matchCaregivers } from '../engine/matchEngine';
import { saveBooking, sendNotification } from '../services/firebase';
import { parseWithAI, isAIConfigured } from '../services/openaiService';
import { addMemory } from '../services/mem0Service';
import { useAuth } from '../contexts/auth-context';
import { locations, getDistance } from '../data/locations';

export default function SearchPage() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const patientName = userProfile?.displayName || 'A Patient';
  const [input, setInput] = useState('');
  const [domain, setDomain] = useState(null);
  const [urgency, setUrgency] = useState('scheduled');
  const [budget, setBudget] = useState(500);
  const [location, setLocation] = useState('');
  const [results, setResults] = useState(null);
  const [matching, setMatching] = useState(false);
  const [animScores, setAnimScores] = useState(null);
  const [clarify, setClarify] = useState(null);
  const [selectedMapId, setSelectedMapId] = useState(null);
  const [showMap, setShowMap] = useState(true);
  const [aiParsing, setAiParsing] = useState(false);
  const [pendingResults, setPendingResults] = useState(null);

  // Scheduling state
  const [schedDate, setSchedDate] = useState('');
  const [schedTime, setSchedTime] = useState('');

  // Booking modal state
  const [bookingModal, setBookingModal] = useState(null);
  const [careNotes, setCareNotes] = useState('');

  // Favourites state (persisted in localStorage)
  const [favourites, setFavourites] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cm_favourites') || '[]'); } catch { return []; }
  });
  const toggleFav = (id) => {
    const updated = favourites.includes(id) ? favourites.filter(f => f !== id) : [...favourites, id];
    setFavourites(updated);
    localStorage.setItem('cm_favourites', JSON.stringify(updated));
  };

  const handleSearch = async () => {
    if (!input.trim() && !domain) return;

    // Try OpenAI first, fallback to rule-based
    let parsed;
    if (isAIConfigured && input.trim()) {
      setAiParsing(true);
      const aiResult = await parseWithAI(input);
      setAiParsing(false);
      if (aiResult) {
        parsed = { ...aiResult, specializations: aiResult.specializations || [] };
      }
    }
    if (!parsed) {
      parsed = parseInput(input);
    }

    // Override with form selections
    if (domain) parsed.domain = domain;
    if (urgency) parsed.urgency = urgency;
    if (budget) parsed.budget = budget;
    if (location) parsed.location = location;
    if (!parsed.location && location) parsed.location = location;
    if (!parsed.specializations) parsed.specializations = [];

    const matchResult = matchCaregivers(parsed);

    if (!matchResult.primary) {
      setClarify('No caregivers found for your criteria. Try adjusting your requirements.');
      return;
    }

    setPendingResults(matchResult);
    setAnimScores(matchResult.primary.scores);
    setMatching(true);
    setClarify(null);

    // Store search in Mem0 memory
    addMemory([
      { role: 'user', content: `I searched for: ${input}. Category: ${parsed.domain || domain}. Location: ${parsed.location || location}. Budget: ${parsed.budget || budget}.` },
      { role: 'assistant', content: `Found ${matchResult.primary.caregiver.name} as best match with score ${matchResult.primary.matchScore}/100.` },
    ], { source: 'search' }).catch(() => {});
  };

  const handleMatchComplete = () => {
    setMatching(false);
    if (pendingResults) {
      setResults(pendingResults);
      setSelectedMapId(pendingResults.primary?.caregiver.id || null);
      setPendingResults(null);
    }
  };

  // WhatsApp auto-message after booking (only for screened caregivers)
  const WA_NUMBERS = ['918790015743', '919652378004'];
  const isMobileDevice = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const sendWhatsApp = (caregiver) => {
    // Only send if caregiver has been screened
    if (caregiver.screeningStatus !== 'approved') return;
    const phone = WA_NUMBERS[caregiver.id % 2];
    const msg = `Hey, I found you on AI CareMatch, and I would like to book a session. Caregiver ID: ${caregiver.uniqueId}`;
    const url = isMobileDevice
      ? `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
      : `https://web.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const handleBook = (caregiver) => {
    if (urgency === 'scheduled') {
      setBookingModal(caregiver);
    } else {
      saveBooking({
        caregiverId: caregiver.id,
        caregiverName: caregiver.name,
        domain: caregiver.domain,
        urgency,
        scheduledDate: null,
        scheduledTime: null,
        careNotes,
      });
      // Notify the caregiver
      sendNotification({
        type: 'booking',
        targetRole: 'caregiver',
        targetId: caregiver.uniqueId,
        title: `📋 New Booking from ${patientName}`,
        body: `You've been booked for ${urgency === 'emergency' ? 'an emergency' : 'same-day'} session. Check your dashboard.`,
      });
      // Auto-send WhatsApp confirmation (only for screened caregivers)
      sendWhatsApp(caregiver, urgency);
      navigate('/dashboard');
    }
  };

  const confirmScheduledBooking = () => {
    if (!bookingModal || !schedDate || !schedTime) return;
    saveBooking({
      caregiverId: bookingModal.id,
      caregiverName: bookingModal.name,
      domain: bookingModal.domain,
      urgency: 'scheduled',
      scheduledDate: schedDate,
      scheduledTime: schedTime,
      careNotes,
    });
    // Notify the caregiver with schedule details
    const dateStr = new Date(schedDate + 'T' + schedTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    const timeStr = new Date('2000-01-01T' + schedTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    sendNotification({
      type: 'booking',
      targetRole: 'caregiver',
      targetId: bookingModal.uniqueId,
      title: `📅 Scheduled Booking from ${patientName}`,
      body: `You've been booked for ${dateStr} at ${timeStr}. ${bookingModal.domain} care session.`,
    });
    // Auto-send WhatsApp confirmation (only for screened caregivers)
    sendWhatsApp(bookingModal);
    setBookingModal(null);
    setCareNotes('');
    navigate('/dashboard');
  };

  const handleVoiceTranscript = (text) => {
    setInput((prev) => (prev ? prev + ' ' + text : text));
  };

  return (
    <div className="search-page">
      <div className="container">
        <div className="search-header">
          <h1>Find Your <span className="gradient-text">Perfect Match</span></h1>
          <p>Describe what you need — our AI engine will find and score the best caregiver for you.</p>
        </div>

        <div className="search-panel glass-card">
          <DomainSelector selected={domain} onSelect={setDomain} />

          <div className="search-input-wrap">
            <textarea
              className="search-textarea input-field"
              placeholder="e.g. Need a babysitter for my 6-year-old tonight, she has ADHD, budget is Rs.500, Banjara Hills"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSearch(); } }}
              rows={3}
            />
            <VoiceInput onTranscript={handleVoiceTranscript} />
          </div>

          <div className="search-filters">
            <div className="filter-group">
              <label>Urgency</label>
              <div className="urgency-tabs">
                {['scheduled', 'sameday', 'emergency'].map((u) => (
                  <button key={u} className={`urgency-tab ${urgency === u ? 'active' : ''}`} onClick={() => setUrgency(u)}>
                    {u === 'emergency' && <Zap size={14} />}
                    {u === 'scheduled' && <Calendar size={14} />}
                    {u === 'scheduled' ? 'Scheduled' : u === 'sameday' ? 'Same Day' : 'Emergency'}
                  </button>
                ))}
              </div>
              {urgency === 'scheduled' && (
                <div className="schedule-picker">
                  <div className="sched-field">
                    <Calendar size={14} />
                    <input
                      type="date"
                      className="input-field sched-input"
                      value={schedDate}
                      onChange={(e) => setSchedDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="sched-field">
                    <Clock size={14} />
                    <input
                      type="time"
                      className="input-field sched-input"
                      value={schedTime}
                      onChange={(e) => setSchedTime(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="filter-group">
              <label>Budget: ₹{budget}</label>
              <input type="range" min={100} max={2000} step={50} value={budget} onChange={(e) => setBudget(Number(e.target.value))} className="budget-slider" />
            </div>

            <div className="filter-group">
              <label><MapPin size={14} /> Location</label>
              <div className="location-wrap">
                <input
                  type="text" className="input-field location-input"
                  placeholder="e.g. Banjara Hills"
                  value={location} onChange={(e) => setLocation(e.target.value)}
                />
                <button className="btn-ghost locate-btn" title="Use my current location" onClick={() => {
                  if (navigator.geolocation) {
                    setLocation('📍 Locating...');
                    navigator.geolocation.getCurrentPosition(
                      (pos) => {
                        const userLat = pos.coords.latitude;
                        const userLng = pos.coords.longitude;
                        // Find nearest known location from our database
                        let nearest = null;
                        let minDist = Infinity;
                        locations.forEach(loc => {
                          const d = getDistance(userLat, userLng, loc.lat, loc.lng);
                          if (d < minDist) { minDist = d; nearest = loc; }
                        });
                        if (nearest && minDist < 30) {
                          // Within 30km of a known location — use it
                          setLocation(nearest.name);
                        } else {
                          // Fallback: use free reverse geocoding API
                          fetch(`https://nominatim.openstreetmap.org/reverse?lat=${userLat}&lon=${userLng}&format=json`)
                            .then(r => r.json())
                            .then(data => {
                              const area = data.address?.suburb || data.address?.neighbourhood || data.address?.city_district || data.address?.city || 'Hyderabad';
                              setLocation(area);
                            })
                            .catch(() => setLocation('Hyderabad'));
                        }
                      },
                      (err) => {
                        console.warn('Geolocation error:', err.message);
                        setLocation('Hyderabad');
                      },
                      { enableHighAccuracy: true, timeout: 8000 }
                    );
                  } else {
                    setLocation('Hyderabad');
                  }
                }}>
                  <MapPin size={14} /> Use GPS
                </button>
              </div>
            </div>
          </div>

          <button className="btn-primary search-btn" onClick={handleSearch} disabled={aiParsing}>
            <Search size={18} /> {aiParsing ? '🤖 AI Parsing...' : 'Find Best Match'}
          </button>
          {isAIConfigured && <span className="ai-badge">🤖 Powered by GPT-4o</span>}
        </div>

        {clarify && <div className="clarify-msg glass-card"><p>{clarify}</p></div>}

        {matching && <MatchAnimation scores={animScores} onComplete={handleMatchComplete} />}

        {results && results.primary && (
          <div className="results-section">
            <div className="results-header">
              <h2 className="results-title">🎯 Your Best Match</h2>
              <button className="btn-ghost map-toggle" onClick={() => setShowMap(!showMap)}>
                <Map size={16} /> {showMap ? 'Hide Map' : 'Show Map'}
              </button>
            </div>

            {showMap && (
              <CaregiverMap
                caregivers={results.all.map(r => r.caregiver)}
                selectedId={selectedMapId}
                onSelectCaregiver={setSelectedMapId}
              />
            )}

            {/* Surge Warning */}
            {results.surgeWarning && (
              <div className="surge-banner glass-card" style={{ padding: 'var(--space-3) var(--space-4)', borderColor: 'rgba(251,191,36,0.3)', background: 'rgba(251,191,36,0.06)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
                <span style={{ fontSize: '1.2rem' }}>⚡</span>
                <span style={{ fontSize: 'var(--fs-sm)', color: '#FBBF24' }}>{results.surgeWarning}</span>
              </div>
            )}

            {/* Fallback notice */}
            {results.primary.isFallback && (
              <div className="surge-banner glass-card" style={{ padding: 'var(--space-3) var(--space-4)', borderColor: 'rgba(96,165,250,0.3)', background: 'rgba(96,165,250,0.06)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
                <span style={{ fontSize: '1.2rem' }}>🔄</span>
                <span style={{ fontSize: 'var(--fs-sm)', color: '#60A5FA' }}>No exact domain match found. Showing best available caregivers across all categories.</span>
              </div>
            )}

            <CaregiverCard
              result={results.primary}
              isPrimary={true}
              onViewProfile={(id) => { setSelectedMapId(id); navigate(`/caregiver/${id}`); }}
              onBook={handleBook}
              onToggleFav={toggleFav}
              isFav={favourites.includes(results.primary.caregiver.id)}
            />

            {results.primary.riskFlags[0]?.level !== 'none' && (
              <RiskBanner flags={results.primary.riskFlags} />
            )}

            {results.alternative && (
              <>
                <h3 className="alt-title">💡 Smart Alternative</h3>
                <p className="alt-comparison">{results.alternative.comparisonText}</p>
                <CaregiverCard
                  result={results.alternative}
                  isPrimary={false}
                  onViewProfile={(id) => { setSelectedMapId(id); navigate(`/caregiver/${id}`); }}
                  onBook={handleBook}
                  onToggleFav={toggleFav}
                  isFav={favourites.includes(results.alternative.caregiver.id)}
                />
              </>
            )}

            {/* Budget Optimisation Tip */}
            {results.budgetTip && (
              <div className="budget-tip glass-card" style={{ padding: 'var(--space-3) var(--space-4)', borderColor: 'rgba(139,92,246,0.3)', background: 'rgba(139,92,246,0.06)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginTop: 'var(--space-4)' }}>
                <span style={{ fontSize: '1.2rem' }}>💡</span>
                <span style={{ fontSize: 'var(--fs-sm)', color: '#A78BFA' }}>{results.budgetTip}</span>
              </div>
            )}
          </div>
        )}

        {/* Booking confirmation modal for scheduled bookings */}
        {bookingModal && (
          <div className="booking-modal-overlay" onClick={() => setBookingModal(null)}>
            <div className="booking-modal glass-card" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setBookingModal(null)}><X size={20} /></button>
              <h3>📅 Schedule Your Booking</h3>
              <p className="modal-subtitle">Confirm the date and time for your session with <strong>{bookingModal.name}</strong></p>

              <div className="modal-caregiver">
                <img src={bookingModal.photo} alt={bookingModal.name} className="modal-avatar" />
                <div>
                  <strong>{bookingModal.name}</strong>
                  <span>{bookingModal.category === 'child' ? '👶 Child Care' : bookingModal.category === 'human' ? '🧑 Human Care' : '🐾 Pet Care'}</span>
                </div>
              </div>

              <div className="modal-fields">
                <div className="modal-field">
                  <label><Calendar size={14} /> Date</label>
                  <input
                    type="date"
                    className="input-field"
                    value={schedDate}
                    onChange={(e) => setSchedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="modal-field">
                  <label><Clock size={14} /> Time</label>
                  <input
                    type="time"
                    className="input-field"
                    value={schedTime}
                    onChange={(e) => setSchedTime(e.target.value)}
                  />
                </div>
              </div>

              {schedDate && schedTime && (
                <div className="modal-summary">
                  <CheckCircle size={16} />
                  <span>Session on <strong>{new Date(schedDate + 'T' + schedTime).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</strong> at <strong>{new Date('2000-01-01T' + schedTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</strong></span>
                </div>
              )}

              <div className="modal-field" style={{ marginTop: 'var(--space-2)' }}>
                <label>📝 Care Notes (optional)</label>
                <textarea
                  className="input-field"
                  placeholder="Medication schedule, dietary needs, behavioural notes, special instructions..."
                  value={careNotes}
                  onChange={(e) => setCareNotes(e.target.value)}
                  rows={3}
                  style={{ resize: 'vertical', fontSize: 'var(--fs-sm)' }}
                />
              </div>

              <button
                className="btn-primary modal-confirm"
                onClick={confirmScheduledBooking}
                disabled={!schedDate || !schedTime}
              >
                {!schedDate || !schedTime ? 'Select date & time' : '✅ Confirm Booking'}
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .search-page { padding-top: 96px; padding-bottom: var(--space-16); min-height: 100vh; }
        .search-header { text-align: center; margin-bottom: var(--space-8); }
        .search-header h1 { margin-bottom: var(--space-2); }
        .search-header p { color: var(--text-secondary); font-size: var(--fs-lg); }
        .search-panel {
          padding: var(--space-6); display: flex; flex-direction: column;
          gap: var(--space-5); margin-bottom: var(--space-8);
        }
        .search-input-wrap { display: flex; flex-direction: column; gap: var(--space-3); }
        .search-textarea { resize: none; font-size: var(--fs-base); line-height: 1.6; }
        .search-filters { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--space-4); }
        .filter-group { display: flex; flex-direction: column; gap: var(--space-2); }
        .location-wrap { display: flex; gap: var(--space-2); align-items: center; }
        .location-wrap .location-input { flex: 1; }
        .locate-btn { display: flex; align-items: center; gap: 4px; padding: var(--space-2) var(--space-3); border-radius: var(--radius-md); font-size: var(--fs-xs); white-space: nowrap; border: 1px solid var(--border-glass); color: var(--primary-400); cursor: pointer; }
        .filter-group label {
          font-size: var(--fs-sm); font-weight: 500; color: var(--text-secondary);
          display: flex; align-items: center; gap: var(--space-1);
        }
        .urgency-tabs { display: flex; gap: var(--space-2); }
        .urgency-tab {
          display: flex; align-items: center; gap: 4px;
          padding: var(--space-2) var(--space-3); border-radius: var(--radius-md);
          background: var(--bg-card); border: 1px solid var(--border-glass);
          color: var(--text-secondary); font-size: var(--fs-xs); font-weight: 500;
          cursor: pointer; transition: all var(--transition-fast);
        }
        .urgency-tab:hover { border-color: var(--border-hover); }
        .urgency-tab.active {
          background: rgba(79,70,229,0.15); border-color: var(--primary-500); color: var(--primary-400);
        }
        .urgency-tab.active:last-child {
          background: rgba(239,68,68,0.15); border-color: var(--risk-red); color: var(--risk-red);
        }
        .budget-slider {
          width: 100%; accent-color: var(--primary-500); height: 4px;
          background: var(--bg-card); border-radius: 2px; cursor: pointer;
        }
        .location-input { padding: var(--space-2) var(--space-3); font-size: var(--fs-sm); }
        .search-btn { width: 100%; padding: var(--space-4); font-size: var(--fs-lg); }
        .clarify-msg { padding: var(--space-4); text-align: center; color: var(--text-secondary); }
        .results-section { display: flex; flex-direction: column; gap: var(--space-4); }
        .results-header { display: flex; justify-content: space-between; align-items: center; }
        .results-title { font-size: var(--fs-2xl); }
        .map-toggle { display: flex; align-items: center; gap: var(--space-1); font-size: var(--fs-sm); }
        .ai-badge { text-align: center; font-size: var(--fs-xs); color: var(--primary-400); margin-top: var(--space-1); }
        .alt-title { font-size: var(--fs-lg); margin-top: var(--space-4); }
        .alt-comparison { font-size: var(--fs-sm); color: var(--text-secondary); margin-bottom: var(--space-2); }

        /* ── Schedule picker ── */
        .schedule-picker {
          display: flex; gap: var(--space-3); margin-top: var(--space-2);
        }
        .sched-field {
          display: flex; align-items: center; gap: var(--space-2); flex: 1;
          color: var(--text-muted);
        }
        .sched-input { flex: 1; padding: var(--space-2) var(--space-3); font-size: var(--fs-sm); }

        /* ── Booking modal ── */
        .booking-modal-overlay {
          position: fixed; inset: 0; z-index: 1000;
          background: rgba(0,0,0,0.6); backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center;
          padding: var(--space-4);
        }
        .booking-modal {
          position: relative; width: 100%; max-width: 480px;
          padding: var(--space-8); display: flex; flex-direction: column;
          gap: var(--space-5); animation: modalIn 0.3s ease;
        }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .modal-close {
          position: absolute; top: var(--space-4); right: var(--space-4);
          background: none; border: none; color: var(--text-muted);
          cursor: pointer; padding: 4px;
        }
        .modal-close:hover { color: var(--text-primary); }
        .booking-modal h3 { font-size: var(--fs-xl); }
        .modal-subtitle { font-size: var(--fs-sm); color: var(--text-secondary); }
        .modal-caregiver {
          display: flex; align-items: center; gap: var(--space-3);
          padding: var(--space-3); background: var(--bg-primary);
          border-radius: var(--radius-lg); border: 1px solid var(--border-glass);
        }
        .modal-avatar {
          width: 48px; height: 48px; border-radius: var(--radius-full);
          object-fit: cover; border: 2px solid var(--primary-500);
        }
        .modal-caregiver strong { display: block; font-size: var(--fs-sm); }
        .modal-caregiver span { font-size: var(--fs-xs); color: var(--text-muted); }
        .modal-fields {
          display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3);
        }
        .modal-field { display: flex; flex-direction: column; gap: 4px; }
        .modal-field label {
          display: flex; align-items: center; gap: var(--space-1);
          font-size: var(--fs-xs); font-weight: 500; color: var(--text-tertiary);
        }
        .modal-field .input-field {
          padding: var(--space-3); font-size: var(--fs-sm);
        }
        .modal-summary {
          display: flex; align-items: center; gap: var(--space-2);
          padding: var(--space-3) var(--space-4); border-radius: var(--radius-lg);
          background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.2);
          color: var(--trust-green); font-size: var(--fs-sm);
        }
        .modal-confirm {
          width: 100%; padding: var(--space-3); font-size: var(--fs-base);
        }
        .modal-confirm:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
    </div>
  );
}
