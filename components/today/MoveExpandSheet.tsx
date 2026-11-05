import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { TodaySnapshot } from "../../data/today";
import { colors, fonts, radii } from "../../constants/theme";
import { CardExpandOverlay, type CardOrigin } from "./CardExpandOverlay";

export type { CardOrigin };

type Period = "week" | "month" | "year";

type Props = {
  visible: boolean;
  origin: CardOrigin | null;
  data: TodaySnapshot;
  onClose: () => void;
};

const PERIODS: { key: Period; label: string }[] = [
  { key: "week", label: "Week" },
  { key: "month", label: "Month" },
  { key: "year", label: "Year" },
];

const MOVE_QUOTES = [
  { text: "The journey of a thousand miles begins with a single step.", by: "Lao Tzu" },
  { text: "Motion creates emotion — start moving, clarity follows.", by: "Tony Robbins" },
  { text: "You don’t have to be extreme, just consistent.", by: "Unknown" },
  { text: "An early-morning walk is a blessing for the whole day.", by: "Thoreau" },
  { text: "The body achieves what the mind believes.", by: "Napoleon Hill" },
  { text: "Sweat is just fat crying.", by: "Unknown" },
  { text: "Slow progress is still progress — keep stacking steps.", by: "Unknown" },
];

function avg(values: number[]) {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

function CardFace({ data }: { data: TodaySnapshot }) {
  const steps = data.steps ?? 0;
  const stepsRatio = data.stepsGoal > 0 ? Math.min(steps / data.stepsGoal, 1) : 0;
  const burnRatio =
    data.caloriesBurnGoal > 0
      ? Math.min(data.caloriesBurned / data.caloriesBurnGoal, 1)
      : 0;
  const stepsPct = Math.round(stepsRatio * 100);

  return (
    <View style={styles.face}>
      <View style={styles.faceTop}>
        <Text style={styles.eyebrow}>Move</Text>
        <Text style={styles.expandGhost}>Expand</Text>
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
  );
}

function MiniBars({
  points,
  metric,
}: {
  points: { label: string; steps: number; burn: number }[];
  metric: "steps" | "burn";
}) {
  const values = points.map((p) => (metric === "steps" ? p.steps : p.burn));
  const max = Math.max(...values, 1);

  return (
    <View style={styles.chart}>
      {points.map((point, i) => {
        const value = values[i] ?? 0;
        const height = Math.max(4, (value / max) * 96);
        return (
          <View key={`${point.label}-${i}`} style={styles.barCol}>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { height }]} />
            </View>
            <Text style={styles.barLabel}>{point.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

function ExpandedBody({ data }: { data: TodaySnapshot }) {
  const [period, setPeriod] = useState<Period>("week");
  const [metric, setMetric] = useState<"steps" | "burn">("steps");
  const series = data.moveHistory[period];
  const averages = useMemo(() => {
    const steps = avg(series.map((p) => p.steps));
    const burn = avg(series.map((p) => p.burn));
    return { steps, burn };
  }, [series]);
  const hasData = series.some((p) => p.steps > 0 || p.burn > 0);
  const quote = MOVE_QUOTES[new Date().getDate() % MOVE_QUOTES.length]!;

  return (
    <View style={styles.body}>
      <View style={styles.sheetHeader}>
        <Text style={styles.sheetTitle}>Move</Text>
        <Text style={styles.closeHint}>Close</Text>
      </View>

      <View style={styles.tabs}>
        {PERIODS.map((item) => (
          <Pressable
            key={item.key}
            onPress={() => setPeriod(item.key)}
            style={[styles.tab, period === item.key && styles.tabOn]}
          >
            <Text style={[styles.tabText, period === item.key && styles.tabTextOn]}>
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.avgRow}>
        <View style={styles.avgCard}>
          <Text style={styles.avgLabel}>Avg steps</Text>
          <Text style={styles.avgValue}>{averages.steps.toLocaleString()}</Text>
        </View>
        <View style={styles.avgCard}>
          <Text style={styles.avgLabel}>Avg burn</Text>
          <Text style={styles.avgValue}>{averages.burn} kcal</Text>
        </View>
      </View>

      <View style={styles.metricSwitch}>
        <Pressable
          onPress={() => setMetric("steps")}
          style={[styles.metricChip, metric === "steps" && styles.metricChipOn]}
        >
          <Text style={[styles.metricChipText, metric === "steps" && styles.metricChipTextOn]}>
            Steps
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setMetric("burn")}
          style={[styles.metricChip, metric === "burn" && styles.metricChipOn]}
        >
          <Text style={[styles.metricChipText, metric === "burn" && styles.metricChipTextOn]}>
            Burn
          </Text>
        </Pressable>
      </View>

      {hasData ? (
        <MiniBars points={series} metric={metric} />
      ) : (
        <View style={styles.emptyChart}>
          <Text style={styles.emptyChartText}>
            No {period} move history yet — bars fill as steps and burn sync in.
          </Text>
        </View>
      )}

      <View style={styles.quoteBlock}>
        <Text style={styles.quoteMark}>“</Text>
        <Text style={styles.quoteText}>{quote.text}</Text>
        <Text style={styles.quoteBy}>— {quote.by}</Text>
      </View>
    </View>
  );
}

export function MoveExpandSheet({ visible, origin, data, onClose }: Props) {
  return (
    <CardExpandOverlay
      visible={visible}
      origin={origin}
      onClose={onClose}
      face={<CardFace data={data} />}
    >
      <ExpandedBody data={data} />
    </CardExpandOverlay>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1 },
  quoteBlock: {
    marginTop: "auto",
    paddingTop: 18,
    paddingBottom: 4,
  },
  quoteMark: {
    fontFamily: fonts.display,
    fontSize: 36,
    lineHeight: 28,
    color: colors.primary,
    opacity: 0.35,
  },
  quoteText: {
    fontFamily: fonts.display,
    fontSize: 17,
    lineHeight: 24,
    color: colors.text,
    marginTop: 2,
  },
  quoteBy: {
    marginTop: 8,
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.textMuted,
  },
  closeHint: {
    opacity: 0,
    fontFamily: fonts.bodyBold,
    fontSize: 14,
  },
  face: { flex: 1, padding: 18 },
  faceTop: {
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
  expandGhost: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.primary,
  },
  metricBlock: { marginBottom: 16 },
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
  split: { flexDirection: "row", gap: 14 },
  splitItem: { flex: 1 },
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
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sheetTitle: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.primary,
  },
  tabs: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: radii.lg,
    backgroundColor: "rgba(255,255,255,0.7)",
  },
  tabOn: { backgroundColor: colors.primary },
  tabText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.textMuted,
  },
  tabTextOn: {
    color: "#F6F1E8",
    fontFamily: fonts.bodyBold,
  },
  avgRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  avgCard: {
    flex: 1,
    padding: 14,
    borderRadius: radii.md,
    backgroundColor: "rgba(255,255,255,0.75)",
  },
  avgLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 4,
  },
  avgValue: {
    fontFamily: fonts.bodyBold,
    fontSize: 22,
    color: colors.text,
  },
  metricSwitch: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  metricChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.lg,
    backgroundColor: "rgba(255,255,255,0.7)",
  },
  metricChipOn: { backgroundColor: colors.primaryMuted },
  metricChipText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.textMuted,
  },
  metricChipTextOn: {
    color: colors.primary,
    fontFamily: fonts.bodyBold,
  },
  chart: {
    height: 140,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingTop: 8,
    gap: 4,
  },
  barCol: { flex: 1, alignItems: "center" },
  barTrack: {
    height: 100,
    width: "70%",
    justifyContent: "flex-end",
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: colors.primaryMuted,
  },
  barFill: {
    width: "100%",
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  barLabel: {
    marginTop: 6,
    fontFamily: fonts.bodyMedium,
    fontSize: 10,
    color: colors.textMuted,
  },
  emptyChart: {
    height: 140,
    borderRadius: radii.md,
    backgroundColor: "rgba(255,255,255,0.55)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  emptyChartText: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
    textAlign: "center",
  },
});
