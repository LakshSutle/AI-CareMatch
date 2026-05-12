import { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { parseInput } from '../engine/nlpParser';
import { matchCaregivers } from '../engine/matchEngine';
import { chatWithAI, parseWithAI, isAIConfigured } from '../services/openaiService';

const BOT_RESPONSES = {
  greeting: "Hi! 👋 I'm AI CareMatch. I help families find trusted, Verified caregivers — safely and in seconds.\n\nWhich category do you need?\n👶 Child Care\n🧑 Human Care (Elder/Adult)\n🐾 Pet Care\n\n⚠️ One person can only apply for one category.",
};

export default function WhatsAppPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    { from: 'bot', text: BOT_RESPONSES.greeting, time: '12:00 PM' },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const getTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const addBot = (text) => {
    setTyping(true);
    setTimeout(() => {
      setMessages((m) => [...m, { from: 'bot', text, time: getTime() }]);
      setTyping(false);
    }, 1200);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages((m) => [...m, { from: 'user', text: userMsg, time: getTime() }]);
    setInput('');

    // Try AI-powered chat first
    if (isAIConfigured) {
      setTyping(true);
      const newHistory = [...chatHistory, { role: 'user', content: userMsg }];

      // Try to parse as a search query
      const aiParsed = await parseWithAI(userMsg);
      if (aiParsed && aiParsed.domain && (aiParsed.location || aiParsed.budget)) {
        if (!aiParsed.specializations) aiParsed.specializations = [];
        const result = matchCaregivers(aiParsed);
        if (result.primary) {
          const cg = result.primary.caregiver;
          const govBadge = cg.govVerified ? '\n🏷️ Verified' : '';
          const response = `\ud83c\udfaf *Best Match Found!*\n\n*${cg.name}* \u2014 Match: ${result.primary.matchScore}/100 | Trust: ${cg.trustScore}/100${govBadge}\n\u2b50 Screening: ${'\u2b50'.repeat(cg.screeningRating || 3)}\n\n\u2705 ${result.primary.reasons.slice(0, 3).join('\n\u2705 ')}\n\n${result.primary.riskFlags[0]?.level !== 'none' ? '\u26a0\ufe0f ' + result.primary.riskFlags[0].message : '\u2705 No points to look after'}\n\n\ud83d\udcb0 \u20b9${cg.pricing}/${cg.pricingUnit} (\u20b9${cg.dailyCost}/day)\n\ud83d\udccd ${cg.location.name}\n\ud83d\udd12 4-hour dedicated focus \u2014 no parallel assignments\n\nReply *BOOK* to confirm or *MORE* for alternatives.`;
          setChatHistory([...newHistory, { role: 'assistant', content: response }]);
          addBot(response);
          return;
        }
      }

      // Otherwise use conversational AI
      const aiResponse = await chatWithAI(userMsg, chatHistory);
      if (aiResponse) {
        setChatHistory([...newHistory, { role: 'assistant', content: aiResponse }]);
        addBot(aiResponse);
        return;
      }
      setTyping(false);
    }

    // Fallback: rule-based
    const parsed = parseInput(userMsg);

    if (parsed.domain && (parsed.location || parsed.budget)) {
      const result = matchCaregivers(parsed);
      if (result.primary) {
        const cg = result.primary.caregiver;
        const govBadge = cg.govVerified ? '\n\ud83c\udff7\ufe0f Verified' : '';
        const response = `\ud83c\udfaf *Best Match Found!*\n\n*${cg.name}* \u2014 Match: ${result.primary.matchScore}/100 | Trust: ${cg.trustScore}/100${govBadge}\n\u2b50 Screening: ${'\u2b50'.repeat(cg.screeningRating || 3)}\n\n\u2705 ${result.primary.reasons.slice(0, 3).join('\n\u2705 ')}\n\n${result.primary.riskFlags[0]?.level !== 'none' ? '\u26a0\ufe0f ' + result.primary.riskFlags[0].message : '\u2705 No points to look after'}\n\n\ud83d\udcb0 \u20b9${cg.pricing}/${cg.pricingUnit} (\u20b9${cg.dailyCost}/day)\n\ud83d\udccd ${cg.location.name}\n\ud83d\udd12 4-hour dedicated focus \u2014 no parallel assignments\n\nReply *BOOK* to confirm or *MORE* for alternatives.`;
        addBot(response);
      } else {
        addBot("I couldn't find a match for those criteria. Could you try adjusting your requirements?");
      }
    } else if (parsed.missing.length > 0) {
      const questions = {
        domain: "Which category do you need?\n\ud83d\udc76 Child Care\n\ud83e\uddd1 Human Care (Elder/Adult)\n\ud83d\udc3e Pet Care",
        location: "Which area are you in? (e.g., Banjara Hills, Gachibowli)",
        budget: "What's your budget for this session? (e.g., Rs.500)",
      };
      addBot(questions[parsed.missing[0]] || "Could you tell me more about what you need?");
    } else {
      addBot("I understand you need care assistance. Could you describe your specific needs? For example:\n\n_\"Need a babysitter for my 6-year-old tonight, she has ADHD, budget is Rs.500, I'm in Banjara Hills\"_");
    }
  };

  return (
    <div className="wa-page">
      <div className="wa-container">
        {/* Header */}
        <div className="wa-header">
          <button className="wa-back" onClick={() => navigate('/')}><ArrowLeft size={20} /></button>
          <div className="wa-avatar">🤖</div>
          <div className="wa-header-info">
            <h4>AI CareMatch</h4>
            <span>{typing ? 'typing...' : 'online'}</span>
          </div>
        </div>

        {/* Chat */}
        <div className="wa-chat">
          {messages.map((m, i) => (
            <div key={i} className={`wa-msg ${m.from}`}>
              <div className="wa-bubble">
                <p style={{ whiteSpace: 'pre-wrap' }}>{m.text}</p>
                <span className="wa-time">{m.time}</span>
              </div>
            </div>
          ))}
          {typing && (
            <div className="wa-msg bot">
              <div className="wa-bubble wa-typing">
                <span className="dot" /><span className="dot" /><span className="dot" />
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Input */}
        <div className="wa-input-bar">
          <input
            type="text" className="wa-input" placeholder="Type a message..."
            value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button className="wa-send" onClick={handleSend}><Send size={20} /></button>
        </div>
      </div>

      <style>{`
        .wa-page { padding-top: 64px; min-height: 100vh; display: flex; justify-content: center; align-items: flex-start; padding: 80px var(--space-4) var(--space-4); }
        .wa-container { width: 100%; max-width: 480px; height: calc(100vh - 96px); display: flex; flex-direction: column; border-radius: var(--radius-xl); overflow: hidden; border: 1px solid var(--border-glass); background: #0B141A; }
        .wa-header { display: flex; align-items: center; gap: var(--space-3); padding: var(--space-3) var(--space-4); background: #1F2C33; }
        .wa-back { background: none; border: none; color: #8696A0; cursor: pointer; }
        .wa-avatar { width: 40px; height: 40px; border-radius: var(--radius-full); background: #00A884; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; }
        .wa-header-info h4 { font-size: var(--fs-base); color: #E9EDEF; }
        .wa-header-info span { font-size: var(--fs-xs); color: #8696A0; }
        .wa-chat { flex: 1; overflow-y: auto; padding: var(--space-4); display: flex; flex-direction: column; gap: var(--space-2); background: #0B141A url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5L35 15L45 15L37 22L40 32L30 26L20 32L23 22L15 15L25 15Z' fill='%23ffffff05'/%3E%3C/svg%3E"); }
        .wa-msg { display: flex; }
        .wa-msg.user { justify-content: flex-end; }
        .wa-msg.bot { justify-content: flex-start; }
        .wa-bubble { max-width: 85%; padding: var(--space-2) var(--space-3); border-radius: var(--radius-lg); font-size: var(--fs-sm); line-height: 1.5; position: relative; }
        .wa-msg.bot .wa-bubble { background: #1F2C33; color: #E9EDEF; border-bottom-left-radius: 4px; }
        .wa-msg.user .wa-bubble { background: #005C4B; color: #E9EDEF; border-bottom-right-radius: 4px; }
        .wa-time { font-size: 10px; color: #8696A0; float: right; margin-top: 4px; margin-left: var(--space-2); }
        .wa-typing { display: flex; gap: 4px; padding: var(--space-3); }
        .wa-typing .dot { width: 8px; height: 8px; border-radius: var(--radius-full); background: #8696A0; }
        .wa-typing .dot:nth-child(1) { animation: typingBounce 1.4s infinite 0s; }
        .wa-typing .dot:nth-child(2) { animation: typingBounce 1.4s infinite 0.2s; }
        .wa-typing .dot:nth-child(3) { animation: typingBounce 1.4s infinite 0.4s; }
        @keyframes typingBounce { 0%,60%,100% { transform: translateY(0); } 30% { transform: translateY(-8px); } }
        .wa-input-bar { display: flex; gap: var(--space-2); padding: var(--space-2) var(--space-3); background: #1F2C33; }
        .wa-input { flex: 1; padding: var(--space-3); background: #2A3942; border: none; border-radius: var(--radius-lg); color: #E9EDEF; font-size: var(--fs-sm); }
        .wa-input::placeholder { color: #8696A0; }
        .wa-input:focus { outline: none; }
        .wa-send { width: 44px; height: 44px; border-radius: var(--radius-full); background: #00A884; border: none; color: white; display: flex; align-items: center; justify-content: center; cursor: pointer; }
        .wa-send:hover { background: #06CF9C; }
      `}</style>
    </div>
  );
}
