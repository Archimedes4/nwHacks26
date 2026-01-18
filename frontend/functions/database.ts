import 'expo-sqlite/localStorage/install';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://yqnwqmihdkikekkfprzu.supabase.co";
const supabaseAnonKey = "sb_publishable_UTRAONilYfDP_0Lay1RvDQ_uospmxsd";
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const submitJsonData = async (jsonObject: any) => {
  const { data, error } = await supabase
    .from('user_data')
    .insert([{ content: jsonObject }]);

  if (error) {
    console.error('Error:', error);
    throw error; // Throw so the component can catch it
  }
  
  return data;
};