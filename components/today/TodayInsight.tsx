import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { TodayInsight as Insight } from "../../data/today";
import { colors, fonts } from "../../constants/theme";

type Props = { insight: Insight | null };

export function TodayInsightSection({ insight }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.title}>Insight</Text>
        <Pressable onPress={() => router.push("/insights")} hitSlop={8}>
          <Text style={styles.link}>Open</Text>
        </Pressable>
      </View>

      {!insight ? (
        <Pressable
          onPress={() => router.push("/log")}
          accessibilityRole="button"
          accessibilityLabel="Log to unlock insights"
          style={({ pressed }) => [pressed && styles.pressed]}
        >
          <Text style={styles.headline}>Waiting on your logs</Text>
          <Text style={styles.body}>
            A few days of meals, training, or weight is enough to explain what
            changed — and what to try next.
          </Text>
          <Text style={styles.link}>Add a log</Text>
        </Pressable>
      ) : (
        <Pressable
          onPress={() => router.push("/insights")}
          accessibilityRole="button"
          accessibilityLabel="Open insight detail"
          style={({ pressed }) => [pressed && styles.pressed]}
        >
          <Text style={styles.meta}>
            {insight.periodLabel}
            {"  ·  "}
            {insight.confidence} confidence
          </Text>
          <Text style={styles.headline}>{insight.title}</Text>
          <Text style={styles.body}>{insight.body}</Text>
          {insight.actions[0] ? (
            <Text style={styles.next}>Next — {insight.actions[0]}</Text>
          ) : null}
          <Text style={styles.link}>Read full insight</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 28,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 12,
  },
  title: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.text,
  },
  meta: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 8,
  },
  headline: {
    fontFamily: fonts.display,
    fontSize: 24,
    lineHeight: 28,
    color: colors.text,
  },
  body: {
    marginTop: 8,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textMuted,
    maxWidth: 340,
  },
  next: {
    marginTop: 14,
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
  },
  link: {
    marginTop: 14,
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.primary,
  },
  pressed: {
    opacity: 0.75,
  },
});
