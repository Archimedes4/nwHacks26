import { View, Text, Pressable, useWindowDimensions, Image, Platform } from "react-native";
import React from "react";
import { Link } from "expo-router";
import { Colors, DEFAULT_FONT } from "@/types";
import useAuth from "@/hooks/useAuth";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HEADER_BAR_HEIGHT } from "./HeaderSpacer";
import SignOutButton from "@/components/SignOutButton";

export default function Header() {
    const { session } = useAuth();
    const insets = useSafeAreaInsets();
    const { width } = useWindowDimensions();

    return (
        <View
            style={{
                backgroundColor: "transparent",
                position: "absolute",
                zIndex: 100,
                width,
                top: insets.top,
                paddingHorizontal: "10%",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                height: HEADER_BAR_HEIGHT,
            }}
        >
            {/* Left: logo + brand */}
            <Link href={"/"} asChild>
                <Pressable style={{ flexDirection: "row", alignItems: "center" }}>
                    <Image
                        source={require("@/assets/images/splash-icon.png")}
                        style={{ width: 40, height: 40, marginRight: 8 }}
                        resizeMode="contain"
                        accessibilityLabel="Somnia logo"
                    />
                    <Text style={{ fontFamily: "Pacifico", color: Colors.light, fontSize: 45 }}>
                        Somnia
                    </Text>
                </Pressable>
            </Link>

            {/* Spacer to push actions to the right */}
            <View style={{ flex: 1 }} />

            {/* Right: auth actions */}
            {Platform.OS !== "ios" && <>
            {session === null ? (
                <View style={{ flexDirection: "row" }}>
                    <Link href={"./login"} asChild>
                        <Text
                            style={{
                                fontFamily: DEFAULT_FONT,
                                color: Colors.light,
                                fontSize: 20,
                                marginVertical: "auto",
                            }}
                        >
                            Login
                        </Text>
                    </Link>
                    <Link href={"./signup"} asChild>
                        <Pressable
                            style={{
                                paddingHorizontal: 15,
                                backgroundColor: Colors.secondary,
                                height: 60,
                                borderRadius: 30,
                                marginVertical: "auto",
                                marginHorizontal: 15,
                                justifyContent: "center",
                            }}
                        >
                            <Text
                                style={{
                                    fontFamily: DEFAULT_FONT,
                                    color: Colors.light,
                                    fontSize: 20,
                                }}
                            >
                                Sign Up
                            </Text>
                        </Pressable>
                    </Link>
                </View>
            ) : (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Link href={"/account"} asChild>
                        <Pressable
                            style={{
                                paddingHorizontal: 12,
                                paddingVertical: 8,
                                borderRadius: 20,
                                marginRight: 10,
                                backgroundColor: "rgba(255,255,255,0.1)",
                            }}
                        >
                            <Text
                                style={{
                                    fontFamily: DEFAULT_FONT,
                                    color: Colors.light,
                                    fontSize: 16,
                                }}
                            >
                                Account
                            </Text>
                        </Pressable>
                    </Link>
                    <SignOutButton />
                </View>
            )}</>}
        </View>
    );
}
