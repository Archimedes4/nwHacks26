import * as React from "react";
import { View, Text, Pressable, StyleSheet, LayoutChangeEvent } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";

export type LiquidGlassTabItem = {
  key: string;
  label: string;
  icon?: React.ReactNode;
  onPress?: () => void;
};

type LiquidGlassTabBarProps = Partial<BottomTabBarProps> & {
  tabs?: LiquidGlassTabItem[];
  activeIndex?: number;
  onChange?: (index: number) => void;
};

/**
 * Liquid-glass tab bar:
 * - Glass background: BlurView + translucent border
 * - Liquid indicator: animated pill that stretches toward the next tab then settles
 */
export default function LiquidGlassTabBar({
  state,
  descriptors,
  navigation,
  tabs,
  activeIndex,
  onChange,
}: LiquidGlassTabBarProps) {
  const derivedTabs = React.useMemo<LiquidGlassTabItem[]>(() => {
    if (state && descriptors) {
      return state.routes.map((route) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : route.name;
        const icon =
          typeof options.tabBarIcon === "function"
            ? options.tabBarIcon({
                focused: state.index === state.routes.findIndex((r) => r.key === route.key),
                color: "white",
                size: 22,
              })
            : undefined;
        return {
          key: route.key,
          label: String(label),
          icon,
        };
      });
    }
    return tabs ?? [];
  }, [state, descriptors, tabs]);

  const [internalIndex, setInternalIndex] = React.useState(0);
  const resolvedIndex = state?.index ?? activeIndex ?? internalIndex;

  const [layouts, setLayouts] = React.useState<{ x: number; width: number }[]>(
    Array(derivedTabs.length).fill({ x: 0, width: 0 })
  );

  const indicatorX = useSharedValue(0);
  const indicatorW = useSharedValue(56);
  const squish = useSharedValue(1);

  React.useEffect(() => {
    setLayouts(Array(derivedTabs.length).fill({ x: 0, width: 0 }));
    if (resolvedIndex >= derivedTabs.length) {
      setInternalIndex(0);
    }
  }, [derivedTabs.length, resolvedIndex]);

  // When active tab changes, animate indicator to the correct position
  React.useEffect(() => {
    const l = layouts[resolvedIndex];
    if (!l || l.width === 0) return;

    const targetW = Math.max(56, l.width * 0.62);
    const targetX = l.x + (l.width - targetW) / 2;

    // “Liquid” move: stretch (wider) while traveling, then settle
    const prevX = indicatorX.value;
    const travel = Math.abs(targetX - prevX);

    // stretch amount based on distance
    const stretch = Math.min(1.25, 1 + travel / 500);

    indicatorW.value = withTiming(targetW * stretch, { duration: 160 }, () => {
      indicatorW.value = withSpring(targetW, { damping: 16, stiffness: 220 });
    });

    indicatorX.value = withSpring(targetX, { damping: 18, stiffness: 200 });

    // tiny squish for “goo”
    squish.value = withTiming(0.92, { duration: 120 }, () => {
      squish.value = withSpring(1, { damping: 14, stiffness: 220 });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.index, layouts]);

  const onItemLayout = (idx: number) => (e: LayoutChangeEvent) => {
    const { x, width } = e.nativeEvent.layout;
    setLayouts((prev) => {
      const next = [...prev];
      next[idx] = { x, width };
      return next;
    });

    // initialize indicator at first render
    if (idx === resolvedIndex) {
      const targetW = Math.max(56, width * 0.62);
      indicatorW.value = targetW;
      indicatorX.value = x + (width - targetW) / 2;
    }
  };

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
        <Animated.View style={[styles.indicator, indicatorStyle]}>
          {/* highlight sheen */}
          <View style={styles.sheen} />
        </Animated.View>

        {/* Tabs */}
        <View style={styles.row}>
          {derivedTabs.map((tab, index) => {
            const isFocused = resolvedIndex === index;
            const onPress = () => {
              if (state && navigation) {
                const route = state.routes[index];
                const event = navigation.emit({
                  type: "tabPress",
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              } else {
                setInternalIndex(index);
                onChange?.(index);
                tab.onPress?.();
              }
            };

            return (
              <Pressable
                key={tab.key}
                onPress={onPress}
                onLayout={onItemLayout(index)}
                style={styles.item}
              >
                <View style={styles.itemContent}>
                  {tab.icon ? <View style={styles.iconWrap}>{tab.icon}</View> : null}
                  <Text style={[styles.label, isFocused && styles.labelFocused]}>
                    {tab.label}
                  </Text>
                </View>
              </Pressable>
            );
          })}
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
    borderRadius: 28,
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
    color: "rgba(255,255,255,0.62)",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  labelFocused: {
    color: "white",
  },

  indicator: {
    position: "absolute",
    top: 10,
    bottom: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.20)",
    shadowColor: "#000",
    shadowOpacity: 0.22,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
  },
  sheen: {
    position: "absolute",
    left: 10,
    right: 10,
    top: 6,
    height: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.22)",
  },
});
