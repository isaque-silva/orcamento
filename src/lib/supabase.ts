import { createClient } from '@supabase/supabase-js';

let supabaseInstance: ReturnType<typeof createClient> | null = null;

export const supabase = () => {
  if (supabaseInstance) return supabaseInstance;

  const supabaseUrl = localStorage.getItem('supabaseUrl');
  const supabaseKey = localStorage.getItem('supabaseAnonKey');

  console.log('Tentando criar cliente Supabase com:', {
    supabaseUrl,
    supabaseKeyExists: !!supabaseKey
  });

  if (!supabaseUrl || !supabaseKey) {
    console.error('Configurações do Supabase não encontradas no localStorage');
    window.location.href = '/configuracoes';
    throw new Error('Configurações do Supabase não encontradas. Redirecionando para a página de configurações...');
  }

  try {
    supabaseInstance = createClient(supabaseUrl, supabaseKey);
    console.log('Cliente Supabase criado com sucesso');
    return supabaseInstance;
  } catch (error) {
    console.error('Erro ao criar cliente Supabase:', error);
    throw error;
  }
}; 