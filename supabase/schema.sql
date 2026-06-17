create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  nickname text,
  avatar_url text,
  age int,
  gender text,
  weight numeric,
  height numeric,
  nutrition_goal text,
  eating_lifestyle text,
  health_awareness text,
  language text,
  ai_tone text,
  life_stage text default 'general',
  trimester text,
  baby_age_months int,
  daily_calorie_target int default 2200,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Maternal / life-stage columns (idempotent for existing databases)
alter table public.profiles add column if not exists gender text;
alter table public.profiles add column if not exists life_stage text default 'general';
alter table public.profiles add column if not exists trimester text;
alter table public.profiles add column if not exists baby_age_months int;

create table if not exists public.meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  food_id text,
  food_name text not null,
  meal_name text not null,
  meal_type text not null check (meal_type in ('Breakfast', 'Lunch', 'Dinner', 'Snack')),
  calories int not null default 0,
  carbs numeric not null default 0,
  protein numeric not null default 0,
  fat numeric not null default 0,
  fibre numeric,
  freshness_score numeric,
  freshness_label text,
  portion_size text,
  portion_label text,
  confidence numeric,
  source text,
  icon_name text,
  image_url text,
  ai_observation text,
  logged_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.dataset_contributions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  food_name text not null,
  category text,
  note text,
  image_url text not null,
  image_public_id text,
  consent boolean not null default false,
  status text not null default 'submitted',
  created_at timestamptz not null default now()
);

create table if not exists public.food_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  sort_order int default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.meal_suggestions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  category text not null,
  icon_name text default 'Utensils',
  created_at timestamptz not null default now()
);

create table if not exists public.nutrition_tips (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  category text not null,
  icon_name text default 'Leaf',
  created_at timestamptz not null default now()
);

create table if not exists public.learn_sections (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  icon_name text default 'BookOpen',
  tip_count int default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.research_metrics (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  value text not null,
  note text not null,
  sort_order int default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.feedback_questions (
  id text primary key,
  text text not null,
  sort_order int default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.feedback_options (
  id uuid primary key default gen_random_uuid(),
  label text not null unique,
  sort_order int default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.study_feedback_responses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  answers jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.quick_questions (
  id text primary key,
  text text not null,
  sort_order int default 0,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.meals enable row level security;
alter table public.dataset_contributions enable row level security;
alter table public.study_feedback_responses enable row level security;
alter table public.food_categories enable row level security;
alter table public.meal_suggestions enable row level security;
alter table public.nutrition_tips enable row level security;
alter table public.learn_sections enable row level security;
alter table public.research_metrics enable row level security;
alter table public.feedback_questions enable row level security;
alter table public.feedback_options enable row level security;
alter table public.quick_questions enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile" on public.profiles for select using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "Users can delete own profile" on public.profiles;
create policy "Users can delete own profile" on public.profiles for delete using (auth.uid() = id);

drop policy if exists "Users can read own meals" on public.meals;
create policy "Users can read own meals" on public.meals for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own meals" on public.meals;
create policy "Users can insert own meals" on public.meals for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own meals" on public.meals;
create policy "Users can update own meals" on public.meals for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users can delete own meals" on public.meals;
create policy "Users can delete own meals" on public.meals for delete using (auth.uid() = user_id);

drop policy if exists "Users can create own dataset contributions" on public.dataset_contributions;
create policy "Users can create own dataset contributions" on public.dataset_contributions for insert with check (auth.uid() = user_id);

drop policy if exists "Users can read own dataset contributions" on public.dataset_contributions;
create policy "Users can read own dataset contributions" on public.dataset_contributions for select using (auth.uid() = user_id);

drop policy if exists "Users can create own feedback responses" on public.study_feedback_responses;
create policy "Users can create own feedback responses" on public.study_feedback_responses for insert with check (auth.uid() = user_id);

drop policy if exists "Public can read food categories" on public.food_categories;
create policy "Public can read food categories" on public.food_categories for select using (true);

drop policy if exists "Public can read meal suggestions" on public.meal_suggestions;
create policy "Public can read meal suggestions" on public.meal_suggestions for select using (true);

drop policy if exists "Public can read nutrition tips" on public.nutrition_tips;
create policy "Public can read nutrition tips" on public.nutrition_tips for select using (true);

drop policy if exists "Public can read learn sections" on public.learn_sections;
create policy "Public can read learn sections" on public.learn_sections for select using (true);

drop policy if exists "Public can read research metrics" on public.research_metrics;
create policy "Public can read research metrics" on public.research_metrics for select using (true);

drop policy if exists "Public can read feedback questions" on public.feedback_questions;
create policy "Public can read feedback questions" on public.feedback_questions for select using (true);

drop policy if exists "Public can read feedback options" on public.feedback_options;
create policy "Public can read feedback options" on public.feedback_options for select using (true);

drop policy if exists "Public can read quick questions" on public.quick_questions;
create policy "Public can read quick questions" on public.quick_questions for select using (true);
