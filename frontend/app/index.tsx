import { View, Text, useWindowDimensions, Pressable } from 'react-native'
import React from 'react'
import { Colors } from '../types';
import { Link, router } from 'expo-router';
import {Image} from "expo-image";

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
        <Text>Calm down</Text>
      </View>
    </View>
  )
}