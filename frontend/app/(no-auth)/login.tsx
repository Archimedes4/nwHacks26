import { View, Text, TextInput, useWindowDimensions, Pressable, Alert } from 'react-native'
import React, { useState } from 'react'
import { Colors, loadingStateEnum } from '@/types';
import { supabase } from '@/functions/supabase';
import { router } from 'expo-router';

export default function Login() {
  const {width, height} = useWindowDimensions();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [state, setState] = useState(loadingStateEnum.notStarted)

  async function signInWithEmail() {
    setState(loadingStateEnum.loading)
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })
    console.log(error)
    if (error) Alert.alert(error.message)
    setState(loadingStateEnum.success)
    router.push("/account")
  }

    async function signInAnonymously() {
        setState(loadingStateEnum.loading)
        const { data, error } = await supabase.auth.signInAnonymously()
        if (error) {
            Alert.alert(error.message)
            setState(loadingStateEnum.notStarted)
            return
        }
        // optional: inspect `data` if needed
        setState(loadingStateEnum.success)
        router.push("/account")
    }
    const isLoading = state === loadingStateEnum.loading

  return (
    <View style={{width, height, backgroundColor: Colors.primary, padding: 15}}>
      <Text>Welcome,</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        style={{fontFamily: "FacultyGlyphic", backgroundColor: Colors.secondary, borderRadius: 15, padding: 10, color: Colors.light}}
        placeholder='Email'
        editable={!isLoading}
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        style={{fontFamily: "FacultyGlyphic", backgroundColor: Colors.secondary, borderRadius: 15, padding: 10, paddingTop: 15, color: Colors.light}}
        placeholder='Password'
        secureTextEntry
        editable={!isLoading}
      />
      <Pressable
        style={{padding: 10}}
        onPress={() => {signInWithEmail()}}
        disabled={isLoading}
      >
        <Text>Sign in</Text>
      </Pressable>
        <Pressable
            style={{padding: 10, marginTop: 8, opacity: isLoading ? 0.6 : 1}}
            onPress={() => {signInAnonymously()}}
            disabled={isLoading}
        >
            <Text>Continue as Guest</Text>
        </Pressable>
    </View>
  )
}