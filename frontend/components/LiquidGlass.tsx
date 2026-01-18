import * as React from "react";
import { View, Text, Pressable, StyleSheet, LayoutChangeEvent, useWindowDimensions } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useEffect } from "react";
import { Colors } from "@/types";

export type LiquidGlassTabItem = {
  key: string;
  label: string;
  icon?: React.ReactNode;
  onPress?: () => void;
};

type LiquidGlassTabBarProps = Partial<BottomTabBarProps> & {
  tabs: LiquidGlassTabItem[];
  activeIndex: number;
  onChange: (index: number) => void;
};

/**
 * Liquid-glass tab bar:
 * - Glass background: BlurView + translucent border
 * - Liquid indicator: animated pill that stretches toward the next tab then settles
 */
export default function LiquidGlassTabBar({
  tabs,
  activeIndex,
  onChange
}: LiquidGlassTabBarProps) {
  const {width} = useWindowDimensions();

  const indicatorX = useSharedValue(5);
  const indicatorW = useSharedValue((width - 28 - (tabs.length * 10))/tabs.length);
  const squish = useSharedValue(1);

  useEffect(() => {
    indicatorX.value = withTiming(5 + (activeIndex * (width - 28)/tabs.length))
  }, [activeIndex])

  const indicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scaleY: squish.value }],
      left: indicatorX.value,
      width: indicatorW.value,
    };
  });

  return (
    <View style={styles.tabBarWrap} pointerEvents="box-none">
      <BlurView intensity={40} tint="dark" style={styles.glass}>
        {/* Liquid glass indicator */}
        <Animated.View style={[{
          position: "absolute",
          top: 5,
          bottom: 5,
          borderRadius: 999,
          backgroundColor: "rgba(255,255,255,0.14)",
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.20)",
          shadowColor: "#000",
          shadowOpacity: 0.22,
          shadowRadius: 14,
          shadowOffset: { width: 0, height: 10 },
        }, indicatorStyle]}>
          {/* highlight sheen */}
          <View style={{
            position: "absolute",
            left: 15,
            right: 15,
            top: 34,
            height: 15,
            borderRadius: 999,
            backgroundColor: "rgba(255,255,255,0.22)",
          }} />
        </Animated.View>

        {/* Tabs */}
        <View style={styles.row}>
          {tabs.map((e, index) => (
            <Pressable
              key={e.key}
              onPress={() => {onChange(index)}}
              style={{width: (width - 28)/tabs.length}}
            >
              <View style={styles.itemContent}>
                {e.icon}
                <Text style={[styles.label]}>
                  {e.label}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#05060a" },
  screenText: { color: "white", fontSize: 28, fontWeight: "700" },

  tabBarWrap: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: 14,
  },
  glass: {
    borderRadius: 50,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  row: {
    flexDirection: "row",
    height: 64,
    alignItems: "center",
  },
  item: {
    flex: 1,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  itemContent: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  iconWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    color: Colors.light,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  labelFocused: {
    color: "white",
  },
});
