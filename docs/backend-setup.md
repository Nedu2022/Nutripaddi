# NutriPaddi Supabase Setup

The app now uses Supabase for authentication and data, plus Cloudinary through Supabase Edge Functions for image uploads.

## Mobile Env

Create `.env` from `.env.example`:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_KEY=your-supabase-anon-or-publishable-key
```

Restart Expo after changing env values.

## Supabase Auth

Enable email/password auth in Supabase Auth. For password reset links, add this allowed redirect URL:

```text
nutripaddi://*
```

## Cloudinary Secrets

Keep these in Supabase Edge Function secrets, not in Expo:

```bash
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

## AI Coach Secrets

Keep the Google AI Studio key in Supabase secrets too:

```bash
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-2.5-flash-lite
```

## Edge Functions Expected By The App

```text
upload-image
- multipart body: file, folder
- uploads to Cloudinary
- returns { image: { url, secureUrl, publicId, width, height } }

detect-food
- multipart body: file
- returns { imageQuality: "good" | "poor", summary }

ai-coach
- json body: { message, history }
- returns { reply }
```

## SQL Setup

Run these files in the Supabase SQL editor:

```text
supabase/schema.sql
supabase/seed.sql
```

`schema.sql` creates the tables and RLS policies. `seed.sql` puts starter content into Supabase so the app reads categories, prompts, lessons, and research content from the database instead of local arrays.

## Deploy Upload Function

From a Supabase CLI-enabled environment:

```bash
supabase secrets set CLOUDINARY_CLOUD_NAME=...
supabase secrets set CLOUDINARY_API_KEY=...
supabase secrets set CLOUDINARY_API_SECRET=...
supabase functions deploy upload-image
```
