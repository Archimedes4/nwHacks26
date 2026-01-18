import { View, Text, Pressable } from 'react-native'
import React from 'react'
import {Colors, DEFAULT_FONT} from "@/types"

export default function CustomButton({
  title,
  onPress,
  Icon,
  style
}:{
  title: string;
  onPress: () => void;
  Icon?: () => React.ReactNode;
  style?: ViewStyle
}) {
  return (
    <Pressable
      style={[{borderRadius: 15, padding: 10, backgroundColor: Colors.light, flexDirection: 'row'}, style]}
      onPress={onPress}
    >
      {Icon && <Icon />}
      <Text style={{marginLeft: Icon ? 10:0, marginVertical: 'auto', fontFamily: DEFAULT_FONT}}>{title}</Text>
    </Pressable>
  )
}