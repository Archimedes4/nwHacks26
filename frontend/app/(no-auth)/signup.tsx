import { View, Text, TextInput, useWindowDimensions, Pressable, Alert, Linking } from 'react-native'
import React, { useState } from 'react'
import { Colors, loadingStateEnum } from '@/types';
import { supabase } from '@/functions/supabase';
import {router} from "expo-router";

export default function Signup() {
    const {width, height} = useWindowDimensions();
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [state, setState] = useState(loadingStateEnum.notStarted)

    async function signUpWithEmail() {
        setState(loadingStateEnum.loading)
        const {
            data: { session } = {} as any,
            error,
        } = await supabase.auth.signUp({
            email: email,
            password: password,
        })
        if (error) {
            Alert.alert(error.message)
            setState(loadingStateEnum.notStarted)
            return
        }
        if (!session) {
            Alert.alert('Please check your inbox for email verification!')
            setState(loadingStateEnum.notStarted)
            return
        }
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
        setState(loadingStateEnum.success)
        router.push("/account")
    }

    async function signInWithGoogle() {
        setState(loadingStateEnum.loading)
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
        })
        if (error) {
            Alert.alert(error.message)
            setState(loadingStateEnum.notStarted)
            return
        }
        if (data?.url) {
            await Linking.openURL(data.url)
            setState(loadingStateEnum.success)
        } else {
            Alert.alert('Unable to start Google sign-in.')
            setState(loadingStateEnum.notStarted)
        }
    }

    const isLoading = state === loadingStateEnum.loading

    return (
        <View style={{width, height, backgroundColor: Colors.primary, padding: 15}}>
            <Text>Welcome,</Text>
            <TextInput
                value={email}
                onChangeText={setEmail}
                style={{fontFamily: "Playpen", backgroundColor: Colors.secondary, borderRadius: 15, padding: 10, color: Colors.light}}
                placeholder='Email'
                editable={!isLoading}
            />
            <TextInput
                value={password}
                onChangeText={setPassword}
                style={{fontFamily: "Playpen", backgroundColor: Colors.secondary, borderRadius: 15, padding: 10, paddingTop: 15, color: Colors.light}}
                placeholder='Password'
                editable={!isLoading}
            />
            <Pressable
                style={{padding: 10, opacity: isLoading ? 0.6 : 1}}
                onPress={() => { signUpWithEmail() }}
                disabled={isLoading}
            >
                <Text>Create Account</Text>
            </Pressable>

            <Pressable
                style={{padding: 10, marginTop: 8, opacity: isLoading ? 0.6 : 1}}
                onPress={() => {signInAnonymously()}}
                disabled={isLoading}
            >
                <Text>Continue as Guest</Text>
            </Pressable>

            <Pressable
                style={{padding: 10, marginTop: 8, opacity: isLoading ? 0.6 : 1}}
                onPress={() => {signInWithGoogle()}}
                disabled={isLoading}
            >
                <Text>Continue with Google</Text>
            </Pressable>
        </View>
    )
}
