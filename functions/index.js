const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const OpenAI = require("openai");

const REGION = "asia-south1";

const PARSE_SYSTEM_PROMPT = `You are AI CareMatch's intent parser. Extract structured data from caregiver search queries.
Return ONLY valid JSON with these fields:
- domain: "child" | "human" | "pet" | null
- urgency: "emergency" | "sameday" | "scheduled"
- specializations: string[] (e.g. ["ADHD", "autism", "dementia", "night-shift"])
- timeSlot: "morning" | "afternoon" | "evening" | "night" | null
- budget: number | null (in INR)
- location: string | null (area name like "Banjara Hills")
- missing: string[] (fields user didn't specify, from: "domain", "location", "budget")

Categories: "child" = childcare/babysitter/nanny, "human" = elder care/adult care/dementia, "pet" = dog/cat/animal care.
Indian locations in Hyderabad: Banjara Hills, Jubilee Hills, Gachibowli, Madhapur, Kondapur, Hitech City, Kukatpally, Ameerpet, Secunderabad, Begumpet, Miyapur, Manikonda, Tolichowki, Sainikpuri, Dilsukhnagar.`;

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({ apiKey });
}

function getMem0Key() {
  return process.env.MEM0_API_KEY || process.env.VITE_MEM0_API_KEY || "";
}

function getTwilioConfig() {
  return {
    sid: process.env.TWILIO_ACCOUNT_SID || "",
    token: process.env.TWILIO_AUTH_TOKEN || "",
    from: process.env.TWILIO_WHATSAPP_FROM || "",
  };
}

function normalizePath(pathname = "/") {
  return pathname.replace(/^\/api/, "") || "/";
}

function getBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string" && req.body.trim()) return JSON.parse(req.body);
  return {};
}

function setCors(res) {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Headers", "Content-Type");
  res.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
}

async function searchMemories(query, userId) {
  const mem0Key = getMem0Key();
  if (!mem0Key || !query || !userId) return [];

  const response = await fetch("https://api.mem0.ai/v1/memories/search/", {
    method: "POST",
    headers: {
      Authorization: `Token ${mem0Key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      user_id: userId,
      limit: 5,
    }),
  });

  if (!response.ok) {
    throw new Error(`Mem0 search failed: ${response.status}`);
  }

  const data = await response.json();
  return data.results || [];
}

async function addMemory(messages, metadata, userId) {
  const mem0Key = getMem0Key();
  if (!mem0Key || !Array.isArray(messages) || !userId) {
    return { skipped: true };
  }

  const response = await fetch("https://api.mem0.ai/v1/memories/", {
    method: "POST",
    headers: {
      Authorization: `Token ${mem0Key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages,
      user_id: userId,
      metadata: { app: "ai-carematch", ...(metadata || {}) },
    }),
  });

  if (!response.ok) {
    throw new Error(`Mem0 add failed: ${response.status}`);
  }

  return response.json();
}

async function handleParse(req, res) {
  const { userText } = getBody(req);
  if (!userText) {
    return res.status(400).json({ error: "Missing userText" });
  }

  const client = getOpenAIClient();
  if (!client) {
    return res.status(503).json({ error: "AI backend not configured" });
  }

  const response = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    temperature: 0.1,
    max_tokens: 200,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: PARSE_SYSTEM_PROMPT },
      { role: "user", content: userText },
    ],
  });

  const parsed = JSON.parse(response.choices[0].message.content);
  parsed.raw = userText;
  return res.status(200).json(parsed);
}

async function handleChat(req, res) {
  const { userMessage, conversationHistory = [], userId } = getBody(req);
  if (!userMessage) {
    return res.status(400).json({ error: "Missing userMessage" });
  }

  const client = getOpenAIClient();
  if (!client) {
    return res.status(503).json({ error: "AI backend not configured" });
  }

  let memoryContext = "";
  try {
    const memories = await searchMemories(userMessage, userId);
    const context = memories
      .map((memory) => memory.memory)
      .filter(Boolean)
      .join(". ");

    if (context) {
      memoryContext = `\n\n[User Memory Context]: ${context}`;
    }
  } catch (error) {
    logger.warn("Mem0 search failed", error);
  }

  const systemContent = `You are AI CareMatch Assistant — a friendly, professional caregiver matching bot.
You help families find verified caregivers in 3 categories: Child (babysitter/nanny), Human (elder/adult care), Pet (dog/cat care).
Key rules:
- One person, one category only
- All caregivers are Gov ID verified with medical professor screening
- ₹300 platform verification charge for caregivers
- 4-hour dedicated focus period per assignment — no parallel jobs
- Keep responses concise, warm, and helpful
- Ask clarifying questions if you need: category, location, budget, or time slot
- You operate in Hyderabad, India
- If you have memory context about this user, use it to personalize your response.${memoryContext}`;

  const response = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    temperature: 0.7,
    max_tokens: 300,
    messages: [
      { role: "system", content: systemContent },
      ...conversationHistory,
      { role: "user", content: userMessage },
    ],
  });

  const reply = response.choices[0].message.content;

  if (userId) {
    addMemory(
      [
        { role: "user", content: userMessage },
        { role: "assistant", content: reply },
      ],
      { source: "assistant_chat" },
      userId,
    ).catch((error) => logger.warn("Mem0 add failed", error));
  }

  return res.status(200).json({ reply });
}

async function handleMemoryAdd(req, res) {
  const { messages, metadata = {}, userId } = getBody(req);
  if (!Array.isArray(messages) || !userId) {
    return res.status(400).json({ error: "Missing messages or userId" });
  }

  const result = await addMemory(messages, metadata, userId);
  return res.status(200).json(result);
}

async function handleSos(req, res) {
  const { to, message } = getBody(req);
  if (!to || !message) {
    return res.status(400).json({ error: "Missing to or message" });
  }

  const { sid, token, from } = getTwilioConfig();
  if (!sid || !token || !from) {
    return res.status(503).json({ error: "Twilio backend not configured" });
  }

  const postData = new URLSearchParams({
    From: `whatsapp:${from}`,
    To: `whatsapp:${to}`,
    Body: message,
  });

  const auth = Buffer.from(`${sid}:${token}`).toString("base64");
  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: postData,
  });

  const data = await response.json();
  if (!response.ok) {
    return res.status(response.status).json({ error: data.message || "Twilio request failed" });
  }

  return res.status(200).json({ success: true, sid: data.sid });
}

exports.api = onRequest(
  { region: REGION, timeoutSeconds: 60, cors: true },
  async (req, res) => {
    setCors(res);

    if (req.method === "OPTIONS") {
      return res.status(204).send("");
    }

    try {
      const path = normalizePath(req.path);

      if (req.method === "GET" && path === "/health") {
        return res.status(200).json({
          ok: true,
          ai: Boolean(getOpenAIClient()),
          mem0: Boolean(getMem0Key()),
          twilio: Boolean(getTwilioConfig().sid && getTwilioConfig().token && getTwilioConfig().from),
        });
      }

      if (req.method !== "POST") {
        return res.status(405).json({ error: "POST only" });
      }

      if (path === "/ai/parse") return await handleParse(req, res);
      if (path === "/ai/chat") return await handleChat(req, res);
      if (path === "/memory/add") return await handleMemoryAdd(req, res);
      if (path === "/sos") return await handleSos(req, res);

      return res.status(404).json({ error: "Not found" });
    } catch (error) {
      logger.error("API error", error);
      return res.status(500).json({ error: error.message || "Unexpected server error" });
    }
  },
);
