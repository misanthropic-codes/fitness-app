import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import type { ComponentProps } from "react";
import { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { FLOATING_TAB_BAR_GAP, FLOATING_TAB_BAR_HEIGHT } from "../constants/layout";
import { colors } from "../constants/theme";

type IconName = ComponentProps<typeof Ionicons>["name"];

type TabRoute = { key: string; name: string };

type Props = {
  state: { index: number; routes: TabRoute[] };
  descriptors: Record<
    string,
    { options: { title?: string; tabBarAccessibilityLabel?: string } }
  >;
  emitter: {
    emit: (event: {
      type: "tabPress";
      target: string;
      canPreventDefault: true;
    }) => { defaultPrevented: boolean };
  };
  navigateToTab: (routeKey: string) => void;
  insets: { bottom: number };
};

type Cell = { x: number; width: number };

type Measurable = {
  measureInWindow: (
    callback: (x: number, y: number, width: number, height: number) => void,
  ) => void;
};

const TABS: Record<string, { label: string; outline: IconName; solid: IconName }> = {
  index: { label: "Today", outline: "sunny-outline", solid: "sunny" },
  log: { label: "Log", outline: "add-circle-outline", solid: "add-circle" },
  insights: { label: "Insights", outline: "analytics-outline", solid: "analytics" },
  profile: { label: "Profile", outline: "person-outline", solid: "person" },
};

function TabItem({
  focused,
  label,
  outline,
  solid,
  accessibilityLabel,
  onPress,
  onMount,
}: {
  focused: boolean;
  label: string;
  outline: IconName;
  solid: IconName;
  accessibilityLabel: string;
  onPress: () => void;
  onMount: (node: Measurable | null) => void;
}) {
  const progress = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(progress, {
      toValue: focused ? 1 : 0,
      useNativeDriver: false,
      tension: 260,
      friction: 22,
    }).start();
  }, [focused, progress]);

  return (
    <Animated.View
      // Animated.View ref is weakly typed; we only need measureInWindow for scrub hit-testing.
      ref={onMount as never}
      collapsable={false}
      style={[
        styles.item,
        {
          flexGrow: progress,
          backgroundColor: progress.interpolate({
            inputRange: [0, 1],
            outputRange: ["rgba(183,222,210,0)", colors.tabIndicator],
          }),
          paddingHorizontal: progress.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 16],
          }),
        },
      ]}
    >
      <Pressable
        onPress={onPress}
        accessibilityRole="tab"
        accessibilityState={{ selected: focused }}
        accessibilityLabel={accessibilityLabel}
        style={styles.hit}
      >
        <Ionicons
          name={focused ? solid : outline}
          size={22}
          color={focused ? colors.tabActive : colors.tabInactive}
        />
        <Animated.View
          style={{
            maxWidth: progress.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 80],
            }),
            opacity: progress.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0, 0, 1],
            }),
            marginLeft: progress.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 8],
            }),
            overflow: "hidden",
          }}
        >
          <Text style={styles.label} numberOfLines={1}>
            {label}
          </Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

function indexAtPageX(pageX: number, cells: Cell[]) {
  for (let i = 0; i < cells.length; i++) {
    const cell = cells[i];
    if (!cell || cell.width <= 0) continue;
    if (pageX >= cell.x && pageX < cell.x + cell.width) return i;
  }

  let best = -1;
  let bestDist = Number.POSITIVE_INFINITY;
  for (let i = 0; i < cells.length; i++) {
    const cell = cells[i];
    if (!cell || cell.width <= 0) continue;
    const dist = Math.abs(pageX - (cell.x + cell.width / 2));
    if (dist < bestDist) {
      bestDist = dist;
      best = i;
    }
  }
  return best;
}

export function FloatingTabBar({ state, descriptors, emitter, navigateToTab, insets }: Props) {
  const scrubIndexRef = useRef(state.index);
  const didScrubRef = useRef(false);
  const routesRef = useRef(state.routes);
  const itemRefs = useRef<Array<Measurable | null>>([]);
  const scrubCellsRef = useRef<Cell[]>([]);
  routesRef.current = state.routes;

  useEffect(() => {
    scrubIndexRef.current = state.index;
  }, [state.index]);

  const selectIndex = (index: number) => {
    const route = routesRef.current[index];
    if (!route || index === scrubIndexRef.current) return;

    scrubIndexRef.current = index;
    const event = emitter.emit({
      type: "tabPress",
      target: route.key,
      canPreventDefault: true,
    });
    if (!event.defaultPrevented) {
      void Haptics.selectionAsync();
      navigateToTab(route.key);
    }
  };

  const snapshotCells = (pageX: number, then: (x: number) => void) => {
    const n = routesRef.current.length;
    if (n === 0) return;

    let pending = n;
    const next: Cell[] = new Array(n);

    for (let i = 0; i < n; i++) {
      const node = itemRefs.current[i];
      if (!node?.measureInWindow) {
        next[i] = { x: 0, width: 0 };
        pending -= 1;
        if (pending === 0) {
          scrubCellsRef.current = next;
          then(pageX);
        }
        continue;
      }

      node.measureInWindow((x, _y, width) => {
        next[i] = { x, width };
        pending -= 1;
        if (pending === 0) {
          scrubCellsRef.current = next;
          then(pageX);
        }
      });
    }
  };

  const pan = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) =>
          Math.abs(g.dx) > 6 && Math.abs(g.dx) > Math.abs(g.dy),
        onPanResponderGrant: (e) => {
          didScrubRef.current = true;
          snapshotCells(e.nativeEvent.pageX, (pageX) => {
            const next = indexAtPageX(pageX, scrubCellsRef.current);
            if (next >= 0) selectIndex(next);
          });
        },
        onPanResponderMove: (e) => {
          didScrubRef.current = true;
          // Keep zones frozen from grant so chip expansion doesn't steal the finger.
          const next = indexAtPageX(e.nativeEvent.pageX, scrubCellsRef.current);
          if (next >= 0) selectIndex(next);
        },
        onPanResponderRelease: () => {
          setTimeout(() => {
            didScrubRef.current = false;
          }, 40);
        },
        onPanResponderTerminate: () => {
          didScrubRef.current = false;
        },
      }),
    [emitter, navigateToTab],
  );

  return (
    <View
      pointerEvents="box-none"
      style={[styles.host, { paddingBottom: Math.max(insets.bottom, 12) + FLOATING_TAB_BAR_GAP }]}
    >
      <View style={styles.dock}>
        <BlurView intensity={42} tint="light" style={StyleSheet.absoluteFill} />
        <View style={styles.dockTint} />
        <View style={styles.row} accessibilityRole="tablist" {...pan.panHandlers}>
          {state.routes.map((route, index) => {
            const focused = state.index === index;
            const meta = TABS[route.name] ?? {
              label: route.name,
              outline: "ellipse-outline" as const,
              solid: "ellipse" as const,
            };
            const label =
              typeof descriptors[route.key]?.options.title === "string"
                ? descriptors[route.key].options.title!
                : meta.label;

            const onPress = () => {
              if (didScrubRef.current) return;
              if (focused) return;
              selectIndex(index);
            };

            return (
              <TabItem
                key={route.key}
                focused={focused}
                label={label}
                outline={meta.outline}
                solid={meta.solid}
                accessibilityLabel={
                  descriptors[route.key]?.options.tabBarAccessibilityLabel ?? label
                }
                onPress={onPress}
                onMount={(node) => {
                  itemRefs.current[index] = node;
                }}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
  },
  dock: {
    height: FLOATING_TAB_BAR_HEIGHT,
    width: "90%",
    maxWidth: 400,
    borderRadius: 36,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.55)",
    elevation: 10,
    shadowColor: "#0E4A3E",
    shadowOpacity: 0.18,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
  },
  dockTint: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(255,255,255,0.72)",
  },
  row: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    gap: 4,
  },
  item: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: "hidden",
  },
  hit: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.2,
    color: colors.tabActive,
  },
});
