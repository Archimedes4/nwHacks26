import 'expo-sqlite/localStorage/install';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Platform } from 'react-native';

const supabaseUrl = "https://yqnwqmihdkikekkfprzu.supabase.co";
const supabasePublishableKey = "sb_publishable_UTRAONilYfDP_0Lay1RvDQ_uospmxsd";

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    storage: Platform.OS === "ios" ? AsyncStorage:undefined,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
