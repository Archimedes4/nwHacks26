import { createContext, useEffect } from 'react';
import { Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import 'react-native-reanimated';
import Header from '../components/Header';
import '../app.css';
import { Colors, DEFAULT_FONT } from '../types';

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Pacifico: require('../assets/fonts/Pacifico/Pacifico-Regular.ttf'),
    Playpen: require("../assets/fonts/Playpen_Sans/PlaypenSans-VariableFont_wght.ttf"),
    FacultyGlyphic: require('../assets/fonts/Faculty_Glyphic/FacultyGlyphic-Regular.ttf')
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  const TextStyleContext = createContext({fontFamily: DEFAULT_FONT});

  return (
    <TextStyleContext.Provider value={{fontFamily: DEFAULT_FONT}}>
        <Header />
        <Slot />
    </TextStyleContext.Provider>
  );
}
