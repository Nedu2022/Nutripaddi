// @ts-nocheck

const corsHeaders = {
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Origin": "*",
};

function getEnv(name: string) {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`${name} is not configured.`);
  return value;
}

const SYSTEM_PROMPT = `You are NutriPadi, a friendly food and nutrition assistant inside the AI FoodScan app.

Core rules:
- On a greeting or small talk like "hi", "hello", or "good morning", reply in ONE short line and ask how you can help. Example: "Hi Nnedu! How can I help you today?" Do not give food or nutrition advice unless asked.
- Only give nutrition or diet advice when the user asks a food question, asks about their health goal, or has just scanned a meal.
- Keep every reply to 1 to 3 sentences unless the user asks for more detail.
- Use a warm, simple, African-friendly tone. No long paragraphs and no unsolicited advice.
- Use the user's onboarding/profile context to personalize replies. Respect their name, language, life stage, health note, eating habits, nutrition goal, location, and calorie target when relevant.
- If the user is a general user, do not assume pregnancy, breastfeeding, motherhood, or a baby.
- Only mention pregnancy, breastfeeding, babies, antenatal care, or postnatal care when the profile clearly says the user is pregnant or nursing.
- If the user gave a location, suggest foods and meals that are common and affordable there when they ask for food ideas.
- Write in plain text only. Do not use markdown, asterisks, bullets, hashes, bold, or italic symbols.

Food style:
- Prefer real, affordable local foods such as beans, moi-moi, akara, ugu, ewedu, other green leafy vegetables, eggs, liver, sardines, crayfish, groundnut, garden egg, pap/akamu, plantain, rice, yam, and swallows like eba or amala.

Safety:
- You are not a doctor and you do not diagnose. Give general food guidance only.
- If the message describes a danger sign, tell the user to go to a clinic, emergency unit, or community health worker now before giving food advice. Danger signs include heavy bleeding, severe headache, blurred vision, reduced baby movement, high fever, severe swelling, convulsions, severe abdominal pain, fainting, chest pain, trouble breathing, or a very weak or sleepy baby.

Reply in the user's preferred language when one is given.`;

type HistoryItem = { isUser?: boolean; text?: string };

const SMALL_TALK_RE =
  /^(hi|hello|hey|good morning|good afternoon|good evening|morning|afternoon|evening|how are you|how far|what's up|whats up|thanks|thank you)[\s!.?]*$/i;

function getProfileName(profileContext: string) {
  const match = profileContext.match(/^- Name:\s*(.+)$/m);
  const firstName = match?.[1]?.trim().split(/\s+/)[0] ?? "";
  return firstName.replace(/[^\p{L}\p{N}'-]/gu, "");
}

function getSmallTalkReply(message: string, profileContext: string) {
  const text = message.trim().toLowerCase().replace(/\s+/g, " ");
  if (!SMALL_TALK_RE.test(text)) return null;

  const name = getProfileName(profileContext);
  const namePart = name ? ` ${name}` : "";

  if (text.includes("morning")) {
    return `Good morning${namePart}! How can I help you today?`;
  }
  if (text.includes("afternoon")) {
    return `Good afternoon${namePart}! How can I help you today?`;
  }
  if (text.includes("evening")) {
    return `Good evening${namePart}! How can I help you today?`;
  }
  if (text.includes("thank")) {
    return `You're welcome${namePart}. How can I help you today?`;
  }

  return `Hi${namePart}! How can I help you today?`;
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const apiKey =
      Deno.env.get("GEMINI_API_KEY") ?? Deno.env.get("GOOGLE_API_KEY");
    if (!apiKey) throw new Error("GEMINI_API_KEY is not configured.");

    const model = Deno.env.get("GEMINI_MODEL") || "gemini-3.1-flash-lite";

    const payload = await request.json().catch(() => ({}));
    const message = typeof payload.message === "string" ? payload.message.trim() : "";
    const history: HistoryItem[] = Array.isArray(payload.history) ? payload.history : [];
    const profileContext =
      typeof payload.profileContext === "string" ? payload.profileContext.trim() : "";

    if (!message) {
      return Response.json(
        { message: "Missing message." },
        { headers: corsHeaders, status: 400 }
      );
    }

    const smallTalkReply = getSmallTalkReply(message, profileContext);
    if (smallTalkReply) {
      return Response.json({ reply: smallTalkReply }, { headers: corsHeaders });
    }

    const systemText = profileContext
      ? `${SYSTEM_PROMPT}\n\nUser profile:\n${profileContext}`
      : SYSTEM_PROMPT;

    const contents = history
      .slice(-10)
      .filter((item) => typeof item.text === "string" && item.text.trim())
      .map((item) => ({
        role: item.isUser ? "user" : "model",
        parts: [{ text: item.text }],
      }));
    contents.push({ role: "user", parts: [{ text: message }] });

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemText }] },
          contents,
          generationConfig: {
            temperature: 0.45,
            maxOutputTokens: 170,
            topP: 0.9,
          },
        }),
      }
    );

    const data = await geminiResponse.json();

    if (!geminiResponse.ok) {
      const detail = data?.error?.message ?? "The AI service returned an error.";
      return Response.json(
        { message: detail },
        { headers: corsHeaders, status: geminiResponse.status }
      );
    }

    const rawReply = data?.candidates?.[0]?.content?.parts
      ?.map((part: { text?: string }) => part?.text ?? "")
      .join("")
      .trim();

    const reply = rawReply
      ?.replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/^\s*[*\-•]\s+/gm, "")
      .replace(/`{1,3}([^`]*)`{1,3}/g, "$1")
      .replace(/^#{1,6}\s+/gm, "")
      .trim();

    if (!reply) {
      const blockReason = data?.promptFeedback?.blockReason;
      return Response.json(
        {
          reply:
            "I couldn't answer that one. Try rephrasing, and remember I share general food guidance only" +
            (blockReason ? "." : "."),
        },
        { headers: corsHeaders }
      );
    }

    return Response.json({ reply }, { headers: corsHeaders });
  } catch (error) {
    return Response.json(
      { message: error instanceof Error ? error.message : "The coach could not respond." },
      { headers: corsHeaders, status: 500 }
    );
  }
});
