import { View, Text, Pressable } from 'react-native'
import React from 'react'
import {Link} from "expo-router"
import {Colors, DEFAULT_FONT} from "@/types"

export default function Header() {
  return (
    <>
      <Text style={{fontFamily: "Pacifico", color: Colors.light, fontSize: 45, marginTop: 10, marginHorizontal: 'auto'}}>Somnia</Text>
      <View style={{flexDirection: 'row', position: 'absolute', top: 20, right: 0}}>
        <Link href={"./login"} asChild>
          <Text style={{fontFamily: DEFAULT_FONT, color: Colors.light, fontSize: 20, marginVertical: 'auto'}}>Login</Text>
        </Link>
        <Link href={"./signup"} asChild>
          <Pressable style={{paddingHorizontal: 15, backgroundColor: Colors.secondary, height: 60, borderRadius: 30, marginVertical: 'auto', marginHorizontal: 15}}>
            <Text style={{fontFamily: DEFAULT_FONT, color: Colors.light, fontSize: 20, marginVertical: 'auto'}}>Sign Up</Text>
          </Pressable>
        </Link>
      </View>
    </>
  )
}