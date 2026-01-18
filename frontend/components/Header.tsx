import { View, Text, Pressable, useWindowDimensions } from 'react-native'
import React from 'react'
import {Link} from "expo-router"
import {Colors, DEFAULT_FONT} from "@/types"
import { LinearGradient } from 'expo-linear-gradient'
import useAuth from '@/hooks/useAuth'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function Header() {
  const {session, loading} = useAuth();
  const insets = useSafeAreaInsets();
  const {width} = useWindowDimensions();

  return (
    <View style={{backgroundColor: 'transparent', position: 'fixed', zIndex: 100, width: width, top: insets.top, paddingHorizontal: '10%', display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
        <LinearGradient
                // Background Linear Gradient
            colors={["#0c111a", 'transparent']}
            style={{position: 'absolute', height: 100, width: width, opacity: 0.8}}
        />
      <Text style={{fontFamily: "Pacifico", color: Colors.light, fontSize: 45, marginTop: 10}}><Link href={"/"}>Somnia</Link></Text>
      {session === null ?
        <View style={{flexDirection: 'row', position: 'relative', marginLeft: 'auto'}}>
          <Link href={"./login"} asChild>
            <Text style={{fontFamily: DEFAULT_FONT, color: Colors.light, fontSize: 20, marginVertical: 'auto'}}>Login</Text>
          </Link>
          <Link href={"./signup"} asChild>
            <Pressable style={{paddingHorizontal: 15, backgroundColor: Colors.secondary, height: 60, borderRadius: 30, marginVertical: 'auto', marginHorizontal: 15}}>
              <Text style={{fontFamily: DEFAULT_FONT, color: Colors.light, fontSize: 20, marginVertical: 'auto'}}>Sign Up</Text>
            </Pressable>
          </Link>
        </View>:
        <View style={{marginLeft: 'auto'}}/>
      }
    </View>
  )
}