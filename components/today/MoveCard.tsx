import { useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { TodaySnapshot } from "../../data/today";
import { colors, fonts, radii } from "../../constants/theme";
import { MoveExpandSheet, type CardOrigin } from "./MoveExpandSheet";

type Props = { data: TodaySnapshot };

type Measurable = {
  measureInWindow: (
    callback: (x: number, y: number, width: number, height: number) => void,
  ) => void;
};

export function MoveCard({ data }: Props) {
  const cardRef = useRef<Measurable | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [origin, setOrigin] = useState<CardOrigin | null>(null);

  const steps = data.steps ?? 0;
  const stepsRatio = data.stepsGoal > 0 ? Math.min(steps / data.stepsGoal, 1) : 0;
  const burnRatio =
    data.caloriesBurnGoal > 0
      ? Math.min(data.caloriesBurned / data.caloriesBurnGoal, 1)
      : 0;
  const stepsPct = Math.round(stepsRatio * 100);

  const open = () => {
    cardRef.current?.measureInWindow((x, y, width, height) => {
      setOrigin({ x, y, width, height });
      setExpanded(true);
    });
  };

  return (
    <>
      <View
        // Animated/View ref typing is weak in RN 0.88; only need measureInWindow.
        ref={cardRef as never}
        collapsable={false}
        style={styles.card}
      >
        <View style={styles.top}>
          <Text style={styles.eyebrow}>Move</Text>
          <Pressable
            onPress={open}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Expand move stats"
          >
            <Text style={styles.expand}>Expand</Text>
          </Pressable>
        </View>

        <View style={styles.metricBlock}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricLabel}>Steps</Text>
            <Text style={styles.metricPct}>{stepsPct}% of goal</Text>
          </View>
          <Text style={styles.bigNumber}>
            {data.steps == null ? "—" : steps.toLocaleString()}
            <Text style={styles.goalInline}> / {data.stepsGoal.toLocaleString()}</Text>
          </Text>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${stepsRatio * 100}%` }]} />
          </View>
        </View>

        <View style={styles.split}>
          <View style={styles.splitItem}>
            <Text style={styles.splitLabel}>Burn</Text>
            <Text style={styles.splitValue}>
              {data.caloriesBurned}
              <Text style={styles.splitGoal}> / {data.caloriesBurnGoal}</Text>
            </Text>
            <View style={styles.trackSm}>
              <View style={[styles.fill, { width: `${burnRatio * 100}%` }]} />
            </View>
          </View>
          <View style={styles.splitItem}>
            <Text style={styles.splitLabel}>Workout</Text>
            <Text style={styles.splitValue}>
              {data.workoutMinutes > 0 ? `${data.workoutMinutes}m` : "—"}
            </Text>
            <Text style={styles.splitHint}>today</Text>
          </View>
        </View>
      </View>

      <MoveExpandSheet
        visible={expanded}
        origin={origin}
        data={data}
        onClose={() => setExpanded(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 210,
    padding: 18,
    borderRadius: radii.md,
    backgroundColor: "rgba(255,255,255,0.72)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  eyebrow: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: colors.accent,
  },
  expand: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.primary,
  },
  metricBlock: {
    marginBottom: 16,
  },
  metricHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  metricLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.textMuted,
  },
  metricPct: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: colors.primary,
  },
  bigNumber: {
    fontFamily: fonts.display,
    fontSize: 40,
    lineHeight: 44,
    letterSpacing: -1,
    color: colors.text,
  },
  goalInline: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.textMuted,
  },
  track: {
    marginTop: 10,
    height: 6,
    borderRadius: 99,
    backgroundColor: colors.primaryMuted,
    overflow: "hidden",
  },
  trackSm: {
    marginTop: 8,
    height: 3,
    borderRadius: 99,
    backgroundColor: colors.primaryMuted,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 99,
  },
  split: {
    flexDirection: "row",
    gap: 14,
  },
  splitItem: {
    flex: 1,
  },
  splitLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 2,
  },
  splitValue: {
    fontFamily: fonts.bodyBold,
    fontSize: 20,
    color: colors.text,
  },
  splitGoal: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
  },
  splitHint: {
    marginTop: 8,
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
  },
});
