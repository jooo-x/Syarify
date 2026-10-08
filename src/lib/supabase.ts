import { createClient } from '@supabase/supabase-js';

// Memasukkan URL dan Anon Key langsung agar tidak bergantung pada GitHub Secrets
const supabaseUrl = 'rthmihcwzamsbqvwoiox';
const supabaseAnonKey = 'sb_publishable_V5gvTFWNo1vESEr65hnTqw_QoXLIqve';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
