import { useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { TodaySnapshot } from "../../data/today";
import { colors, fonts, radii } from "../../constants/theme";
import { CardExpandOverlay, type CardOrigin } from "./CardExpandOverlay";

type Props = { data: TodaySnapshot };

type Period = "week" | "month" | "year";
type Metric = "alcohol" | "cigarettes";

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

function sum(values: number[]) {
  return values.reduce((a, b) => a + b, 0);
}

function LifestyleFace({ data }: { data: TodaySnapshot }) {
  return (
    <View style={styles.face}>
      <View style={styles.top}>
        <Text style={styles.eyebrow}>Lifestyle</Text>
        <Text style={styles.expandGhost}>Expand</Text>
      </View>
      <View style={styles.pairRow}>
        <View style={[styles.pair, styles.pairGrow]}>
          <Text style={styles.pairLabel}>Alcohol</Text>
          <Text style={styles.pairValueLg}>
            {data.alcoholServings === 0 ? "0" : data.alcoholServings}
          </Text>
          <Text style={styles.pairHint}>
            {data.alcoholServings === 0
              ? "alcohol-free"
              : `~${Math.round(data.alcoholEthanolG)}g ethanol`}
          </Text>
        </View>
        <View style={[styles.pair, styles.pairGrow]}>
          <Text style={styles.pairLabel}>Smoking</Text>
          <Text style={styles.pairValueLg}>
            {data.cigarettes === 0 ? "0" : data.cigarettes}
          </Text>
          <Text style={styles.pairHint}>
            {data.cigarettes === 0 ? "smoke-free" : "logged today"}
          </Text>
        </View>
      </View>
    </View>
  );
}

function MiniBars({
  points,
  metric,
}: {
  points: { label: string; alcohol: number; cigarettes: number }[];
  metric: Metric;
}) {
  const values = points.map((p) => (metric === "alcohol" ? p.alcohol : p.cigarettes));
  const max = Math.max(...values, 1);

  return (
    <View style={styles.chart}>
      {points.map((point, i) => {
        const value = values[i] ?? 0;
        const height = Math.max(value > 0 ? 6 : 4, (value / max) * 96);
        return (
          <View key={`${point.label}-${i}`} style={styles.barCol}>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  value === 0 && styles.barFillZero,
                  { height },
                ]}
              />
            </View>
            <Text style={styles.barLabel}>{point.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

function LifestyleExpanded({ data }: { data: TodaySnapshot }) {
  const [period, setPeriod] = useState<Period>("week");
  const [metric, setMetric] = useState<Metric>("alcohol");
  const series = data.lifestyleHistory[period];

  const stats = useMemo(() => {
    const alcohol = sum(series.map((p) => p.alcohol));
    const cigarettes = sum(series.map((p) => p.cigarettes));
    const clearDays = series.filter((p) => p.alcohol === 0 && p.cigarettes === 0).length;
    return { alcohol, cigarettes, clearDays, total: series.length };
  }, [series]);

  return (
    <View style={styles.body}>
      <View style={styles.sheetHeader}>
        <Text style={styles.sheetTitle}>Lifestyle</Text>
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
          <Text style={styles.avgLabel}>Alcohol</Text>
          <Text style={styles.avgValue}>{stats.alcohol}</Text>
          <Text style={styles.avgHint}>servings</Text>
        </View>
        <View style={styles.avgCard}>
          <Text style={styles.avgLabel}>Smoking</Text>
          <Text style={styles.avgValue}>{stats.cigarettes}</Text>
          <Text style={styles.avgHint}>cigarettes</Text>
        </View>
        <View style={styles.avgCard}>
          <Text style={styles.avgLabel}>Clear</Text>
          <Text style={styles.avgValue}>
            {stats.clearDays}
            <Text style={styles.avgSlash}>/{stats.total}</Text>
          </Text>
          <Text style={styles.avgHint}>free days</Text>
        </View>
      </View>

      <View style={styles.metricSwitch}>
        <Pressable
          onPress={() => setMetric("alcohol")}
          style={[styles.metricChip, metric === "alcohol" && styles.metricChipOn]}
        >
          <Text
            style={[
              styles.metricChipText,
              metric === "alcohol" && styles.metricChipTextOn,
            ]}
          >
            Alcohol
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setMetric("cigarettes")}
          style={[styles.metricChip, metric === "cigarettes" && styles.metricChipOn]}
        >
          <Text
            style={[
              styles.metricChipText,
              metric === "cigarettes" && styles.metricChipTextOn,
            ]}
          >
            Smoking
          </Text>
        </Pressable>
      </View>

      <MiniBars points={series} metric={metric} />

      <View style={styles.note}>
        <Text style={styles.noteText}>
          Today:{" "}
          {data.alcoholServings === 0 && data.cigarettes === 0
            ? "clear — keep the streak going."
            : [
                data.alcoholServings > 0
                  ? `${data.alcoholServings} drink${data.alcoholServings === 1 ? "" : "s"}`
                  : null,
                data.cigarettes > 0
                  ? `${data.cigarettes} cigarette${data.cigarettes === 1 ? "" : "s"}`
                  : null,
              ]
                .filter(Boolean)
                .join(" · ")}
        </Text>
      </View>
    </View>
  );
}

export function LifestyleCard({ data }: Props) {
  const cardRef = useRef<Measurable | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [origin, setOrigin] = useState<CardOrigin | null>(null);

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
          <Text style={styles.eyebrow}>Lifestyle</Text>
          <Pressable
            onPress={open}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Expand lifestyle stats"
          >
            <Text style={styles.expand}>Expand</Text>
          </Pressable>
        </View>

        <View style={styles.pairRow}>
          <View style={[styles.pair, styles.pairGrow]}>
            <Text style={styles.pairLabel}>Alcohol</Text>
            <Text style={styles.pairValueLg}>
              {data.alcoholServings === 0 ? "0" : data.alcoholServings}
            </Text>
            <Text style={styles.pairHint}>
              {data.alcoholServings === 0
                ? "alcohol-free"
                : `~${Math.round(data.alcoholEthanolG)}g ethanol`}
            </Text>
          </View>
          <View style={[styles.pair, styles.pairGrow]}>
            <Text style={styles.pairLabel}>Smoking</Text>
            <Text style={styles.pairValueLg}>
              {data.cigarettes === 0 ? "0" : data.cigarettes}
            </Text>
            <Text style={styles.pairHint}>
              {data.cigarettes === 0 ? "smoke-free" : "logged today"}
            </Text>
          </View>
        </View>
      </View>

      <CardExpandOverlay
        visible={expanded}
        origin={origin}
        onClose={() => setExpanded(false)}
        face={<LifestyleFace data={data} />}
      >
        <LifestyleExpanded data={data} />
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
    marginBottom: 14,
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
  pairRow: { flexDirection: "row", gap: 14, flex: 1 },
  pair: {},
  pairGrow: { flex: 1, justifyContent: "center" },
  pairLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 2,
  },
  pairValueLg: {
    fontFamily: fonts.display,
    fontSize: 36,
    lineHeight: 40,
    letterSpacing: -0.5,
    color: colors.text,
  },
  pairHint: {
    marginTop: 4,
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
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
    gap: 8,
    marginBottom: 14,
  },
  avgCard: {
    flex: 1,
    padding: 12,
    borderRadius: radii.md,
    backgroundColor: "rgba(255,255,255,0.75)",
  },
  avgLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 2,
  },
  avgValue: {
    fontFamily: fonts.bodyBold,
    fontSize: 20,
    color: colors.text,
  },
  avgSlash: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
  },
  avgHint: {
    marginTop: 2,
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textMuted,
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
  barFillZero: {
    backgroundColor: "rgba(20,32,27,0.12)",
  },
  barLabel: {
    marginTop: 6,
    fontFamily: fonts.bodyMedium,
    fontSize: 10,
    color: colors.textMuted,
  },
  note: {
    marginTop: "auto",
    paddingTop: 16,
  },
  noteText: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
  },
});
