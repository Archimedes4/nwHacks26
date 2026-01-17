import { View, Text, Pressable } from 'react-native'
import React from 'react'

export default function account() {
  return (
    <View>
      <Text>Hello Andrew,</Text>
      <Text>Your information</Text>
      <Text>Gender</Text>
      <Pressable>
        <Text>Log out</Text>
      </Pressable>
    </View>
  )
}