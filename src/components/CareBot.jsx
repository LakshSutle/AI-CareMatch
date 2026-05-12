import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { chatWithAI } from '../services/openaiService';

const SYSTEM_PROMPT = `You are CareBot, the official AI assistant for the AI CareMatch platform — a trust-based caregiver intelligence platform.

STRICT RULES:
1. You ONLY answer questions about the AI CareMatch platform, its features, and how to use it.
2. If the user asks ANYTHING unrelated to AI CareMatch (weather, coding, general knowledge, etc.), politely decline: "I'm CareBot, your AI CareMatch assistant! I can only help with questions about our platform. 😊"
3. Keep responses short (2-4 sentences max), friendly, and use emojis.
4. Never make up features that don't exist.

PLATFORM KNOWLEDGE:
- AI CareMatch matches families with verified caregivers across 3 categories: Child Care (👶), Human/Elder Care (🧑), Pet Care (🐾)
- Each caregiver is locked to ONE category only — no cross-mixing
- Match Engine scores caregivers across 6 dimensions: Experience, Availability, Proximity, Verification, Reliability, Budget Fit
- Every caregiver goes through 5-step verification: Live Selfie, Gov ID, OCR, Skill Assessment, Reference Check
- Trust Score (0-100) = computed from verification checks, NOT star ratings
- Match Score (0-100) = how well a caregiver fits your specific request RIGHT NOW
- Confidence Indicator shows how certain the AI is about the match
- XAI (Explainable AI) gives 5 plain-English reasons for every recommendation
- Smart Alternative always shows a second option with trade-off explained
- Risk Flags show caregiver weaknesses BEFORE booking
- Voice Input lets you speak your request instead of typing
- 4-hour dedicated focus lockout — one caregiver, one patient, no parallel jobs
- Budget optimization tips suggest small increases to unlock better matches
- Surge awareness warns when 50%+ caregivers in your area are busy
- Verification Tiers: 🟢 Basic → 🔵 Advanced → 🟣 Medical
- Favourite caregivers can be saved with ❤️ and rebooked from dashboard
- Family Safety Profile stores emergency contacts, blood group, allergies
- Caregiver Dashboard has: Earnings, Skill Upgrade Pathway, Trust Score Trend
- 4 languages supported: English, Hindi, Telugu, Tamil (instant switching)
- Platform operates in Hyderabad, India
- WhatsApp notification is sent automatically after booking a screened caregiver
- Login: Patients (e.g. laksh@patient.com / 123456), Caregivers (e.g. laksh@caregiver.com / 123456)

HOW TO USE:
1. Go to "Find Caregiver" page
2. Type or speak your need (e.g. "Need ADHD support near Banjara Hills budget 500")
3. Set urgency (Scheduled/Same Day/Emergency), budget slider, and location
4. Click "Find Best Match" — AI matches in under 3 seconds
5. Review Match Score, Trust Score, XAI reasons, and Risk Flags
6. Click "Book Now" to confirm
7. Check Dashboard for booking status and history`;

void SYSTEM_PROMPT;

// Built-in FAQ for when OpenAI API is not configured
const FAQ = [
  { keys: ['hello', 'hi', 'hey', 'help'], reply: "Hey there! 👋 I'm CareBot, your AI CareMatch assistant. I can help you with:\n• How to find a caregiver\n• Understanding Trust & Match scores\n• Booking process\n• Account & verification\n\nWhat would you like to know? 😊" },
  { keys: ['find', 'search', 'caregiver', 'match'], reply: "To find a caregiver: Go to **Find Caregiver** → type or speak your need (e.g. 'ADHD support near Banjara Hills') → set budget & urgency → click **Find Best Match**. The AI will match you in under 3 seconds! 🚀" },
  { keys: ['trust score', 'trust', 'score'], reply: "**Trust Score (0-100)** is computed from 8 verification checks — NOT star ratings. It includes Gov ID, medical screening, police clearance, and more. Higher = more verified. 🛡️" },
  { keys: ['match score'], reply: "**Match Score (0-100)** shows how well a caregiver fits YOUR specific request right now — based on experience, availability, proximity, verification, reliability, and budget fit. 🎯" },
  { keys: ['book', 'booking'], reply: "To book: Find a match → click **Book Now** → choose Scheduled/Same-Day/Emergency → confirm. A WhatsApp notification is auto-sent to the screened caregiver. You can track it in your Dashboard! 📋" },
  { keys: ['verify', 'verification', 'verified'], reply: "Caregivers go through **5-step verification**: Live Selfie 📸, Gov ID Upload 🪪, OCR Check, Skill Assessment, and Reference Check. Tiers: 🟢 Basic → 🔵 Advanced → 🟣 Medical. 🔐" },
  { keys: ['category', 'categories', 'domain'], reply: "We have **3 categories**: 👶 **Child Care** (ADHD, autism, special needs), 🧑 **Human Care** (dementia, elder, post-surgery), 🐾 **Pet Care** (breed-specific, anxiety, dietary). Each caregiver is locked to ONE category only! 🔒" },
  { keys: ['voice', 'speak', 'speech'], reply: "Yes! Click the **🎤 microphone** button on the search page. Speak your need naturally — the AI transcribes and parses it automatically. Zero typing required! 🗣️" },
  { keys: ['language', 'hindi', 'telugu', 'tamil'], reply: "We support **4 languages**: English 🇬🇧, Hindi 🇮🇳, Telugu 🇮🇳, Tamil 🇮🇳. Click the **🌐 globe icon** in the top-right to switch instantly — no page reload! 🌍" },
  { keys: ['dashboard', 'my dashboard'], reply: "Your **Dashboard** shows: Active Bookings, Past Sessions, Trust Insights, Favourite Caregivers, and Family Safety Profile. Caregivers see: Earnings, Skill Upgrade Pathway, and Trust Score Trend. 📊" },
  { keys: ['favourite', 'favorite', 'save'], reply: "Click the **❤️ heart** on any caregiver card to save them. View all favourites in your Dashboard → Favourite Caregivers section. Quick rebook anytime! ❤️" },
  { keys: ['safety', 'emergency', 'profile'], reply: "Set up your **Family Safety Profile** in the Dashboard: emergency contacts, blood group, allergies, medications, and health conditions — all in one secure place. 🏥" },
  { keys: ['price', 'cost', 'budget', 'pricing'], reply: "Set your budget using the **slider** (₹100-₹5000/session). The AI shows caregivers within your budget and gives **optimization tips** — e.g. '₹50 more unlocks 1 higher-rated caregiver'. 💰" },
  { keys: ['login', 'account', 'sign up'], reply: "Click **Login** in the top-right. Demo accounts:\n• **Patient**: laksh@patient.com / 123456\n• **Caregiver**: laksh@caregiver.com / 123456\nSign up with any email to create a new account! 🔑" },
  { keys: ['xai', 'explain', 'why', 'reason'], reply: "Our **Explainable AI** gives 5 plain-English reasons for every match — like 'Verified — 8/8 checks passed' or '97% on-time rate'. Plus a **Smart Alternative** with trade-offs explained. 🧠" },
  { keys: ['whatsapp', 'notification', 'notify'], reply: "After booking a **screened caregiver**, a WhatsApp message is auto-sent with your booking details. This only happens for caregivers with approved screening status. 📱" },
  { keys: ['risk', 'flag', 'warning'], reply: "**Risk Flags** show potential concerns BEFORE booking — like 'No night-shift availability' or 'Limited experience with this condition'. Keeps you informed! ⚠️" },
];

function getLocalReply(msg) {
  const lower = msg.toLowerCase();
  for (const faq of FAQ) {
    if (faq.keys.some(k => lower.includes(k))) return faq.reply;
  }
  return "I can help you with finding caregivers, understanding scores, booking, verification, and more! Try asking me something like 'How do I find a caregiver?' 😊";
}

export default function CareBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! 👋 I'm **CareBot**, your AI CareMatch assistant. Ask me anything about the platform — how to find caregivers, scores, booking, verification, and more!" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const history = messages.slice(-10).map((message) => ({
      role: message.role,
      content: message.content,
    }));
    const aiReply = await chatWithAI(text, history);
    const reply = aiReply || getLocalReply(text);

    setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    setLoading(false);
  };

  return (
    <>
      {/* Chat Toggle Button */}
      {!open && (
        <button className="carebot-fab" onClick={() => setOpen(true)} title="Chat with CareBot">
          <MessageCircle size={26} />
          <span className="carebot-fab-badge">AI</span>
        </button>
      )}

      {/* Chat Window */}
      {open && (
        <div className="carebot-window">
          <div className="carebot-header">
            <div className="carebot-header-info">
              <Bot size={20} />
              <div>
                <strong>CareBot</strong>
                <span className="carebot-status">● Online</span>
              </div>
            </div>
            <button className="carebot-close" onClick={() => setOpen(false)}><X size={18} /></button>
          </div>

          <div className="carebot-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`carebot-msg ${msg.role}`}>
                <div className="carebot-msg-icon">
                  {msg.role === 'assistant' ? <Bot size={16} /> : <User size={16} />}
                </div>
                <div className="carebot-msg-bubble">{msg.content}</div>
              </div>
            ))}
            {loading && (
              <div className="carebot-msg assistant">
                <div className="carebot-msg-icon"><Bot size={16} /></div>
                <div className="carebot-msg-bubble carebot-typing">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="carebot-input-area">
            <input
              ref={inputRef}
              type="text"
              placeholder="Ask about AI CareMatch..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              disabled={loading}
            />
            <button onClick={handleSend} disabled={!input.trim() || loading}>
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      <style>{`
        .carebot-fab {
          position: fixed; bottom: 24px; right: 24px; z-index: 9999;
          width: 56px; height: 56px; border-radius: 50%;
          background: linear-gradient(135deg, #6366F1, #8B5CF6);
          color: white; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 20px rgba(99,102,241,0.4);
          transition: all 0.3s ease;
        }
        .carebot-fab:hover { transform: scale(1.1); box-shadow: 0 6px 28px rgba(99,102,241,0.5); }
        .carebot-fab-badge {
          position: absolute; top: -4px; right: -4px;
          background: #10B981; color: white; font-size: 10px; font-weight: 700;
          padding: 2px 6px; border-radius: 8px; letter-spacing: 0.5px;
        }

        .carebot-window {
          position: fixed; bottom: 24px; right: 24px; z-index: 9999;
          width: 380px; height: 520px;
          background: #0f0d1a;
          border: 1px solid rgba(99,102,241,0.2);
          border-radius: 20px;
          display: flex; flex-direction: column;
          box-shadow: 0 12px 48px rgba(0,0,0,0.6);
          overflow: hidden;
          animation: carebot-slide-up 0.3s ease-out;
        }
        @keyframes carebot-slide-up {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .carebot-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 18px;
          background: linear-gradient(135deg, #6366F1, #8B5CF6);
          color: white;
        }
        .carebot-header-info { display: flex; align-items: center; gap: 10px; }
        .carebot-header-info div { display: flex; flex-direction: column; }
        .carebot-header-info strong { font-size: 14px; }
        .carebot-status { font-size: 11px; color: rgba(255,255,255,0.8); }
        .carebot-status::before { content: ''; display: none; }
        .carebot-close {
          background: rgba(255,255,255,0.15); border: none; color: white;
          width: 32px; height: 32px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: background 0.2s;
        }
        .carebot-close:hover { background: rgba(255,255,255,0.25); }

        .carebot-messages {
          flex: 1; overflow-y: auto; padding: 16px;
          display: flex; flex-direction: column; gap: 12px;
          background: #0f0d1a;
          scrollbar-width: thin;
          scrollbar-color: rgba(99,102,241,0.3) transparent;
        }

        .carebot-msg {
          display: flex; gap: 8px; max-width: 88%;
          animation: carebot-fade-in 0.2s ease;
        }
        @keyframes carebot-fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .carebot-msg.user { align-self: flex-end; flex-direction: row-reverse; }
        .carebot-msg-icon {
          width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          background: rgba(99,102,241,0.15); color: #818CF8;
        }
        .carebot-msg.user .carebot-msg-icon {
          background: rgba(16,185,129,0.15); color: #34D399;
        }
        .carebot-msg-bubble {
          padding: 10px 14px; border-radius: 16px;
          font-size: 13px; line-height: 1.5;
          color: var(--text-primary, #fff);
          white-space: pre-wrap; word-break: break-word;
        }
        .carebot-msg.assistant .carebot-msg-bubble {
          background: rgba(99,102,241,0.08);
          border: 1px solid rgba(99,102,241,0.15);
          border-bottom-left-radius: 4px;
        }
        .carebot-msg.user .carebot-msg-bubble {
          background: rgba(16,185,129,0.12);
          border: 1px solid rgba(16,185,129,0.2);
          border-bottom-right-radius: 4px;
        }

        /* Typing indicator */
        .carebot-typing {
          display: flex; gap: 4px; padding: 14px 18px;
        }
        .carebot-typing span {
          width: 7px; height: 7px; border-radius: 50%;
          background: #818CF8; opacity: 0.4;
          animation: carebot-dot 1.2s ease-in-out infinite;
        }
        .carebot-typing span:nth-child(2) { animation-delay: 0.2s; }
        .carebot-typing span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes carebot-dot {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-6px); opacity: 1; }
        }

        .carebot-input-area {
          display: flex; gap: 8px; padding: 12px 14px;
          border-top: 1px solid rgba(99,102,241,0.15);
          background: #131127;
        }
        .carebot-input-area input {
          flex: 1; background: rgba(255,255,255,0.05);
          border: 1px solid var(--border-glass, rgba(255,255,255,0.1));
          border-radius: 12px; padding: 10px 14px;
          color: var(--text-primary, #fff); font-size: 13px;
          outline: none; transition: border-color 0.2s;
        }
        .carebot-input-area input:focus {
          border-color: rgba(99,102,241,0.5);
        }
        .carebot-input-area input::placeholder { color: var(--text-muted, #666); }
        .carebot-input-area button {
          width: 38px; height: 38px; border-radius: 12px;
          background: linear-gradient(135deg, #6366F1, #8B5CF6);
          color: white; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s; flex-shrink: 0;
        }
        .carebot-input-area button:hover:not(:disabled) { transform: scale(1.05); }
        .carebot-input-area button:disabled { opacity: 0.4; cursor: not-allowed; }

        @media (max-width: 480px) {
          .carebot-window {
            width: calc(100vw - 16px); height: calc(100vh - 80px);
            bottom: 8px; right: 8px; border-radius: 16px;
          }
          .carebot-fab { bottom: 16px; right: 16px; width: 50px; height: 50px; }
        }
      `}</style>
    </>
  );
}
