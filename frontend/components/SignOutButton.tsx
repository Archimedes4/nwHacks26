import { View, Text, ActivityIndicator, Alert } from 'react-native'
import React, { useState } from 'react'
import { Colors, loadingStateEnum } from '@/types'
import CustomButton from './CustomButton';
import { SignOutIcon } from './Icons';
import { signOut } from '@/functions/auth';

function getText(state: loadingStateEnum) {
  if (state === loadingStateEnum.loading) {
    return "Loading...";
  }
  return "Sign out"
}

export default function SignOutButton() {
  const [state, setState] = useState(loadingStateEnum.notStarted);

  async function loadSignOut() {
    setState(loadingStateEnum.loading);
    const result = await signOut();
    if (result === loadingStateEnum.failed) {
      Alert.alert("Something went wrong signing out!")
    }
    setState(result)
  }

  return (
    <CustomButton
      Icon={() => {return (state === loadingStateEnum.loading) ? <ActivityIndicator color={Colors.dark} style={{marginVertical: 'auto'}}/>:<SignOutIcon width={25} height={25} color={Colors.dark} style={{marginVertical: 'auto'}}/>}}
      title={getText(state)}
      onPress={() => {loadSignOut()}}
      style={{borderWidth: 2, borderColor: Colors.dark, height: 55, marginHorizontal: 15}}
      disabled={state === loadingStateEnum.loading}
    />
  )
}