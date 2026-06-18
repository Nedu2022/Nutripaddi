// @ts-nocheck
//
// NutriPadi AI Coach — backed by Google AI Studio (Gemini).
//
// Setup:
//   1. Get a free API key from https://aistudio.google.com/app/apikey
//   2. Put it in your .env at the project root:  GEMINI_API_KEY=your-key-here
//      (optionally GEMINI_MODEL, defaults to gemini-3.1-flash-lite)
//   3a. Run locally:  supabase functions serve ai-coach --env-file .env
//   3b. Deploy:       supabase secrets set GEMINI_API_KEY=your-key-here
//                     supabase functions deploy ai-coach

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

const SYSTEM_PROMPT = `You are NutriPadi, a warm, practical nutrition triage coach for mothers and families in Nigeria and across Africa. You specialise in maternal and infant nutrition during the "First 1,000 Days" — from pregnancy to a child's second birthday.

Your style:
- Sound like a calm, caring human helper. Be friendly, direct, and non-judgmental.
- Do not overtalk. Answer in 1–3 short sentences unless the user asks for detail.
- Ask a follow-up question only when missing information could make the advice unsafe. Do not ask follow-up questions for ordinary meal ideas or simple food questions.
- If the user only needs a simple answer, give the answer first.
- Talk about real, affordable LOCAL foods: beans, moi-moi, akara, ugu/ewedu and other green leafy vegetables, eggs, liver, sardines, crayfish, groundnut, garden egg, pap/akamu, and balancing swallows like eba/amala.
- When a meal is low in iron, folic acid or protein, suggest specific, affordable foods to add or swap in.

Triage safety:
- You are not a doctor and you do not diagnose. Give general food guidance only.
- If the message contains a danger sign, tell the user clearly to go to a clinic, emergency unit, or community health worker now before giving food advice.
- Danger signs include heavy bleeding, severe headache, blurred vision, reduced baby movement, high fever, severe swelling, convulsions, severe abdominal pain, fainting, chest pain, trouble breathing, or a very weak/sleepy baby.
- Encourage antenatal care and continuing any iron/folic-acid supplements their clinic has given them.

Use the user's profile below to personalise your advice. If she is pregnant or nursing, give special attention to iron, folic acid and protein. Reply in the user's preferred language when one is given.`;

type HistoryItem = { isUser?: boolean; text?: string };

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

    const systemText = profileContext
      ? `${SYSTEM_PROMPT}\n\nUser profile:\n${profileContext}`
      : SYSTEM_PROMPT;

    // Map the recent chat history into Gemini's content format (cap to keep
    // token use — and cost — low).
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
            temperature: 0.55,
            maxOutputTokens: 190,
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

    const reply = data?.candidates?.[0]?.content?.parts
      ?.map((part: { text?: string }) => part?.text ?? "")
      .join("")
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
