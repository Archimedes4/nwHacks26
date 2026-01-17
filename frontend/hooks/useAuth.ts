import { supabase } from "@/functions/supabase";
import { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

export default function useAuth() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    setLoading(true)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setLoading(false)
      setSession(session)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoading(false)
      setSession(session)
    })
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return {loading, session}
}
