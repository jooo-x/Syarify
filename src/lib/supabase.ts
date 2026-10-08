import { createClient } from '@supabase/supabase-js';

// Menggunakan nilai tiruan (mock) agar GitHub Pages tidak error putih polos
const supabaseUrl = 'https://supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
