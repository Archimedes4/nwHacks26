import { loadingStateEnum } from "@/types"
import { supabase } from "./supabase"

export async function signOut(): Promise<loadingStateEnum.success | loadingStateEnum.failed> {
  try {
    const { error } = await supabase.auth.signOut()
    return loadingStateEnum.success
  } catch {
    return loadingStateEnum.failed
  }
}