import { BACKEND_URL, loadingStateEnum, userType } from "@/types";
import { supabase } from "./supabase";

export async function getUserInfo(): Promise<
    | { result: loadingStateEnum.success; data: userType }
    | { result: loadingStateEnum.failed }
> {
    try {
        const {
            data: { session },
        } = await supabase.auth.getSession();
        const accessToken = session?.access_token;
        if (!accessToken) return { result: loadingStateEnum.failed };

        const res = await fetch(`${BACKEND_URL}/users`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!res.ok) return { result: loadingStateEnum.failed };

        const data = (await safeJson<userType>(res)) as userType;
        return { result: loadingStateEnum.success, data };
    } catch {
        return { result: loadingStateEnum.failed };
    }
}

export async function createUser(
    name: string,
    gender: "Male" | "Female",
    age: number,
    height: number,
    weight: number
) {
    try {
        const {
            data: { session },
        } = await supabase.auth.getSession();
        const accessToken = session?.access_token;
        if (!accessToken) return { result: loadingStateEnum.failed };

        console.log("HERE")
        const res = await fetch(`${BACKEND_URL}/users`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name, gender, age, height, weight }),
        });
        console.log(res.status)
        if (!res.ok) return { result: loadingStateEnum.failed };

        const data = await safeJson(res);
        return { result: loadingStateEnum.success, data };
    } catch {
        return { result: loadingStateEnum.failed };
    }
}

type ProfileDefaults = { name?: string; gender?: "Male" | "Female"; age?: number; height?: number; weight?: number; };

export async function getProfileDefaults(): Promise<ProfileDefaults> {
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return {};
    const { data, error } = await supabase
        .from("users")
        .select("name, gender, age, height, weight")
        .eq("uid", user.id)
        .single();
    if (error) return {};
    return data;
}

export async function upsertProfileDefaults(next: ProfileDefaults) {
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("No user");
    const { error } = await supabase
        .from("users")
        .upsert(
            {
                uid: user.id,
                gender: next.gender ?? null,
                age: next.age ?? null,
                height: next.height,
                weight: next.weight,
                updated_at: new Date().toISOString(),
            }
        );
    if (error) throw error;
}

export async function updateUserInfo(
    user: userType
): Promise<{ result: loadingStateEnum; data?: userType; error?: string }> {
    try {
        const {
            data: { session },
        } = await supabase.auth.getSession();
        const accessToken = session?.access_token;
        if (!accessToken) return { result: loadingStateEnum.failed, error: "No auth token." };

        const res = await fetch(`${BACKEND_URL}/users`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(user),
        });

        if (!res.ok) {
            const msg = await safeText(res);
            return { result: loadingStateEnum.failed, error: msg || "Failed to update user." };
        }

        const data = await safeJson<userType>(res);
        return { result: loadingStateEnum.success, data };
    } catch (e: any) {
        return { result: loadingStateEnum.failed, error: e?.message || "Network error." };
    }
}

async function safeText(res: Response) {
    try {
        return await res.text();
    } catch {
        return "";
    }
}

// Parses JSON only if present; supports 204/empty bodies.
async function safeJson<T>(res: Response): Promise<T | undefined> {
    try {
        if (res.status === 204) return undefined;
        const len = res.headers.get("content-length");
        if (len === "0") return undefined;
        const text = await res.text();
        if (!text) return undefined;
        return JSON.parse(text) as T;
    } catch {
        return undefined;
    }
}
