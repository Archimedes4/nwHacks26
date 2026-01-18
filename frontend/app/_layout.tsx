import { createContext, useEffect } from 'react';
import { Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { View } from 'react-native'; // Added View for layout stability
import 'react-native-reanimated';
import Header from '../components/Header';
import '../app.css';
import { Colors, DEFAULT_FONT } from '../types';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export const TextStyleContext = createContext({ fontFamily: DEFAULT_FONT });

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'Pacifico': require('../assets/fonts/Pacifico/Pacifico-Regular.ttf'),
    'Playpen': require("../assets/fonts/Playpen_Sans/PlaypenSans-VariableFont_wght.ttf"),
    // Ensure this string matches EXACTLY what DEFAULT_FONT is set to in types.ts
    'FacultyGlyphic': require('../assets/fonts/Faculty_Glyphic/FacultyGlyphic-Regular.ttf')
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <TextStyleContext.Provider value={{ fontFamily: DEFAULT_FONT }}>
      {/* Wrap in a View with background to prevent "flash of white" during navigation */}
      <View style={{ flex: 1, backgroundColor: Colors.primary }}>
        <Header />
        <Slot />
      </View>
    </TextStyleContext.Provider>
  );
}