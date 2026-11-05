import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useRef } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { StatsCardStack } from "../../components/today/StatsCardStack";
import { TodayFeed } from "../../components/today/TodayFeed";
import { WeekStrip } from "../../components/today/WeekStrip";
import { FLOATING_TAB_BAR_GAP, FLOATING_TAB_BAR_HEIGHT } from "../../constants/layout";
import { colors, fonts } from "../../constants/theme";
import { emptyToday } from "../../data/today";

function formatToday() {
  return new Date().toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export default function TodayScreen() {
  const data = emptyToday;
  const insets = useSafeAreaInsets();
  const fade = useRef(new Animated.Value(0)).current;
  const rise = useRef(new Animated.Value(14)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 420, useNativeDriver: true }),
      Animated.timing(rise, { toValue: 0, duration: 420, useNativeDriver: true }),
    ]).start();
  }, [fade, rise]);

  const bottomPad =
    Platform.OS === "android"
      ? FLOATING_TAB_BAR_HEIGHT + FLOATING_TAB_BAR_GAP + Math.max(insets.bottom, 10) + 24
      : 32;

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.backgroundDeep, colors.background, "#F6F1E8"]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <Animated.ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: bottomPad }]}
          showsVerticalScrollIndicator={false}
          contentInsetAdjustmentBehavior="automatic"
          style={{ opacity: fade, transform: [{ translateY: rise }] }}
        >
          <View style={styles.topRow}>
            <Text style={styles.brand}>Today</Text>
            <Text style={styles.date}>{formatToday()}</Text>
          </View>

          <StatsCardStack data={data} />
          <WeekStrip week={data.week} />
          <TodayFeed entries={data.entries} />

          <View style={styles.insight}>
            <View style={styles.header}>
              <Text style={styles.sectionTitle}>Insight</Text>
              <Pressable onPress={() => router.push("/insights")} hitSlop={8}>
                <Text style={styles.sectionAction}>Open</Text>
              </Pressable>
            </View>
            <Text style={styles.insightBody}>
              {data.insight?.body ?? "No insight yet — needs logged data first."}
            </Text>
          </View>
        </Animated.ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safe: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 14,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
  },
  brand: {
    fontFamily: fonts.display,
    fontSize: 36,
    lineHeight: 40,
    color: colors.primary,
  },
  date: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.textMuted,
  },
  insight: {
    marginTop: 28,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 8,
  },
  sectionTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.text,
  },
  sectionAction: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.primary,
  },
  insightBody: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textMuted,
  },
});
