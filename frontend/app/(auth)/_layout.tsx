import { View, Text } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Redirect, Slot } from 'expo-router'
import { Session } from '@supabase/supabase-js'
import { supabase } from '@/functions/supabase'

export default function Layout() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState<boolean>(true);
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setLoading(false)
      setSession(session)
    })
    supabase.auth.onAuthStateChange((_event, session) => {
      setLoading(false)
      setSession(session)
    })
  }, [])

  if (loading) {
    return null;
  }

  if (session === null) {
    return <Redirect href={"/login"}/>
  }

  return (
    <Slot />
  )
}