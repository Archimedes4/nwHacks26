import { View, Text, useWindowDimensions, Pressable } from 'react-native'
import React, { useState } from 'react'
import { Colors, DEFAULT_FONT } from '../types';
import { Link, router } from 'expo-router';
import {Image} from "expo-image";
import LiquidGlassTabBar from '@/components/LiquidGlass';
import LandingPage from '@/components/LandingPage';
import { AdviceIcon, HomeIcon, PersonIcon, SleepIcon } from '@/components/Icons';

export default function Index() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const {width, height} = useWindowDimensions();
  const [activeTab, setActiveTab] = useState(0);

  if (true) {
    return <LandingPage />
  }

  return (
    <View style={{width, height, backgroundColor: Colors.primary}}>
      <Image
        source={require("../assets/images/Background-1.png")}
        contentFit="cover"
        transition={1000}
        style={{width: width, height: height}}
      />
      <View style={{width, height, position: 'absolute'}}>
        <Text style={{fontFamily: "Pacifico", color: Colors.light, fontSize: 45, marginTop: 10, marginHorizontal: 'auto'}}>Somnia</Text>
        <View style={{flexDirection: 'row', position: 'absolute', top: 20, right: 0}}>
          <Link href={"./login"} asChild>
            <Text style={{fontFamily: DEFAULT_FONT, color: Colors.light, fontSize: 20, marginVertical: 'auto'}}>Login</Text>
          </Link>
          <Link href={"./signup"} asChild>
            <Pressable style={{paddingHorizontal: 15, backgroundColor: Colors.secondary, height: 60, borderRadius: 30, marginVertical: 'auto', marginHorizontal: 15}}>
              <Text style={{fontFamily: DEFAULT_FONT, color: Colors.light, fontSize: 20, marginVertical: 'auto'}}>Sign Up</Text>
            </Pressable>
          </Link>
        </View>
        <Text>Your're recent advice!</Text>
        <Text>Why choose Somnia</Text>
        <Text style={{color: Colors.light, fontFamily: DEFAULT_FONT, fontSize: 20}}>Our model built from the ground up gives you advice that you can't find anywhere else. Quickly enter small amounts of information and get pointed to the right resources to help you fix your sleep. Best part, this is all free, no sign up needed.</Text>
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
