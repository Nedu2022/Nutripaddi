// @ts-nocheck

const corsHeaders = {
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Origin": "*",
};

const API_URL =
  Deno.env.get("FOODSCAN_API_URL") || "https://nnedu-foodscan-backend.hf.space";

const FOOD_TYPES = [
  "swallow",
  "soup",
  "protein",
  "rice",
  "beans",
  "yam",
  "plantain",
  "unknown",
];

const BASE_PROMPT = `You are NutriPadi's food vision model for Nigerian and West/East African meals.
Look at the photo and return ONLY a JSON object (no markdown) with this exact shape:

{
  "imageQuality": "good" | "poor",
  "mealName": string,
  "confidence": number,
  "portion": "small" | "normal" | "large",
  "localPortionLabel": string,
  "items": [ { "label": string, "type": "swallow"|"soup"|"protein"|"rice"|"beans"|"yam"|"plantain"|"unknown", "confidence": number, "point": { "x": number, "y": number } } ],
  "nutrition": { "calories": number, "carbs": number, "protein": number, "fat": number, "fibre": number },
  "freshness": { "score": number, "label": string, "tone": "good"|"caution"|"risk", "summary": string, "signals": [string], "storageTip": string },
  "advice": string
}

Rules:
- If the image is not food or you cannot tell, set "imageQuality":"poor".
- List EACH distinct food you can see as a separate item (e.g. the swallow, the soup, the meat, the rice), not just the overall dish.
- For every item, set point.x and point.y to where that food sits in the photo, as fractions from 0 to 1 (x: 0 = left edge, 1 = right edge; y: 0 = top, 1 = bottom). Point to the centre of that food on the plate so a marker can be drawn on it.
- Nutrition is for the WHOLE plate shown; use realistic numbers (kcal, grams).
- advice: one short, warm, friendly sentence with a practical tip, tailored to the user profile below when one is given. Suggest an affordable local food to add if protein, iron or fibre looks low.
- Keep all text short and plain. Reply in English.`;

function buildPrompt(profileContext: string) {
  if (!profileContext) return BASE_PROMPT;
  return (
    BASE_PROMPT +
    `\n\nUSER PROFILE. Base the single advice sentence strictly on this person's goals, eating habits, health concerns and life stage. Only mention pregnancy, a baby, breastfeeding or antenatal care if it clearly says the user is pregnant or nursing; otherwise speak to them as an everyday adult.\n${profileContext}`
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

function prettify(key: string) {
  return key
    .replace(/^eth_/, "")
    .replace(/^ken_/, "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

function inferType(key: string) {
  const k = key.toLowerCase();
  if (/(soup|wat|ewedu|gbegiri|ndole|\beru\b|ogbono|okro|egusi|pepper|stew|shiro|ofeowerri)/.test(k)) return "soup";
  if (/(rice|jollof|waakye|pilau|pilau|nyama)/.test(k)) return "rice";
  if (/(plantain|dodo|boli|bole|matoke)/.test(k)) return "plantain";
  if (/(beans|ewa|moin|akara|githeri)/.test(k)) return "beans";
  if (/(yam|amala|asaro|fufu|eba|ugali|mukimo|semo|pounded|genfo)/.test(k)) return "swallow";
  if (/(suya|tibs|kitfo|siga|nyamachoma|kukuchoma|chicken|beef|fish|egg|doro|meat|kikil)/.test(k)) return "protein";
  return "unknown";
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
  return FOOD_TYPES.includes(t) ? t : "unknown";
}

function normalizeTone(value: unknown) {
  const t = typeof value === "string" ? value.toLowerCase().trim() : "";
  return ["good", "caution", "risk"].includes(t) ? t : "good";
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
    if (!image) return { file: null, base64: "", profileContext };
    const mimeType = typeof body.mimeType === "string" ? body.mimeType : "image/jpeg";
    const fileName = typeof body.fileName === "string" ? body.fileName : "meal.jpg";
    const file = new File([base64ToBytes(image)], fileName, { type: mimeType });
    return { file, base64: image, profileContext };
  }
  const form = await request.formData();
  const f = form.get("file");
  const file = f instanceof File ? f : null;
  return { file, base64: file ? await toBase64(file) : "", profileContext: "" };
}

async function classifyWithBestPt(file: File, authHeader: string | null) {
  if (!authHeader) return null;
  try {
    const form = new FormData();
    form.append("file", file, file.name || "meal.jpg");
    form.append("lang", "en");
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
      "gemini-3.1-flash-lite";

    const { file, base64, profileContext } = await readUpload(request);
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
            maxOutputTokens: 700,
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
      classifyWithBestPt(file, authHeader),
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

    const rawItems = Array.isArray(parsed.items) ? parsed.items : [];
    const items: any[] = [];
    items.push({
      label: mealName,
      type: bestPt && mealName === bestPt.name ? inferType(bestPt.key) : "unknown",
      confidence,
      point: readPoint(
        rawItems.find((it: unknown) => namesAgree(str((it as any)?.label, ""), mealName))
      ),
    });
    for (const item of rawItems) {
      const label = str((item as any)?.label, "");
      if (!label) continue;
      if (label.toLowerCase() === mealName.toLowerCase()) continue;
      items.push({
        label,
        type: normalizeType((item as any)?.type),
        confidence: pct((item as any)?.confidence, 70),
        point: readPoint(item),
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

    const result = {
      imageQuality: "good",
      summary: {
        mealName,
        confidence,
        portion: ["small", "normal", "large"].includes(parsed.portion as string)
          ? parsed.portion
          : "normal",
        localPortionLabel: str(parsed.localPortionLabel, "1 normal portion"),
        detectedItems,
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
        advice: str(parsed.advice, "Looks like a balanced plate. Keep it up!"),
      },
    };

    return Response.json(result, { headers: corsHeaders });
  } catch (error) {
    return Response.json(
      { message: error instanceof Error ? error.message : "Detection failed." },
      { headers: corsHeaders, status: 500 }
    );
  }
});
