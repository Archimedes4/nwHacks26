import 'expo-sqlite/localStorage/install';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://yqnwqmihdkikekkfprzu.supabase.co";
const supabasePublishableKey = "sb_publishable_UTRAONilYfDP_0Lay1RvDQ_uospmxsd";

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
