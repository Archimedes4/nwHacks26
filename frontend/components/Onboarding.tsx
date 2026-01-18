import { View, Text, KeyboardAvoidingView, ScrollView, StyleSheet, useWindowDimensions, Platform, TextInput } from 'react-native'
import React, { useState } from 'react'
import { BlurView } from 'expo-blur'
import {Image} from "expo-image"
import { LinearGradient } from 'expo-linear-gradient'
import SignOutButton from './SignOutButton'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import CustomButton from './CustomButton'
import { Colors, DEFAULT_FONT } from '@/types'
import { createUser } from '@/functions/user'

export default function Onboarding() {
  const {height} = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState<string>("");
  const [gender, setGender] = useState("");
  const [userHeight, setUserHeight] = useState(0);
  const [weight, setWeight] = useState(0);
  const [age, setAge] = useState(0);

  async function loadCreateUser() {
    if (gender !== "Male" && gender !== "Female") {
      return;
    }
    const result = await createUser(name, gender, age, height, weight);
  }

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
          source={require("../assets/images/Background-1.png")}
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
        style={{ flex: 1, marginTop: insets.top + height * 0.3 + 15 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
        >
        <TextInput
          value={name}
          onChangeText={setName}
          style={styles.main}
          placeholder='Name'
        /> 
        <TextInput
          value={gender}
          onChangeText={setGender}
          style={styles.main}
          placeholder='Gender Male | Female'
        /> 
        <TextInput
          value={userHeight.toString()}
          onChangeText={(e) => {
            const newHeight = parseInt(e);
            if (!Number.isNaN(newHeight)) {
              setUserHeight(newHeight)
            }
          }}
          style={styles.main}
          placeholder='Height'
        /> 
        <TextInput
          value={weight.toString()}
          onChangeText={(e) => {
            const newage = parseInt(e);
            if (!Number.isNaN(newage)) {
              setWeight(newage)
            }
          }}
          style={styles.main}
          placeholder='Weight'
        /> 
        <TextInput
          value={age.toString()}
          onChangeText={(e) => {
            const newage = parseInt(e);
            if (!Number.isNaN(newage)) {
              setAge(newage)
            }
          }}
          style={styles.main}
          placeholder='Age'
        /> 
        <CustomButton
          title="Save Info"
          onPress={() => {
            loadCreateUser();
          }}
          style={{marginHorizontal: 15}}
         />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  main: {
    fontFamily: DEFAULT_FONT,
    backgroundColor: Colors.tertiary,
    borderRadius: 15,
    padding: 15,
    color: Colors.light,
    marginBottom: 10,
    outline: 'none',
    marginHorizontal: 15
  }
})