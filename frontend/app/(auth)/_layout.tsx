import React from 'react'
import { Redirect, Slot } from 'expo-router'
import useAuth from '@/hooks/useAuth'

export default function Layout() {
  const {session, loading} = useAuth();

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