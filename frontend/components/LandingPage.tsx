import { View, Text, useWindowDimensions, Pressable } from 'react-native'
import React from 'react'
import { Colors } from '../types';
import { Link } from 'expo-router';
import {Image} from "expo-image";
import { AdviceIcon, SleepIcon } from './Icons';

export default function index() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const {width, height} = useWindowDimensions();

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
            <Text style={{fontFamily: "Playpen", color: Colors.light, fontSize: 20, marginVertical: 'auto'}}>Login</Text>
          </Link>
          <Link href={"./signup"} asChild>
            <Pressable style={{paddingHorizontal: 15, backgroundColor: Colors.secondary, height: 60, borderRadius: 30, marginVertical: 'auto', marginHorizontal: 15}}>
              <Text style={{fontFamily: "Playpen", color: Colors.light, fontSize: 20, marginVertical: 'auto'}}>Sign Up</Text>
            </Pressable>
          </Link>
        </View>
        <View style={{backgroundColor: Colors.secondary, marginTop: height * 0.3}}>
        <Text style={{color: Colors.light, fontFamily: "Playpen", fontSize: 30}}>We&apos;re here to help you fix your sleep!</Text>
        <View style={{flexDirection: 'row'}}>
          <View>
            <AdviceIcon width={height * 0.2} height={height * 0.2} color={Colors.light}/>
            <Text>Sleep Advice</Text>
          </View>
          <View>
            <SleepIcon width={height * 0.2} height={height * 0.2} color={Colors.light} />
            <Text>Sleep Tracking</Text>
          </View>
          <View>
            
          </View>
        </View>
        <Text style={{color: Colors.light, fontFamily: "Playpen", fontSize: 30}}>Why choose Somnia</Text>
        <Text style={{color: Colors.light, fontFamily: "Playpen", fontSize: 20}}>Our model built from the ground up gives you advice that you can't find anywhere else. Quickly enter small amounts of information and get pointed to the right resources to help you fix your sleep. Best part, this is all free, no sign up needed.</Text>
        </View>
      </View>
    </View>
  )
}