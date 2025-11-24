import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Enhanced logging for production debugging
if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase environment variables');
    console.error('VITE_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
    console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Set' : '❌ Missing');
    console.error('Environment Mode:', import.meta.env.MODE);
    console.error('All env vars:', Object.keys(import.meta.env));
} else {
    console.log('🔧 Supabase Configuration:');
    console.log('  URL:', supabaseUrl.substring(0, 30) + '...');
    console.log('  Key Present:', !!supabaseAnonKey);
    console.log('  Environment:', import.meta.env.MODE);
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
