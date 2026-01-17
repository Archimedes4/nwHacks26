import { View, Text, useWindowDimensions, Pressable } from 'react-native'
import React from 'react'
import { Colors } from '../types';
import { router } from 'expo-router';

export default function index() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const {width, height} = useWindowDimensions();
  return (
    <View style={{width, height, backgroundColor: Colors.primary}}>
      <Text style={{fontFamily: "Pacifico", color: Colors.light, fontSize: 45, marginTop: 10, marginHorizontal: 'auto'}}>Somnia</Text>
      <Text>Calm down</Text>
      <Pressable onPress={() => {router.push("/signup")}}>
        <Text>Sign in</Text>
      </Pressable>
    </View>
  )
}