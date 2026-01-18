
import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  useWindowDimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import useAuth from "@/hooks/useAuth";
import getGreeting from "@/functions/getGreeting";
import SignOutButton from "@/components/SignOutButton";
import { Colors, DEFAULT_FONT } from "@/types";

// TODO: implement this in your auth layer (see section 2 below)
// import { updateAccountCredentials } from "@/functions/auth";

type FormState = { username: string; password: string };

export default function Account() {
  const { session } = useAuth();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const heroH = Math.round(height * 0.27);
  const cardWidth = Math.min(width * 0.95, 850);

  const [loading, setLoading] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [form, setForm] = useState<FormState>({ username: "", password: "" });

  const updateField = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Require at least ONE field to be filled (username or password)
  const getError = (field: keyof FormState, value: string) => {
    const bothEmpty = form.username.trim() === "" && form.password.trim() === "";
    if (bothEmpty) {
      if (field === "username" || field === "password") return "Fill at least one";
    }
    if (field === "password" && value && value.length > 0 && value.length < 6) {
      return "Too short";
    }
    return null;
  };

  const handleUpdate = async () => {
    const username = form.username.trim();
    const password = form.password;

    const usernameErr = getError("username", username);
    const passwordErr = getError("password", password);
    if (usernameErr || passwordErr) {
      setShowErrors(true);
      Alert.alert("Missing Info", "Enter a username and/or a new password.");
      return;
    }

    setLoading(true);
    try {
      // Replace this with your real update call
      // await updateAccountCredentials({ username: username || undefined, password: password || undefined });

      // TEMP placeholder so UI works:
      await new Promise((r) => setTimeout(r, 600));

      Alert.alert("Success", "Your account has been updated.");
      setForm((p) => ({ ...p, password: "" })); // clear password
      setShowErrors(false);
    } catch (err: any) {
      Alert.alert("Error", err?.message ?? "Update failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#050816" }}>
      {/* Background gradient for the whole page */}
      <LinearGradient
        colors={["#1A2255", "#0B1026", "#050816"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Hero image background */}
      <View style={{ position: "absolute", top: 0, left: 0, right: 0, height: heroH }}>
        <Image
          source={require("../../assets/images/Background-1.png")}
          contentFit="cover"
          transition={600}
          style={StyleSheet.absoluteFillObject}
        />
        <BlurView intensity={12} tint="dark" style={StyleSheet.absoluteFillObject} />
        <View
          style={[
            StyleSheet.absoluteFillObject,
            { backgroundColor: "rgba(0,0,0,0.22)" },
          ]}
        />
      </View>

      {/* Top-right Sign out overlay */}
      <View style={{ position: "absolute", top: insets.top + 12, right: 12, zIndex: 999 }}>
        <SignOutButton />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: heroH * 0.55, paddingBottom: 64 }}
        >
          {/* Greeting (sits on the hero area) */}
          <View style={{ paddingHorizontal: 24, marginBottom: 18 }}>
            <Text style={styles.heroTitle}>{getGreeting(new Date())}</Text>
            <Text style={styles.heroSubtitle}>{session?.user?.email ?? ""}</Text>
          </View>

          {/* Glass card form */}
          <View style={{ alignItems: "center", marginTop: 50 }}>
            <BlurView
              intensity={Platform.OS === "ios" ? 25 : 100}
              tint="dark"
              style={[styles.glassCard, { width: cardWidth }]}
            >
              <View style={styles.headerContainer}>
                <Text style={styles.title}>Account Settings</Text>
                <Text style={styles.subtitle}>Update your username or password.</Text>
              </View>

              <InputField
                label="Username"
                value={form.username}
                onChangeText={(v:string) => updateField("username", v)}
                placeholder="New username"
                autoCapitalize="none"
                autoCorrect={false}
                showError={showErrors}
                error={getError("username", form.username.trim())}
              />

              <InputField
                label="Password"
                value={form.password}
                onChangeText={(v:string) => updateField("password", v)}
                placeholder="New password"
                secureTextEntry
                autoCapitalize="none"
                showError={showErrors}
                error={getError("password", form.password)}
              />

              <TouchableOpacity
                style={[styles.button, loading && styles.disabled]}
                onPress={handleUpdate}
                disabled={loading}
              >
                <LinearGradient
                  colors={["#3c3fff", "#1f2c7b"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonText}>
                    {loading ? "Updating..." : "Save Changes"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </BlurView>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function InputField({
  label,
  showError,
  error,
  containerStyle,
  ...props
}: any) {
  return (
    <View style={[styles.inputGroup, containerStyle]}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {showError && error ? <Text style={styles.errorSmall}>{error}</Text> : null}
      </View>
      <TextInput
        style={[styles.input, showError && error ? styles.inputError : null]}
        placeholderTextColor="rgba(255,255,255,0.25)"
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  heroTitle: {
    color: Colors.light,
    fontFamily: DEFAULT_FONT,
    fontSize: 38,
    fontWeight: "900",
    letterSpacing: -1.5,
  },
  heroSubtitle: {
    marginTop: 6,
    color: "rgba(255,255,255,0.6)",
    fontFamily: DEFAULT_FONT,
    fontSize: 16,
  },

  headerContainer: { marginBottom: 22 },

  glassCard: {
    padding: 28,
    borderRadius: 36,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.10)",
    overflow: "hidden",
    ...Platform.select({
      web: { boxShadow: "0 20px 40px rgba(0,0,0,0.35)" } as any,
      default: { elevation: 10 },
    }),
  },

  title: {
    color: Colors.light,
    fontFamily: DEFAULT_FONT,
    fontSize: 34,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: -1.2,
  },
  subtitle: {
    color: "rgba(255, 255, 255, 0.45)",
    fontFamily: DEFAULT_FONT,
    fontSize: 16,
    textAlign: "center",
    marginTop: 8,
  },

  labelRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  label: {
    color: "rgba(255, 255, 255, 0.8)",
    fontFamily: DEFAULT_FONT,
    fontSize: 13,
    fontWeight: "700",
  },

  inputGroup: { marginBottom: 18 },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: 18,
    padding: 16,
    fontSize: 16,
    color: Colors.light,
    fontFamily: DEFAULT_FONT,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },
  inputError: { borderColor: "#ff5252", backgroundColor: "rgba(255, 82, 82, 0.06)" },
  errorSmall: { color: "#ff5252", fontSize: 10, fontWeight: "900" },

  button: { marginTop: 10, borderRadius: 22, overflow: "hidden" },
  buttonGradient: { padding: 18, alignItems: "center" },
  buttonText: { color: "#fff", fontFamily: DEFAULT_FONT, fontWeight: "900", fontSize: 18 },
  disabled: { opacity: 0.6 },
});
