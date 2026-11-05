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
import { TodayInsightSection } from "../../components/today/TodayInsight";
import { WeekStrip } from "../../components/today/WeekStrip";
import { FLOATING_TAB_BAR_GAP, FLOATING_TAB_BAR_HEIGHT } from "../../constants/layout";
import { colors, fonts } from "../../constants/theme";
import {
  emptyToday,
  todaysQuote,
  type TodaySnapshot,
} from "../../data/today";

function formatToday() {
  return new Date().toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

/** Quote until insight.oneLiner lands — same slot, crossfades when data arrives. */
function HeroLine({ insight }: { insight: TodaySnapshot["insight"] }) {
  const quote = todaysQuote();
  const personalized = Boolean(insight?.oneLiner);
  const line = insight?.oneLiner ?? quote.text;
  const by = personalized ? "for you" : quote.by;
  const opacity = useRef(new Animated.Value(1)).current;
  const prevKey = useRef(insight?.oneLiner ?? quote.text);

  useEffect(() => {
    const next = insight?.oneLiner ?? quote.text;
    if (next === prevKey.current) return;
    prevKey.current = next;
    opacity.setValue(0);
    Animated.timing(opacity, {
      toValue: 1,
      duration: 320,
      useNativeDriver: true,
    }).start();
  }, [insight?.oneLiner, quote.text, opacity]);

  const content = (
    <Animated.View style={[styles.quote, { opacity }]}>
      <Text style={[styles.quoteText, personalized && styles.quoteTextInsight]}>
        {personalized ? line : `“${line}”`}
      </Text>
      <Text style={styles.quoteBy}>— {by}</Text>
    </Animated.View>
  );

  if (!personalized) return content;

  return (
    <Pressable onPress={() => router.push("/insights")} accessibilityRole="button">
      {content}
    </Pressable>
  );
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

          <HeroLine insight={data.insight} />

          <StatsCardStack data={data} />
          <WeekStrip week={data.week} />
          <TodayFeed entries={data.entries} />
          <TodayInsightSection insight={data.insight} />
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
  quote: {
    marginTop: 10,
    marginBottom: 2,
  },
  quoteText: {
    fontFamily: fonts.displayItalic,
    fontSize: 16,
    lineHeight: 22,
    color: colors.text,
  },
  quoteTextInsight: {
    fontFamily: fonts.display,
    fontStyle: "normal",
  },
  quoteBy: {
    marginTop: 4,
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.textMuted,
  },
});
