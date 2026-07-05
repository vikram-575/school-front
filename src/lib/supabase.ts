import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rygtyzwkhcuiwxzqmmlo.supabase.co';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_6OJmArhZRC4HcHd_IBFbmw_7hpaYGHO';
  
  return createBrowserClient(supabaseUrl, supabaseKey);
}
