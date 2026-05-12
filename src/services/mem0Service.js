const STORAGE_KEY = 'carematch_user_id';

function createUserId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `user_${crypto.randomUUID()}`;
  }

  return `user_${Date.now()}`;
}

export function getUserId() {
  let id = localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = createUserId();
    localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}

export async function addMemory(messages, metadata = {}) {
  try {
    const response = await fetch('/api/memory/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages,
        metadata,
        userId: getUserId(),
      }),
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (err) {
    console.warn('Memory sync failed:', err.message);
    return null;
  }
}

export async function searchMemories() {
  return [];
}

export async function getAllMemories() {
  return [];
}

export async function getMemoryContext() {
  return '';
}

export const isMem0Configured = true;
