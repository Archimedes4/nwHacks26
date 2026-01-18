import { View, Text, KeyboardAvoidingView, ScrollView, StyleSheet, useWindowDimensions, Platform, TextInput } from 'react-native'
import React, { useState } from 'react'
import { BlurView } from 'expo-blur'
import {Image} from "expo-image"
import { LinearGradient } from 'expo-linear-gradient'
import SignOutButton from './SignOutButton'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import CustomButton from './CustomButton'

export default function Onboarding() {
  const {height} = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState<string>("");
  const [gender, setGender] = useState("");
  const [userHeight, setUserHeight] = useState(0);
  const [weight, setWeight] = useState(0);
  const [age, setAge] = useState(0);

  return (
    <View style={{ flex: 1, backgroundColor: "#050816" }}>
      {/* Background gradient for the whole page */}
      <LinearGradient
        colors={["#1A2255", "#0B1026", "#050816"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Hero image background */}
      <View style={{ position: "absolute", top: 0, left: 0, right: 0, height: height * 0.3}}>
        <Image
          source={require("../../assets/images/Background-1.png")}
          contentFit="cover"
          transition={600}
          style={StyleSheet.absoluteFillObject}
        />
        <BlurView intensity={12} tint="dark" style={StyleSheet.absoluteFillObject} />
        <View
          style={[
            StyleSheet.absoluteFillObject,
            { backgroundColor: "rgba(0,0,0,0.22)" },
          ]}
        />
      </View>

      {/* Top-right Sign out overlay */}
      <View style={{ position: "absolute", top: insets.top + 12, right: 12, zIndex: 999 }}>
        <SignOutButton />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
        >
        <TextInput
          value={name}
          onChangeText={setName}
        /> 
        <CustomButton
          title="Save Info"
          onPress={() => {

          }}
         />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}