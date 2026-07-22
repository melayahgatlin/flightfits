/*
  Supabase is intentionally not initialized yet.

  When you are ready:
  1. Install: npm install @supabase/supabase-js
  2. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to .env
  3. Replace this file with createClient(...)

  Keeping this as a safe placeholder lets the starter app run without keys.
*/

export const supabaseConfigured = Boolean(
  process.env.EXPO_PUBLIC_SUPABASE_URL &&
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);
