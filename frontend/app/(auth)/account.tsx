import { View, Text, Pressable, ScrollView, useWindowDimensions } from 'react-native'
import React from 'react'
import useAuth from '@/hooks/useAuth'
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { Colors, DEFAULT_FONT } from '@/types';
import { Link } from 'expo-router';
import getGreeting from '@/functions/getGreeting';
import { BlurView } from 'expo-blur';
import SignOutButton from '@/components/SignOutButton';

export default function Account() {
  const {session, loading} = useAuth();
  const {width, height} = useWindowDimensions();
  return (
    <ScrollView style={{width, height, backgroundColor: Colors.primary}}>
      <View style={{position: 'absolute', width, height: height * 0.4}}>
        <Image
          source={require("../../assets/images/Background-1.png")}
          contentFit="cover"
          transition={1000}
          style={{width: width, height: height * 0.4}}
        />
        <BlurView
          intensity={5}
          tint="default"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        />
        <View id="dim" style={{position: 'absolute', backgroundColor: "rgba(0,0,0,0.2)", width, height: height * 0.4}} />
      </View>
      <View style={{width, height, position: 'absolute', top: height * 0.125, left: 30}}>
        <Text style={{fontFamily: DEFAULT_FONT, color: Colors.light, fontSize: 45, marginTop: 10}}>{getGreeting(new Date())} Andrew</Text>
      </View>
      <LinearGradient
        // Background Linear Gradient
        colors={['transparent', Colors.secondary]}
        style={{height: height * 0.01, width, marginTop: height * 0.3 - 50}}
      />
      <View style={{backgroundColor: Colors.secondary, height: height}}>
        <Text>Hello {session?.user.email},</Text>
        <Text>Your information</Text>
        <Text>Gender</Text>
        <SignOutButton />
      </View>
      
    </ScrollView>
  )
}