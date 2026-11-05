import { useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { TodaySnapshot } from "../../data/today";
import { colors, fonts, radii } from "../../constants/theme";
import { CardExpandOverlay, type CardOrigin } from "./CardExpandOverlay";
import { WeightLineChart } from "./WeightLineChart";

type Props = { data: TodaySnapshot };

type Period = "week" | "month" | "year";

type Measurable = {
  measureInWindow: (
    callback: (x: number, y: number, width: number, height: number) => void,
  ) => void;
};

const PERIODS: { key: Period; label: string }[] = [
  { key: "week", label: "Week" },
  { key: "month", label: "Month" },
  { key: "year", label: "Year" },
];

function avg(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function BodyFace({ data }: { data: TodaySnapshot }) {
  const weekAvg = avg(data.weightHistory.week.map((p) => p.kg));
  const delta =
    data.weightKg == null ? null : data.weightKg - data.weightTargetKg;

  return (
    <View style={styles.face}>
      <View style={styles.top}>
        <Text style={styles.eyebrow}>Body</Text>
        <Text style={styles.expandGhost}>Expand</Text>
      </View>
      <Text style={styles.bigNumber}>
        {data.weightKg == null ? "—" : data.weightKg.toFixed(1)}
      </Text>
      <Text style={styles.bigUnit}>kg today</Text>
      <View style={styles.pairRow}>
        <View style={styles.pair}>
          <Text style={styles.pairLabel}>7-day avg</Text>
          <Text style={styles.pairValue}>
            {weekAvg > 0 ? `${weekAvg.toFixed(1)}` : "—"}
          </Text>
        </View>
        <View style={styles.pair}>
          <Text style={styles.pairLabel}>vs target</Text>
          <Text style={styles.pairValue}>
            {delta == null
              ? "—"
              : `${delta > 0 ? "+" : ""}${delta.toFixed(1)}`}
          </Text>
        </View>
      </View>
    </View>
  );
}

function BodyExpanded({ data }: { data: TodaySnapshot }) {
  const [period, setPeriod] = useState<Period>("week");
  const series = data.weightHistory[period];
  const stats = useMemo(() => {
    const values = series.map((p) => p.kg);
    const mean = avg(values);
    const delta = values.length >= 2 ? values[values.length - 1]! - values[0]! : 0;
    return { mean, delta };
  }, [series]);

  return (
    <View style={styles.body}>
      <View style={styles.sheetHeader}>
        <Text style={styles.sheetTitle}>Body</Text>
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
          <Text style={styles.avgLabel}>Avg weight</Text>
          <Text style={styles.avgValue}>{stats.mean.toFixed(1)} kg</Text>
        </View>
        <View style={styles.avgCard}>
          <Text style={styles.avgLabel}>Change</Text>
          <Text style={styles.avgValue}>
            {stats.delta > 0 ? "+" : ""}
            {stats.delta.toFixed(1)} kg
          </Text>
        </View>
      </View>

      <Text style={styles.chartLabel}>
        Weight · target {data.weightTargetKg.toFixed(1)} kg
      </Text>
      <WeightLineChart points={series} targetKg={data.weightTargetKg} />
    </View>
  );
}

export function BodyCard({ data }: Props) {
  const cardRef = useRef<Measurable | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [origin, setOrigin] = useState<CardOrigin | null>(null);

  const weekAvg = avg(data.weightHistory.week.map((p) => p.kg));
  const delta =
    data.weightKg == null ? null : data.weightKg - data.weightTargetKg;

  const open = () => {
    cardRef.current?.measureInWindow((x, y, width, height) => {
      setOrigin({ x, y, width, height });
      setExpanded(true);
    });
  };

  return (
    <>
      <View
        ref={cardRef as never}
        collapsable={false}
        style={styles.card}
      >
        <View style={styles.top}>
          <Text style={styles.eyebrow}>Body</Text>
          <Pressable
            onPress={open}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Expand body stats"
          >
            <Text style={styles.expand}>Expand</Text>
          </Pressable>
        </View>

        <Text style={styles.bigNumber}>
          {data.weightKg == null ? "—" : data.weightKg.toFixed(1)}
        </Text>
        <Text style={styles.bigUnit}>kg today</Text>
        <View style={styles.pairRow}>
          <View style={styles.pair}>
            <Text style={styles.pairLabel}>7-day avg</Text>
            <Text style={styles.pairValue}>
              {weekAvg > 0 ? weekAvg.toFixed(1) : "—"}
            </Text>
          </View>
          <View style={styles.pair}>
            <Text style={styles.pairLabel}>vs target</Text>
            <Text style={styles.pairValue}>
              {delta == null
                ? "—"
                : `${delta > 0 ? "+" : ""}${delta.toFixed(1)}`}
            </Text>
          </View>
        </View>
      </View>

      <CardExpandOverlay
        visible={expanded}
        origin={origin}
        onClose={() => setExpanded(false)}
        face={<BodyFace data={data} />}
      >
        <BodyExpanded data={data} />
      </CardExpandOverlay>
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
  face: { flex: 1, padding: 18 },
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
  expandGhost: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.primary,
  },
  bigNumber: {
    fontFamily: fonts.display,
    fontSize: 40,
    lineHeight: 44,
    letterSpacing: -1,
    color: colors.text,
  },
  bigUnit: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 14,
  },
  pairRow: { flexDirection: "row", gap: 14 },
  pair: { flex: 1 },
  pairLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 2,
  },
  pairValue: {
    fontFamily: fonts.bodyBold,
    fontSize: 18,
    color: colors.text,
  },
  body: { flex: 1 },
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
  closeHint: {
    opacity: 0,
    fontFamily: fonts.bodyBold,
    fontSize: 14,
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
  chartLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 6,
  },
});
