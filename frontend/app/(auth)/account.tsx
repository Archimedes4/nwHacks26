
import React, { useEffect, useMemo, useState } from "react";
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
import { Colors, DEFAULT_FONT, loadingStateEnum, userType } from "@/types";
import { getUserInfo } from "@/functions/user";
import Onboarding from "@/components/Onboarding";

// TODO: implement this in your auth layer (see section 2 below)
// import { updateAccountCredentials } from "@/functions/auth";

type FormState = { username: string; password: string };

export default function Account() {
  const { session } = useAuth();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();



  const [state, setState] = useState(loadingStateEnum.loading);
  const [user, setUser] = useState<userType | undefined>()

  async function loadUser() {
    setState(loadingStateEnum.loading)
    const result = await getUserInfo()
    if (result.result === loadingStateEnum.success) {
      setUser(result.data)
    }
    setState(result.result);
  }

  useEffect(() => {
    loadUser();
  }, [])

  if (state === loadingStateEnum.loading) {
    return <Text>Loading...</Text>
  }

  if (state === loadingStateEnum.failed) {
    return <Onboarding />
  }

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
      <View style={{ position: "absolute", top: 0, left: 0, right: 0, height: height * 0.3}}>
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
        >
         
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
