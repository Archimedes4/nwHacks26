import { Text, Pressable, ViewStyle } from 'react-native'
import React from 'react'
import {Colors, DEFAULT_FONT} from "@/types"

export default function CustomButton({
  title,
  onPress,
  Icon,
  style,
  disabled
}:{
  title: string;
  onPress: () => void;
  Icon?: () => React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  disabled?: boolean
}) {
  return (
    <Pressable
      style={[{borderRadius: 15, padding: 10, backgroundColor: Colors.light, flexDirection: 'row'}, style]}
      onPress={onPress}
      disabled={disabled}
    >
      {Icon && <Icon />}
      <Text style={{marginLeft: Icon ? 10:0, marginVertical: 'auto', fontFamily: DEFAULT_FONT, color: Colors.dark}}>{title}</Text>
    </Pressable>
  )
}