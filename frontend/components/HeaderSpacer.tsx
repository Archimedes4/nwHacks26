import React from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const HEADER_BAR_HEIGHT = 100; // visual header bar height
export const HEADER_SPACER_EXTRA = 80; // extra gap you asked for

export default function HeaderSpacer() {
    const insets = useSafeAreaInsets();
    const height = insets.top + HEADER_BAR_HEIGHT + HEADER_SPACER_EXTRA;
    return <View style={{ height }} />;
}