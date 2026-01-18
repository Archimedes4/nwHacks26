import 'expo-sqlite/localStorage/install';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://yqnwqmihdkikekkfprzu.supabase.co";
const supabaseAnonKey = "sb_publishable_UTRAONilYfDP_0Lay1RvDQ_uospmxsd";
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const submitJsonData = async (formData: any) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Explicitly matching the camelCase names from your table settings
    const { data, error } = await supabase
      .from('user_data')
      .insert([
        {
          userId: user?.id || null,           // Matches image_4374a0.png
          gender: formData.gender,
          age: parseInt(formData.age),
          sleepDuration: parseFloat(formData.sleepDuration),
          activityMinutes: parseInt(formData.physicalActivity),
          heightCm: parseInt(formData.height),
          weightKg: parseInt(formData.weight),
          restingHeartrate: formData.restingHeartrate ? parseInt(formData.restingHeartrate) : null,
          dailySteps: formData.dailySteps ? parseInt(formData.dailySteps) : null,
          stressLevel: formData.stressLevel ? parseInt(formData.stressLevel) : null,
        },
      ])
      .select();

    if (error) {
      console.error("Supabase Error:", error.message);
      return { error };
    }

    return { data };
  } catch (err) {
    // Catches 'Failed to fetch' network/CORS errors
    console.error("Connection Error:", err);
    return { error: { message: "Network error. Please check CORS settings in Supabase." } };
  }
};