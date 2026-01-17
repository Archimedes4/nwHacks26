import { View, Text, useWindowDimensions, Pressable, ScrollView } from 'react-native'
import React from 'react'
import { Colors } from '../types';
import { Link } from 'expo-router';
import {Image} from "expo-image";
import { AdviceIcon, SleepIcon, TVIcon } from './Icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function index() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const {width, height} = useWindowDimensions();

  return (
    <ScrollView style={{width, height, backgroundColor: Colors.primary}}>
      <Image
        source={require("../assets/images/Background-1.png")}
        contentFit="cover"
        transition={1000}
        style={{width: width, height: height * 0.4}}
      />
      <View style={{width, height, position: 'absolute'}}>
        <Text style={{fontFamily: "Pacifico", color: Colors.light, fontSize: 45, marginTop: 10, marginHorizontal: 'auto'}}>Somnia</Text>
        <View style={{flexDirection: 'row', position: 'absolute', top: 20, right: 0}}>
          <Link href={"./login"} asChild>
            <Text style={{fontFamily: "FacultyGlyphic", color: Colors.light, fontSize: 20, marginVertical: 'auto'}}>Login</Text>
          </Link>
          <Link href={"./signup"} asChild>
            <Pressable style={{paddingHorizontal: 15, backgroundColor: Colors.secondary, height: 60, borderRadius: 30, marginVertical: 'auto', marginHorizontal: 15}}>
              <Text style={{fontFamily: "FacultyGlyphic", color: Colors.light, fontSize: 20, marginVertical: 'auto'}}>Sign Up</Text>
            </Pressable>
          </Link>
        </View>
        <LinearGradient
          // Background Linear Gradient
          colors={['transparent', Colors.secondary]}
          style={{height: height * 0.01, width, marginTop: height * 0.3 - 50}}
        />
        <View style={{backgroundColor: Colors.secondary}}>
        <Text style={{color: Colors.light, fontFamily: "FacultyGlyphic", fontSize: 30, marginHorizontal: 'auto', marginBottom: 25, marginTop: 15}}>We&apos;re here to help you fix your sleep!</Text>
        <View style={{flexDirection: 'row'}}>
          <View style={{marginHorizontal: 'auto'}}>
            <AdviceIcon width={height * 0.2} height={height * 0.2} color={Colors.light}/>
            <Text style={{color: Colors.light, fontFamily: "FacultyGlyphic", fontSize: 20, flexDirection: 'row'}}>Sleep Advice</Text>
          </View>
          <View>
            <SleepIcon width={height * 0.2} height={height * 0.2} color={Colors.light} />
            <Text style={{color: Colors.light, fontFamily: "FacultyGlyphic", fontSize: 20, flexDirection: 'row'}}>Sleep Tracking</Text>
          </View>
          <View style={{marginHorizontal: 'auto'}}>
            <TVIcon width={height * 0.2} height={height * 0.2} color={Colors.light} />
            <Text style={{color: Colors.light, fontFamily: "FacultyGlyphic", fontSize: 20, flexDirection: 'row'}}>Sleep Content</Text>
          </View>
        </View>
        <Text style={{color: Colors.light, fontFamily: "FacultyGlyphic", fontSize: 30, marginHorizontal: "auto", marginTop: height * 0.05, marginBottom: height * 0.025}}>Why choose Somnia</Text>
        <Text style={{color: Colors.light, fontFamily: "FacultyGlyphic", fontSize: 20, marginHorizontal: 30}}>Our model built from the ground up gives you advice that you can't find anywhere else. Quickly enter small amounts of information and get pointed to the right resources to help you fix your sleep. Best part, this is all free, no sign up needed.</Text>
        </View>
        <View style={{borderRadius: 15, padding: 15, borderWidth: 2, marginHorizontal: 30, borderColor: Colors.light, marginTop: 15}}>
          <Text style={{color: Colors.light, fontFamily: "FacultyGlyphic", fontSize: 20}}>Somina, made me have a good sleep during nwHacks 26. It helped me calm down and stay focused.</Text>
          <Text style={{color: Colors.light, fontFamily: "FacultyGlyphic", fontSize: 20}}>- Andrew Mainella</Text>
        </View>
        <View style={{borderRadius: 15, padding: 15, borderWidth: 2, marginHorizontal: 30, borderColor: Colors.light, marginTop: 15}}>
          <Text style={{color: Colors.light, fontFamily: "Playpen", fontSize: 20}}>This app called Somnia really made my sleep better. Not only does it help me relax and go to sleep, it also helps me feel better the following day. 10/10 Recommended.</Text>
          <Text style={{color: Colors.light, fontFamily: "Playpen", fontSize: 20}}>- Jason Shin</Text>
        </View>
      </View>
    </ScrollView>
  )
}