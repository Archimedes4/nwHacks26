import { BACKEND_URL, loadingStateEnum, userType } from "@/types";
import { supabase } from "./supabase";

export async function getUserInfo(): Promise<{
  result: loadingStateEnum.success,
  data: userType
} | {
  result: loadingStateEnum.failed
}> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const accessToken = session?.access_token;

    if (accessToken === undefined) {
      return {
        result: loadingStateEnum.failed
      }
    }

    console.log("here")
    const result = await fetch(BACKEND_URL + "/users", {
      headers: {
        "Authorization":"Bearer " + accessToken
      }
    })

    if (!result.ok) {
      return {
        result: loadingStateEnum.failed
      }
    }

    const data = await result.json()
    
    return {
      result: loadingStateEnum.success,
      data: data as userType
    }
  } catch {
    return {
      result: loadingStateEnum.failed
    }
  }
}


export async function createUser(name: string, gender: "Male" | "Female", age: number, height: number, weight: number) {
    try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const accessToken = session?.access_token;
    if (accessToken === undefined) {
      return {
        result: loadingStateEnum.failed
      }
    }

    const result = await fetch(BACKEND_URL + "/users", {
      method: "POST",
      headers: {
        "Authorization":"Bearer " + accessToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name,
        gender: gender,
        age,
        height,
        weight
      })
    })

    if (!result.ok) {
      return {
        result: loadingStateEnum.failed
      }
    }

    const data = result.json()
    
    return {
      result: loadingStateEnum.success,
      data: data
    }
  } catch {
    return {
      result: loadingStateEnum.failed
    }
  }
}

type ProfileDefaults = { gender?: "Male" | "Female"; age?: number };

export async function getProfileDefaults(): Promise<ProfileDefaults> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return {};
    const { data, error } = await supabase
        .from("profiles")
        .select("gender, age")
        .eq("user_id", user.id)
        .single();
    if (error) return {};
    return { gender: data?.gender ?? undefined, age: data?.age ?? undefined };
}

export async function upsertProfileDefaults(next: ProfileDefaults) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("No user");
    const { error } = await supabase
        .from("profiles")
        .upsert({
            user_id: user.id,
            gender: next.gender ?? null,
            age: next.age ?? null,
            updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" });
    if (error) throw error;
}
