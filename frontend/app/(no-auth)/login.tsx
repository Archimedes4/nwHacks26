import { View, Text, TextInput, useWindowDimensions, Alert, ActivityIndicator } from 'react-native'
import React, { useMemo, useState } from 'react'
import { Colors, loadingStateEnum, DEFAULT_FONT } from '@/types';
import { supabase } from '@/functions/supabase';
import {router, Link} from "expo-router";
import CustomButton from "@/components/CustomButton"
import {IncognitoIcon} from "@/components/Icons"
import {Image} from "expo-image"
import { BlurView } from 'expo-blur';

export default function Login() {
    const {width, height} = useWindowDimensions();

    return (
        <View style={{width, height, backgroundColor: Colors.secondary}}>
            <Image
                source={require("../../assets/images/Background-1.png")}
                contentFit="cover"
                style={{width: width, height: height}}
            />
            <BlurView intensity={10}/>
            <View style={{width, height, position: 'absolute', padding: 15}}>
              <SignUpInner />
            </View>
        </View>
    )
}


function getSignupErrors(email: string, password: string): string[] {
    let errors: string[] = [];
    if (!RegExp(/^[^\s@]+@[^\s@]+\.[^\s@]+$/).test(email)) {
        errors.push("email")
    }
    if (!RegExp(/^.{5,}$/).test(password)) {
        errors.push("password")
    }
    return errors;
}

function PasswordLogin({setState}:{setState: (e: loadingStateEnum) => void;}) {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [showingErrors, setShowingErrors] = useState<boolean>(false);
    const errors = useMemo(() => {
        if (showingErrors) {
            return getSignupErrors(email, password);
        }
        return [];
    }, [email, password, showingErrors])

    async function signUpWithEmail() {
        setState(loadingStateEnum.loading)
        if (getSignupErrors(email, password).length !== 0) {
            setState(loadingStateEnum.notStarted);
            setShowingErrors(true);
            return;
        }
        const {
            data: { session } = {} as any,
            error,
        } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        })
        if (error) {
            setState(loadingStateEnum.failed)
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

    return (
        <>
            <TextInput
                value={email}
                onChangeText={setEmail}
                style={{fontFamily: DEFAULT_FONT, backgroundColor: Colors.tertiary, borderRadius: 15, padding: 15, color: Colors.light, marginBottom: 10, outline: "none"}}
                placeholder='Email'
            />
            {errors.includes("email") &&
                <Text style={{fontFamily: DEFAULT_FONT, color: Colors.red, marginBottom: 10}}>Please enter a valid email!</Text>
            }
            <TextInput
                value={password}
                onChangeText={setPassword}
                style={{fontFamily: DEFAULT_FONT, backgroundColor: Colors.tertiary, borderRadius: 15, padding: 15, paddingTop: 15, color: Colors.light, marginBottom: 10, outline: "none"}}
                placeholder='Password'
            />
            {errors.includes("password") &&
                <Text style={{fontFamily: DEFAULT_FONT, color: Colors.red, marginBottom: 10}}>Please enter a password that is atleast 5 characters long!</Text>
            }
            <CustomButton
                title="Log in"
                onPress={() => {signUpWithEmail()}}
                style={{marginBottom: 10, borderWidth: 2, borderColor: Colors.dark, height: 55}}
            />
        </>
    )
}

function SignUpInner() {
  const {width} = useWindowDimensions();

  const [state, setState] = useState(loadingStateEnum.notStarted)

  async function signInAnonymously() {
      setState(loadingStateEnum.loading)
      const { error } = await supabase.auth.signInAnonymously()
      if (error) {
          setState(loadingStateEnum.failed)
          return
      }
      setState(loadingStateEnum.success)
      router.push("/account")
  }

  if (state === loadingStateEnum.loading) {
    return (
      <View style={{maxWidth: 700, marginHorizontal: (width >= 700) ? 'auto':undefined, width: (width < 700) ? undefined:700, marginVertical: "auto", backgroundColor: Colors.light, padding: 15, borderRadius: 15, borderWidth: 2, borderColor: Colors.dark, minHeight: 300}}>
          <ActivityIndicator color={Colors.dark} style={{marginTop: "auto"}}/>
          <Text style={{fontFamily: DEFAULT_FONT, fontSize: 15, color: Colors.dark, marginHorizontal: 'auto', marginVertical: 10, marginBottom: "auto"}}>Logging you in!</Text>
      </View>
    )
  }

  if (state === loadingStateEnum.success || state === loadingStateEnum.failed) {
    return (
      <View style={{maxWidth: 700, marginHorizontal: (width >= 700) ? 'auto':undefined, width: (width < 700) ? undefined:700, marginVertical: "auto", backgroundColor: Colors.light, padding: 15, borderRadius: 15, borderWidth: 2, borderColor: Colors.dark, minHeight: 300}}>
          <Text style={{fontFamily: DEFAULT_FONT, fontSize: 15, color: Colors.dark, marginHorizontal: 'auto', marginVertical: 10, marginBottom: "auto"}}>An Error occured signing in.</Text>
          <CustomButton
            title='Okay'
            onPress={() => {setState(loadingStateEnum.notStarted)}}
            style={{marginBottom: 10, borderWidth: 2, borderColor: Colors.dark, height: 55}}
          />
      </View>
    )
  }

  return (
    <View style={{maxWidth: 700, marginHorizontal: (width >= 700) ? 'auto':undefined, width: (width < 700) ? undefined:700, marginVertical: "auto", backgroundColor: Colors.light, padding: 15, borderRadius: 15, borderWidth: 2, borderColor: Colors.dark}}>
        <Text style={{marginBottom: 10, fontFamily: DEFAULT_FONT, fontSize: 30, color: Colors.dark}}>Log in to Somnia</Text>
        <PasswordLogin setState={setState}/>
        <CustomButton
            title="Continue As Guest"
            Icon={() => <IncognitoIcon width={30} height={30}/>}
            onPress={() => {signInAnonymously()}}
            style={{marginBottom: 10, borderWidth: 2, borderColor: Colors.dark, height: 55}}
        />
        <Link href="/signup">
            <Text style={{fontFamily: DEFAULT_FONT, fontSize: 15, color: Colors.dark}}>Don&apos;t have an account? <Text style={{fontFamily: DEFAULT_FONT, fontSize: 15, color: Colors.blue}}>Sign up</Text></Text>
        </Link>
    </View>
  )
}