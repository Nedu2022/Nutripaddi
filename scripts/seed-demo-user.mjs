// Creates (or refreshes) a ready-to-use demo account for testing NutriPadi on a
// simulator — no email confirmation needed — and pre-loads a profile + meals so
// every screen has data.
//
// 1. Add your SERVICE ROLE key to .env (Dashboard → Project Settings → API →
//    "service_role" secret). It is server-side only and is gitignored:
//        SUPABASE_SERVICE_ROLE_KEY=eyJ...
// 2. Run:  node scripts/seed-demo-user.mjs
//
// Then log in with the credentials it prints.

import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

// --- tiny .env loader (no extra dependency) ---------------------------------
function loadEnv(path) {
  try {
    for (const line of readFileSync(path, "utf8").split("\n")) {
      const match = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!match) continue;
      const key = match[1];
      const value = match[2].replace(/^["']|["']$/g, "").trim();
      if (!(key in process.env)) process.env[key] = value;
    }
  } catch {
    /* no .env — rely on real env vars */
  }
}
loadEnv(new URL("../.env", import.meta.url).pathname);

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "\n✗ Missing config.\n" +
      "  EXPO_PUBLIC_SUPABASE_URL: " + (SUPABASE_URL ? "ok" : "MISSING") + "\n" +
      "  SUPABASE_SERVICE_ROLE_KEY: " + (SERVICE_ROLE_KEY ? "ok" : "MISSING") + "\n\n" +
      "  Add the service_role key to .env (Dashboard → Project Settings → API).\n"
  );
  process.exit(1);
}

const DEMO = {
  email: "demo@nutripadi.app",
  password: "Demo12345!",
  fullName: "Demo Mama",
};

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function ensureUser() {
  const { data, error } = await admin.auth.admin.createUser({
    email: DEMO.email,
    password: DEMO.password,
    email_confirm: true,
    user_metadata: { fullName: DEMO.fullName, name: DEMO.fullName },
  });

  if (!error) return data.user.id;

  if (/already|registered|exists/i.test(error.message)) {
    const { data: list } = await admin.auth.admin.listUsers();
    const existing = list.users.find((u) => u.email === DEMO.email);
    if (!existing) throw error;
    await admin.auth.admin.updateUserById(existing.id, {
      password: DEMO.password,
      email_confirm: true,
    });
    return existing.id;
  }

  throw error;
}

async function seedProfile(userId) {
  const { error } = await admin.from("profiles").upsert(
    {
      id: userId,
      email: DEMO.email,
      full_name: DEMO.fullName,
      nickname: "Demo",
      age: 29,
      gender: "Female",
      weight: 68,
      height: 165,
      nutrition_goal: "Eat healthier",
      eating_lifestyle: "I eat swallow often, I eat rice often",
      health_awareness: "General wellness",
      language: "english",
      ai_tone: "gentle",
      life_stage: "nursing",
      trimester: null,
      baby_age_months: 6,
      daily_calorie_target: 2700,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );
  if (error) throw error;
}

async function seedMeals(userId) {
  // Start fresh so re-runs don't pile up duplicates.
  await admin.from("meals").delete().eq("user_id", userId);

  const now = Date.now();
  const hoursAgo = (h) => new Date(now - h * 3600_000).toISOString();
  const meals = [
    {
      food_name: "Akara & Pap", meal_name: "Akara & Pap", meal_type: "Breakfast",
      calories: 380, carbs: 48, protein: 14, fat: 14, fibre: 6,
      icon_name: "Utensils", source: "demo", ai_observation: "Good plant protein from beans — add an egg for more iron.",
      logged_at: hoursAgo(6),
    },
    {
      food_name: "Jollof Rice & Chicken", meal_name: "Jollof Rice & Chicken", meal_type: "Lunch",
      calories: 720, carbs: 92, protein: 34, fat: 22, fibre: 4,
      icon_name: "Utensils", source: "demo", ai_observation: "Balanced plate. A side of ugu (greens) would lift your folate.",
      logged_at: hoursAgo(28),
    },
    {
      food_name: "Eba & Ewedu with Fish", meal_name: "Eba & Ewedu with Fish", meal_type: "Dinner",
      calories: 540, carbs: 70, protein: 28, fat: 12, fibre: 8,
      icon_name: "Utensils", source: "demo", ai_observation: "Ewedu is rich in iron and folate — great choice while nursing.",
      logged_at: hoursAgo(30),
    },
  ];

  const { error } = await admin
    .from("meals")
    .insert(meals.map((m) => ({ ...m, user_id: userId })));
  if (error) throw error;
}

try {
  console.log("→ Creating/refreshing demo user…");
  const userId = await ensureUser();
  console.log("→ Seeding profile (nursing mother)…");
  await seedProfile(userId);
  console.log("→ Seeding sample meals…");
  await seedMeals(userId);

  console.log(
    "\n✓ Demo account ready. Log in with:\n" +
      `   Email:    ${DEMO.email}\n` +
      `   Password: ${DEMO.password}\n`
  );
} catch (error) {
  console.error("\n✗ Failed:", error.message ?? error);
  process.exit(1);
}
