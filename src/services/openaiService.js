import { getUserId } from './mem0Service';

const isConfigured = import.meta.env.VITE_DISABLE_SERVER_AI !== 'true';

async function postJson(path, payload) {
  const response = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `Request failed with status ${response.status}`);
  }

  return response.json();
}

export async function parseWithAI(userText) {
  if (!isConfigured || !userText?.trim()) return null;

  try {
    return await postJson('/api/ai/parse', { userText });
  } catch (err) {
    console.warn('AI parse failed, falling back to rule-based parser:', err.message);
    return null;
  }
}

export async function chatWithAI(userMessage, conversationHistory = []) {
  if (!isConfigured || !userMessage?.trim()) return null;

  try {
    const response = await postJson('/api/ai/chat', {
      userMessage,
      conversationHistory,
      userId: getUserId(),
    });
    return response.reply || null;
  } catch (err) {
    console.warn('AI chat failed:', err.message);
    return null;
  }
}

export { isConfigured as isAIConfigured };
