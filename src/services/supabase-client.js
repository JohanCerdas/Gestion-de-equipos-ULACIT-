import { createClient } from '@supabase/supabase-js';

/** Reserved for the production adapter. The demo never impersonates real authentication. */
export function getSupabaseClient() {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error('Configura las variables públicas de Supabase en .env.local.');
  return createClient(url, key);
}
