// @ts-nocheck

const corsHeaders = {
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Origin": "*",
};

const API_URL =
  Deno.env.get("FOODSCAN_API_URL") || "https://nnedu-foodscan-backend.hf.space";

const USER_STATUSES = new Set(["pregnant", "breastfeeding", "other"]);

function normalizeUserStatus(value: unknown) {
  const status = typeof value === "string" ? value.trim().toLowerCase() : "";
  return USER_STATUSES.has(status) ? status : null;
}

function inferUserStatus(profileContext: string) {
  const context = profileContext.toLowerCase();
  if (context.includes("life stage: pregnant")) return "pregnant";
  if (context.includes("life stage: nursing")) return "breastfeeding";
  return "other";
}

function readUserStatus(value: unknown, profileContext = "") {
  return normalizeUserStatus(value) ?? inferUserStatus(profileContext);
}

function normalizeAdviceSource(value: unknown) {
  const source = typeof value === "string" ? value.trim().toLowerCase() : "";
  return source === "mamabot" || source === "rules" ? source : undefined;
}

const BASE_PROMPT = `You are NutriPadi's food vision model for meals from anywhere in the world, with especially strong country-aware coverage for African foods.
Look at the photo and return ONLY a JSON object (no markdown) with this exact shape:

{
  "imageQuality": "good" | "poor",
  "mealName": string,
  "confidence": number,
  "portion": "small" | "normal" | "large",
  "localPortionLabel": string,
  "items": [ { "label": string, "type": string, "confidence": number, "point": { "x": number, "y": number } } ],
  "correctionOptions": [ { "label": string, "type": string } ],
  "nutrition": { "calories": number, "carbs": number, "protein": number, "fat": number, "fibre": number },
  "freshness": { "score": number, "label": string, "tone": "good"|"caution"|"risk", "summary": string, "signals": [string], "storageTip": string },
  "origin": { "country": string, "region": string, "culture": string },
  "advice": string
}

Rules:
- If the image is not food or you cannot tell, set "imageQuality":"poor".
- Detect any visible food plainly. If it is pizza, burger, pasta, sandwich, noodles, salad, fries, sushi, shawarma, biryani, or any non-African meal, name it correctly and do not force it into an African label.
- For African foods, cover all countries, not only Nigeria. Think of North, West, Central, East, and Southern African foods.
- Use the exact local or country name when you can see it clearly, such as injera, doro wat, shiro, tibs, ugali, sukuma wiki, nyama choma, matoke, waakye, banku, kenkey, thieboudienne, attieke, ndole, eru, couscous, tagine, shakshuka, ful medames, sadza, nshima, pap, chakalaka, jollof, egusi, ewedu, amala, eba, fufu, and similar local foods.
- Do not force a Nigerian name on a food from another country or a non-African food. If foods have similar-looking variants, choose a broader name and lower the confidence.
- "type" is only a broad food group for UI grouping, not the food catalogue. Use simple lowercase group words like swallow, soup, protein, egg, rice, beans, yam, potato, plantain, cassava, maize, grain, bread, pasta, vegetable, fruit, dairy, snack, drink, or another broad group if those do not fit. Use "swallow" for eba, fufu, amala, semovita and pounded yam; "yam" for boiled or fried yam; "plantain" for fried or boiled plantain; "potato" for potato, chips and fries.
- "correctionOptions" must be generated from this image and likely local variants. Include 3 to 6 close possible matches when confidence is below 85 or the food has common lookalikes; otherwise return an empty array. Do not use a fixed generic list.
- The "items" array is the per-food breakdown, NOT the overall meal name. Do not put the combined dish name (e.g. "Eba and Edikang Ikong Soup") in items; put each separate food instead.
- List EVERY distinct food as its own item, including each protein you can see individually: fish, meat, chicken, kpomo/ponmo (cow skin), egg, snail, as well as the swallow, the soup or stew, and the rice. For example a plate of eba with edikang ikong soup, fish and kpomo should list eba, edikang ikong, fish and kpomo as separate items.
- Be specific with tubers and fried sides. Fried potato, potato chips or fries must be labelled as potato, not boiled yam. Boiled/fried yam should be yam. Eba, fufu, amala, semo and pounded yam are swallow.
- For every item, set point.x and point.y to where that food sits in the photo, as fractions from 0 to 1 (x: 0 = left edge, 1 = right edge; y: 0 = top, 1 = bottom). Point to the centre of that food on the plate so a marker can be drawn on it.
- Nutrition is for the WHOLE plate shown; use realistic numbers (kcal, grams).
- "origin" tells where the main dish comes from. "country" is the main country or place of origin (use a region name or "Various" when it is eaten widely across places); "region" is the broader area such as West Africa, East Africa, North Africa, Central Africa, Southern Africa, Mediterranean, South Asia or East Asia; "culture" is ONE short, warm, factual sentence on the dish's background or how it is traditionally eaten. Fill these in for any food, African or not. Keep it accurate; if unsure, give the most likely region and keep the culture note general.
- advice: one short, warm, friendly sentence with a practical tip, tailored to the user profile below when one is given. Suggest an affordable local food to add if protein, iron or fibre looks low.
- Keep all text short and plain. Use layman language, not textbook or hospital language.
- When a location or preferred language is given, make every user-facing text sound natural for that country or area. Use familiar local food names and simple everyday wording.
- Reply in the preferred language when one is given; otherwise reply in simple English.`;

function buildPrompt(profileContext: string) {
  if (!profileContext) return BASE_PROMPT;
  return (
    BASE_PROMPT +
    `\n\nUSER PROFILE. Base every user-facing text on this person's language, location, goals, eating habits, health concerns and life stage. Match the country or location in the profile. Use words a lay person there will understand. Only mention pregnancy, a baby, breastfeeding or antenatal care if it clearly says the user is pregnant or nursing; otherwise speak to them as an everyday adult.\n${profileContext}`
  );
}

const STOP_WORDS = new Set([
  "and", "with", "the", "of", "a", "soup", "stew", "rice", "eth", "ken",
  "sauce", "dish", "meal", "plate", "fresh", "local", "food",
]);

function nameTokens(name: string) {
  return new Set(
    name
      .toLowerCase()
      .replace(/[^a-z\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length >= 3 && !STOP_WORDS.has(w))
  );
}

function namesAgree(a: string, b: string) {
  const ta = nameTokens(a);
  const tb = nameTokens(b);
  for (const w of ta) if (tb.has(w)) return true;
  return false;
}

// Cooking-method / descriptor words ignored when deciding if two items are the
// same food, so "Boiled Yam" and "Fried Yam" collapse into one marker.
const COOKING_WORDS = new Set([
  "boiled", "fried", "grilled", "roasted", "steamed", "baked", "smoked",
  "raw", "cooked", "scrambled", "ripe", "unripe", "white", "red", "hot", "cold",
]);

function foodKey(name: string) {
  const tokens = name
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !STOP_WORDS.has(w) && !COOKING_WORDS.has(w));
  return tokens.length ? tokens.sort().join(" ") : name.trim().toLowerCase();
}

function prettify(key: string) {
  return key
    .replace(/^eth_/, "")
    .replace(/^ken_/, "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

function num(value: unknown, fallback: number) {
  const n = typeof value === "string" ? Number(value) : value;
  return typeof n === "number" && Number.isFinite(n) ? n : fallback;
}

function pct(value: unknown, fallback: number) {
  let n = num(value, fallback);
  if (n > 0 && n <= 1) n = n * 100;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function str(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function frac(value: unknown): number | null {
  const n = typeof value === "string" ? Number(value) : value;
  if (typeof n !== "number" || !Number.isFinite(n) || n < 0 || n > 1) return null;
  return Math.max(0.08, Math.min(0.92, n));
}

function readPoint(raw: unknown): { x: number; y: number } | null {
  const p = (raw as { point?: { x?: unknown; y?: unknown } })?.point;
  if (!p) return null;
  const x = frac(p.x);
  const y = frac(p.y);
  return x === null || y === null ? null : { x, y };
}

function normalizeType(value: unknown) {
  const t = typeof value === "string" ? value.toLowerCase().trim() : "";
  const normalized = t.replace(/[^a-z0-9\s_-]/g, "").replace(/\s+/g, "_");
  return normalized || "unknown";
}

function readCorrectionOptions(value: unknown) {
  const raw = Array.isArray(value) ? value : [];
  const options: { label: string; type?: string }[] = [];
  const seen = new Set<string>();

  for (const item of raw) {
    const label =
      typeof item === "string" ? str(item, "") : str((item as any)?.label, "");
    if (!label) continue;
    const key = label.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    const type =
      typeof item === "string" ? undefined : normalizeType((item as any)?.type);
    options.push({ label, ...(type && type !== "unknown" ? { type } : {}) });
    if (options.length >= 8) break;
  }

  return options;
}

function normalizeTone(value: unknown) {
  const t = typeof value === "string" ? value.toLowerCase().trim() : "";
  return ["good", "caution", "risk"].includes(t) ? t : "good";
}

function readOrigin(value: unknown) {
  const o = (value ?? {}) as Record<string, unknown>;
  const country = str(o.country, "");
  const region = str(o.region, "");
  const culture = str(o.culture, "");
  if (!country && !region && !culture) return undefined;
  return { country, region, culture };
}

async function toBase64(file: File) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function base64ToBytes(b64: string) {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function readUpload(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const body = await request.json().catch(() => ({}));
    const image = typeof body.image === "string" ? body.image : "";
    const profileContext =
      typeof body.profileContext === "string" ? body.profileContext.trim() : "";
    const userStatus = readUserStatus(body.user_status ?? body.userStatus, profileContext);
    if (!image) return { file: null, base64: "", profileContext, userStatus };
    const mimeType = typeof body.mimeType === "string" ? body.mimeType : "image/jpeg";
    const fileName = typeof body.fileName === "string" ? body.fileName : "meal.jpg";
    const file = new File([base64ToBytes(image)], fileName, { type: mimeType });
    return { file, base64: image, profileContext, userStatus };
  }
  const form = await request.formData();
  const f = form.get("file");
  const file = f instanceof File ? f : null;
  return {
    file,
    base64: file ? await toBase64(file) : "",
    profileContext: "",
    userStatus: readUserStatus(form.get("user_status")),
  };
}

async function classifyWithBestPt(
  file: File,
  authHeader: string | null,
  userStatus: string
) {
  if (!authHeader) return null;
  try {
    const form = new FormData();
    form.append("file", file, file.name || "meal.jpg");
    form.append("lang", "en");
    form.append("user_status", readUserStatus(userStatus));
    const res = await fetch(`${API_URL}/scan`, {
      method: "POST",
      headers: { Authorization: authHeader },
      body: form,
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const top = data?.foods?.[0];
    if (!top?.key) return null;
    return {
      key: String(top.key),
      name: str(top.name, prettify(String(top.key))),
      confidence: typeof top.confidence === "number" ? top.confidence : null,
      advice: str(data?.advice, ""),
      adviceSource: normalizeAdviceSource(data?.advice_source),
    };
  } catch {
    return null;
  }
}

const POOR_RESULT = {
  imageQuality: "poor",
  summary: null,
  suggestions: [
    "Move closer and fill the frame with the food.",
    "Use good lighting and hold the phone steady.",
  ],
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const apiKey =
      Deno.env.get("GEMINI_API_KEY") ?? Deno.env.get("GOOGLE_API_KEY");
    if (!apiKey) throw new Error("GEMINI_API_KEY is not configured.");

    const model =
      Deno.env.get("GEMINI_VISION_MODEL") ||
      Deno.env.get("GEMINI_MODEL") ||
      "gemini-3.5-flash";

    const { file, base64, profileContext, userStatus } = await readUpload(request);
    if (!file) {
      return Response.json(POOR_RESULT, { headers: corsHeaders });
    }

    const authHeader = request.headers.get("Authorization");

    const geminiPromise = fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                { inline_data: { mime_type: file.type || "image/jpeg", data: base64 } },
                { text: buildPrompt(profileContext) },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 1100,
            responseMimeType: "application/json",
          },
        }),
      }
    ).then(async (response) => ({
      ok: response.ok,
      status: response.status,
      data: await response.json(),
    }));

    const [bestPt, gemini] = await Promise.all([
      classifyWithBestPt(file, authHeader, userStatus),
      geminiPromise,
    ]);

    const data = gemini.data;
    if (!gemini.ok && !bestPt) {
      const detail = data?.error?.message ?? "The vision service returned an error.";
      return Response.json(
        { message: detail },
        { headers: corsHeaders, status: gemini.status }
      );
    }

    const raw = data?.candidates?.[0]?.content?.parts
      ?.map((part: { text?: string }) => part?.text ?? "")
      .join("")
      .trim();

    let parsed: Record<string, unknown> = {};
    try {
      parsed = JSON.parse(raw ?? "{}");
    } catch {
      parsed = {};
    }

    const geminiPoor = parsed.imageQuality === "poor" || !parsed.mealName;
    if (geminiPoor && !bestPt) {
      return Response.json(POOR_RESULT, { headers: corsHeaders });
    }

    const geminiName = str(parsed.mealName, "");
    const geminiConfidence = pct(parsed.confidence, 70);
    const bestPtConfident = !!bestPt && (bestPt.confidence ?? 0) >= 60;

    let mealName: string;
    let confidence: number;

    if (bestPt && geminiName && namesAgree(bestPt.name, geminiName)) {
      mealName = bestPt.name;
      confidence = Math.max(Math.round(bestPt.confidence ?? geminiConfidence), 85);
    } else if (bestPtConfident && !geminiName) {
      mealName = bestPt!.name;
      confidence = Math.round(bestPt!.confidence ?? 75);
    } else if (bestPt && geminiName) {
      mealName = bestPtConfident ? bestPt.name : geminiName;
      confidence = Math.min(
        Math.round(Math.max(bestPt.confidence ?? 0, geminiConfidence)),
        70
      );
    } else if (bestPt) {
      mealName = bestPt.name;
      confidence = Math.round(bestPt.confidence ?? 70);
    } else {
      mealName = geminiName || "Detected meal";
      confidence = Math.round(geminiConfidence);
    }

    // Merge items that are the same food (ignoring cooking method) so the same
    // dish is not tagged twice. Keep the most confident label/type per food.
    const rawItems = Array.isArray(parsed.items) ? parsed.items : [];
    const byKey = new Map<string, any>();
    for (const item of rawItems) {
      const label = str((item as any)?.label, "");
      if (!label) continue;
      const candidate = {
        label,
        type: normalizeType((item as any)?.type),
        confidence: pct((item as any)?.confidence, 70),
        point: readPoint(item),
      };
      const key = foodKey(label);
      const existing = byKey.get(key);
      if (!existing) {
        byKey.set(key, candidate);
      } else if (candidate.confidence > existing.confidence) {
        byKey.set(key, { ...candidate, point: candidate.point ?? existing.point });
      } else if (!existing.point && candidate.point) {
        existing.point = candidate.point;
      }
    }
    const items: any[] = Array.from(byKey.values());
    if (items.length === 0) {
      items.push({
        label: mealName,
        type: bestPt && mealName === bestPt.name ? normalizeType(bestPt.key) : "unknown",
        confidence,
        point: null,
      });
    }

    const detectedItems = items.slice(0, 6).map((item, idx) => {
      const point = item.point ?? {
        x: 0.26 + (idx % 2) * 0.46,
        y: 0.3 + Math.floor(idx / 2) * 0.2,
      };
      return {
        id: crypto.randomUUID(),
        label: item.label,
        type: item.type,
        confidence: item.confidence,
        x: point.x,
        y: point.y,
      };
    });

    const n = (parsed.nutrition ?? {}) as Record<string, unknown>;
    const f = (parsed.freshness ?? {}) as Record<string, unknown>;
    const backendAdvice = str(bestPt?.advice, "");
    const localAdvice = str(parsed.advice, "");
    const correctionOptions = readCorrectionOptions(parsed.correctionOptions);
    const origin = readOrigin(parsed.origin);

    const result = {
      advice_source: bestPt?.adviceSource,
      imageQuality: "good",
      summary: {
        mealName,
        confidence,
        portion: ["small", "normal", "large"].includes(parsed.portion as string)
          ? parsed.portion
          : "normal",
        localPortionLabel: str(parsed.localPortionLabel, "1 normal portion"),
        detectedItems,
        correctionOptions,
        origin,
        nutrition: {
          calories: Math.round(num(n.calories, 0)),
          carbs: Math.round(num(n.carbs, 0)),
          protein: Math.round(num(n.protein, 0)),
          fat: Math.round(num(n.fat, 0)),
          fibre: Math.round(num(n.fibre, 0)),
          sourceLabel: "Estimated from your photo",
          disclaimer:
            "Estimated from your photo. Actual values vary with portion and recipe.",
        },
        freshness: {
          score: Math.round(num(f.score, 75)),
          label: str(f.label, "Looks okay"),
          tone: normalizeTone(f.tone),
          summary: str(f.summary, "No clear spoilage signs in the photo."),
          signals: Array.isArray(f.signals)
            ? f.signals.filter((s: unknown) => typeof s === "string").slice(0, 5)
            : [],
          storageTip: str(f.storageTip, "Refrigerate leftovers within 2 hours."),
          disclaimer:
            "Freshness is a visual guess. When in doubt, do not eat it.",
        },
        advice: localAdvice || backendAdvice || "Looks like a balanced plate. Keep it up!",
      },
      user_status: userStatus,
    };

    return Response.json(result, { headers: corsHeaders });
  } catch (error) {
    return Response.json(
      { message: error instanceof Error ? error.message : "Detection failed." },
      { headers: corsHeaders, status: 500 }
    );
  }
});
