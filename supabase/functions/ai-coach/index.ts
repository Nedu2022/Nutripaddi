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
- Use a warm, simple, African-friendly tone. Speak like a helpful person, not like a textbook. No long paragraphs and no unsolicited advice.
- Vary your wording, sentence rhythm, food examples, and opening phrases. Do not reuse the same first sentence or the same advice pattern when the conversation history already has similar replies.
- Be fresh in style, but do not invent facts, diagnoses, food names, or medical claims just to sound different.
- Use the user's onboarding/profile context to personalize replies. Respect their name, language, life stage, health note, eating habits, nutrition goal, location, and calorie target when relevant.
- Match the country or location in the profile. Use the food names, meal examples, and everyday wording people in that place would understand.
- Use layman language. Avoid medical grammar and big nutrition words. If you must use a nutrition word, explain it simply in the same sentence.
- If the user is a general user, do not assume pregnancy, breastfeeding, motherhood, or a baby.
- Only mention pregnancy, breastfeeding, babies, antenatal care, or postnatal care when the profile clearly says the user is pregnant or nursing.
- If the user gave a location, suggest foods and meals that are common and affordable there when they ask for food ideas.
- Write in plain text only. Do not use markdown, asterisks, bullets, hashes, bold, or italic symbols.

Food style:
- Cover foods from every African country, not only Nigeria. When location is known, use foods from that country first.
- Prefer real, affordable local foods such as jollof, thieboudienne, waakye, banku, kenkey, attieke, ndole, eru, injera, doro wat, shiro, tibs, ugali, sukuma wiki, nyama choma, matoke, sadza, nshima, pap, couscous, tagine, shakshuka, ful medames, beans, moi-moi, akara, ugu, ewedu, eggs, sardines, groundnut, plantain, yam, eba, amala, and fufu.

Safety:
- You are not a doctor and you do not diagnose. Give general food guidance only.
- If the message describes a danger sign, tell the user to go to a clinic, emergency unit, or community health worker now before giving food advice. Danger signs include heavy bleeding, severe headache, blurred vision, reduced baby movement, high fever, severe swelling, convulsions, severe abdominal pain, fainting, chest pain, trouble breathing, or a very weak or sleepy baby.

Reply in the user's preferred language when one is given. If the preferred language and location are both given, use that language in a natural local way for that country or area.`;

type HistoryItem = { isUser?: boolean; text?: string };

const SMALL_TALK_RE =
  /^(hi|hello|hey|good morning|good afternoon|good evening|morning|afternoon|evening|how are you|how far|what's up|whats up|thanks|thank you)[\s!.?]*$/i;

function getProfileName(profileContext: string) {
  const match = profileContext.match(/^- Name:\s*(.+)$/m);
  const firstName = match?.[1]?.trim().split(/\s+/)[0] ?? "";
  return firstName.replace(/[^\p{L}\p{N}'-]/gu, "");
}

function getPreferredLanguage(profileContext: string) {
  const match = profileContext.match(/^- Preferred language:\s*([^(.\n]+)/m);
  return match?.[1]?.trim().toLowerCase() ?? "";
}

function pick<T>(items: T[]) {
  if (items.length === 1) return items[0];
  const random = new Uint32Array(1);
  crypto.getRandomValues(random);
  return items[random[0] % items.length];
}

function getSmallTalkReply(message: string, profileContext: string) {
  const text = message.trim().toLowerCase().replace(/\s+/g, " ");
  if (!SMALL_TALK_RE.test(text)) return null;

  const name = getProfileName(profileContext);
  const namePart = name ? ` ${name}` : "";
  const language = getPreferredLanguage(profileContext);
  const isThanks = text.includes("thank");

  if (language === "french") {
    if (isThanks) {
      return pick([
        `Avec plaisir${namePart}. Comment puis-je vous aider aujourd'hui?`,
        `Pas de souci${namePart}. Que puis-je faire pour vous maintenant?`,
        `Je vous en prie${namePart}. Dites-moi ce dont vous avez besoin.`,
      ]);
    }
    return pick([
      `Bonjour${namePart}! Comment puis-je vous aider aujourd'hui?`,
      `Salut${namePart}! Qu'est-ce qu'on regarde cote nourriture aujourd'hui?`,
      `Bonjour${namePart}. Dites-moi ce que vous voulez savoir sur votre repas.`,
    ]);
  }
  if (language === "swahili") {
    if (isThanks) {
      return pick([
        `Karibu${namePart}. Nikusaidie nini leo?`,
        `Sawa kabisa${namePart}. Ungependa tujue nini sasa?`,
        `Usijali${namePart}. Niambie nikusaidieje.`,
      ]);
    }
    return pick([
      `Habari${namePart}! Nikusaidie nini leo?`,
      `Mambo${namePart}! Leo tuangalie nini kuhusu chakula?`,
      `Habari${namePart}. Niambie swali lako la chakula au lishe.`,
    ]);
  }
  if (language === "yoruba") {
    if (isThanks) {
      return pick([
        `Ko to nkan${namePart}. Bawo ni mo se le ran e lowo loni?`,
        `Ko si wahala${namePart}. Kini mo le ba e se bayi?`,
        `O dara${namePart}. So ohun ti o fe mo fun mi.`,
      ]);
    }
    return pick([
      `Bawo ni${namePart}! Bawo ni mo se le ran e lowo loni?`,
      `Pele${namePart}! Kini a n wo nipa ounje loni?`,
      `Bawo${namePart}. So ibeere ounje re fun mi.`,
    ]);
  }
  if (language === "hausa") {
    if (isThanks) {
      return pick([
        `Ba damuwa${namePart}. Me zan iya taimaka maka da shi yau?`,
        `Babu komai${namePart}. Me kake so mu duba yanzu?`,
        `Lafiya${namePart}. Fada min abin da kake bukata.`,
      ]);
    }
    return pick([
      `Sannu${namePart}! Me zan iya taimaka maka da shi yau?`,
      `Ina kwana${namePart}. Wane abinci ko shawara kake so mu duba?`,
      `Sannu${namePart}. Fada min tambayarka game da abinci.`,
    ]);
  }
  if (language === "igbo") {
    if (isThanks) {
      return pick([
        `Nnoo${namePart}. Kedu ka m ga-esi nyere gi aka taa?`,
        `O di mma${namePart}. Kedu ihe ichoro ka anyi leba anya ugbu a?`,
        `Nsogbu adighi${namePart}. Gwa m ihe ichoro ima.`,
      ]);
    }
    return pick([
      `Ndewo${namePart}! Kedu ka m ga-esi nyere gi aka taa?`,
      `Kedu${namePart}! Kedu nri ma obu ajuju ka anyi ga-ele taa?`,
      `Ndewo${namePart}. Gwa m ajuju nri gi.`,
    ]);
  }

  if (text.includes("morning")) {
    return pick([
      `Good morning${namePart}! How can I help you today?`,
      `Morning${namePart}. What food question are we looking at today?`,
      `Good morning${namePart}. Tell me what you want to check with your meal.`,
    ]);
  }
  if (text.includes("afternoon")) {
    return pick([
      `Good afternoon${namePart}! How can I help you today?`,
      `Afternoon${namePart}. What would you like to sort out with your food today?`,
      `Good afternoon${namePart}. Tell me what you need help with.`,
    ]);
  }
  if (text.includes("evening")) {
    return pick([
      `Good evening${namePart}! How can I help you today?`,
      `Evening${namePart}. What meal or food question should we look at?`,
      `Good evening${namePart}. Tell me what is on your mind about food.`,
    ]);
  }
  if (text.includes("thank")) {
    return pick([
      `You're welcome${namePart}. How can I help you today?`,
      `No problem${namePart}. What should we check next?`,
      `Anytime${namePart}. Tell me what you need now.`,
    ]);
  }

  return pick([
    `Hi${namePart}! How can I help you today?`,
    `Hello${namePart}. What food question can I help with?`,
    `Hey${namePart}. Tell me what you want to check today.`,
  ]);
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
            temperature: 0.72,
            maxOutputTokens: 170,
            topP: 0.95,
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
