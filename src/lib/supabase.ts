import { createClient } from '@supabase/supabase-js';

export const createSupabaseClient = (url: string, key: string) => {
  return createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    },
    db: {
      schema: 'public'
    }
  });
};

let supabaseInstance: ReturnType<typeof createClient> | null = null;

export const supabase = () => {
  const url = localStorage.getItem('supabaseUrl');
  const key = localStorage.getItem('supabaseAnonKey');

  if (!url || !key) {
    throw new Error('Credenciais do Supabase não encontradas');
  }

  if (!supabaseInstance) {
    supabaseInstance = createSupabaseClient(url, key);
  }

  return supabaseInstance;
};

export const initializeSupabase = (url: string, key: string) => {
  supabaseInstance = createSupabaseClient(url, key);
  return supabaseInstance;
}; 