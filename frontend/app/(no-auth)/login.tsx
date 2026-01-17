import { View, Text, TextInput, useWindowDimensions, Pressable, Alert } from 'react-native'
import React, { useState } from 'react'
import { Colors, loadingStateEnum } from '@/types';
import { supabase } from '@/functions/supabase';
import { router } from 'expo-router';

export default function Signup() {
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

  return (
    <View style={{width, height, backgroundColor: Colors.primary, padding: 15}}>
      <Text>Welcome,</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        style={{fontFamily: "Playpen", backgroundColor: Colors.secondary, borderRadius: 15, padding: 10, color: Colors.light}}
        placeholder='Email'
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        style={{fontFamily: "Playpen", backgroundColor: Colors.secondary, borderRadius: 15, padding: 10, paddingTop: 15, color: Colors.light}}
        placeholder='Password'
      />
      <Pressable
        style={{padding: 10}}
        onPress={() => {signInWithEmail()}}
      >
        <Text>Sign in</Text>
      </Pressable>
    </View>
  )
}