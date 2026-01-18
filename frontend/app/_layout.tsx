import React, { createContext, useEffect, useState } from 'react';
import { router, Slot, usePathname } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { useWindowDimensions, View } from 'react-native'; // Added View for layout stability
import 'react-native-reanimated';
import Header from '../components/Header';
import '../app.css';
import { Colors, DEFAULT_FONT } from '../types';
import Head from "expo-router/head"
import useAuth from '@/hooks/useAuth';
import LiquidGlassTabBar from '@/components/LiquidGlass';
import { AdviceIcon, HomeIcon, PersonIcon, SleepIcon } from '@/components/Icons';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export const TextStyleContext = createContext({ fontFamily: DEFAULT_FONT });

export default function RootLayout() {
  const [activeTab, setActiveTab] = useState(0);
  const pathname = usePathname();
  const {session, loading} = useAuth();
  const {width} = useWindowDimensions();
  const [fontsLoaded, fontError] = useFonts({
    'Pacifico': require('../assets/fonts/Pacifico/Pacifico-Regular.ttf'),
    'Playpen': require("../assets/fonts/Playpen_Sans/PlaypenSans-VariableFont_wght.ttf"),
    // Ensure this string matches EXACTLY what DEFAULT_FONT is set to in types.ts
    'FacultyGlyphic': require('../assets/fonts/Faculty_Glyphic/FacultyGlyphic-Regular.ttf')
  });

  function call() {
    if (activeTab === 0 && pathname !== "/") {
      router.push("/")
    } else if (activeTab === 1 && pathname !== "/history") {
      router.push("/history")
    } else if (activeTab === 2 && pathname !== "suggestions") {
      router.push("/suggestions")
    } else if (activeTab === 3 && pathname !== "/account") {
      router.push("/account")
    }
  }

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Somnia</title>
      </Head>
      <TextStyleContext.Provider value={{ fontFamily: DEFAULT_FONT }}>
        {/* Wrap in a View with background to prevent "flash of white" during navigation */}
        <View style={{ flex: 1, backgroundColor: Colors.primary }}>
          <Header />
          <Slot />
          {session && !loading && (width < 700) &&
            <LiquidGlassTabBar
              tabs={[
              {
                key: "home",
                label: "Home",
                icon: <HomeIcon width={25} height={25} color={Colors.light}/>,
              },
              {
                key: "advice",
                label: "Advice",
                icon: <AdviceIcon width={25} height={25} color={Colors.light}/>,
              },
              {
                key: "sleep",
                label: "Sleep",
                icon: <SleepIcon width={25} height={25} color={Colors.light}/>,
              },
              {
                key: "profile",
                label: "Profile",
                icon: <PersonIcon width={25} height={25} color={Colors.light}/>,
              },
            ]}
            activeIndex={activeTab} onChange={(e) => {setActiveTab(e); call()}} />
          }
        </View>
      </TextStyleContext.Provider>
    </>
  );
}