import { View, Text, useWindowDimensions, Pressable } from 'react-native'
import React, { useState } from 'react'
import { Colors, DEFAULT_FONT } from '../types';
import { Link, router } from 'expo-router';
import {Image} from "expo-image";
import LiquidGlassTabBar from '@/components/LiquidGlass';
import LandingPage from '@/components/LandingPage';
import { AdviceIcon, HomeIcon, PersonIcon, SleepIcon } from '@/components/Icons';
import useAuth from '@/hooks/useAuth';

export default function Index() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const {width, height} = useWindowDimensions();
  const [activeTab, setActiveTab] = useState(0);
  const {loading, session} = useAuth();

  if (loading || session === null) {
    return <LandingPage />
  }

  // This is just the home page that we will work out later
  return (
    <View style={{width, height, backgroundColor: Colors.primary}}>
      <Image
        source={require("../assets/images/Background-1.png")}
        contentFit="cover"
        transition={1000}
        style={{width: width, height: height}}
      />
      <View style={{width, height, position: 'absolute'}}>
        <Text>Your&apos;re recent advice!</Text>
        <Text>Why choose Somnia</Text>
        {(width < 700) &&
          <LiquidGlassTabBar
            activeIndex={activeTab}
            onChange={setActiveTab}
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
          />
        }
      </View>
    </View>
  )
}
