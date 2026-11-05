import { useState } from "react";
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { TodaySnapshot } from "../../data/today";
import { colors, fonts, radii } from "../../constants/theme";

type Props = { data: TodaySnapshot };

const SCREEN_W = Dimensions.get("window").width;
const GUTTER = 24;
const CARD_GAP = 10;
const CARD_W = SCREEN_W - GUTTER * 2;

function Macro({
  label,
  logged,
  target,
}: {
  label: string;
  logged: number;
  target: number;
}) {
  const ratio = target > 0 ? Math.min(logged / target, 1) : 0;
  return (
    <View style={styles.macro}>
      <Text style={styles.macroLabel}>{label}</Text>
      <Text style={styles.macroValue}>
        {logged}
        <Text style={styles.macroTarget}>/{target}g</Text>
      </Text>
      <View style={styles.trackSm}>
        <View style={[styles.fill, { width: `${ratio * 100}%` }]} />
      </View>
    </View>
  );
}

function FuelCard({ data }: Props) {
  const remaining = Math.max(data.caloriesTarget - data.caloriesLogged, 0);
  const ratio =
    data.caloriesTarget > 0
      ? Math.min(data.caloriesLogged / data.caloriesTarget, 1)
      : 0;

  return (
    <View style={styles.card}>
      <Text style={styles.cardEyebrow}>Fuel</Text>
      <View style={styles.calRow}>
        <View>
          <Text style={styles.bigNumber}>{remaining.toLocaleString()}</Text>
          <Text style={styles.bigUnit}>kcal left</Text>
        </View>
        <View style={styles.aside}>
          <Text style={styles.asideValue}>{data.caloriesLogged}</Text>
          <Text style={styles.asideLabel}>logged</Text>
          <Text style={styles.asideValue}>{data.caloriesTarget}</Text>
          <Text style={styles.asideLabel}>target</Text>
        </View>
      </View>
      <View style={styles.trackLg}>
        <View style={[styles.fill, { width: `${ratio * 100}%` }]} />
      </View>
      <View style={styles.macroRow}>
        <Macro label="Protein" logged={data.proteinLogged} target={data.proteinTarget} />
        <Macro label="Carbs" logged={data.carbsLogged} target={data.carbsTarget} />
        <Macro label="Fat" logged={data.fatLogged} target={data.fatTarget} />
      </View>
    </View>
  );
}

function MoveCard({ data }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardEyebrow}>Move</Text>
      <Text style={styles.bigNumber}>
        {data.steps == null ? "—" : data.steps.toLocaleString()}
      </Text>
      <Text style={styles.bigUnit}>steps</Text>
      <View style={styles.pairRow}>
        <View style={styles.pair}>
          <Text style={styles.pairLabel}>Workout</Text>
          <Text style={styles.pairValue}>
            {data.workoutMinutes > 0 ? `${data.workoutMinutes} min` : "—"}
          </Text>
        </View>
        <View style={styles.pair}>
          <Text style={styles.pairLabel}>Burn est.</Text>
          <Text style={styles.pairValue}>—</Text>
        </View>
      </View>
    </View>
  );
}

function BodyCard({ data }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardEyebrow}>Body</Text>
      <Text style={styles.bigNumber}>
        {data.weightKg == null ? "—" : data.weightKg.toFixed(1)}
      </Text>
      <Text style={styles.bigUnit}>kg today</Text>
      <View style={styles.pairRow}>
        <View style={styles.pair}>
          <Text style={styles.pairLabel}>7-day avg</Text>
          <Text style={styles.pairValue}>—</Text>
        </View>
        <View style={styles.pair}>
          <Text style={styles.pairLabel}>vs target</Text>
          <Text style={styles.pairValue}>—</Text>
        </View>
      </View>
    </View>
  );
}

function LifestyleCard({ data }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardEyebrow}>Lifestyle</Text>
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

const CARDS = [FuelCard, MoveCard, BodyCard, LifestyleCard] as const;
const LABELS = ["Fuel", "Move", "Body", "Life"];

export function StatsCardStack({ data }: Props) {
  const [index, setIndex] = useState(0);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const next = Math.round(x / (CARD_W + CARD_GAP));
    if (next !== index && next >= 0 && next < CARDS.length) setIndex(next);
  };

  return (
    <View style={styles.wrap}>
      <ScrollView
        horizontal
        decelerationRate="fast"
        snapToInterval={CARD_W + CARD_GAP}
        snapToAlignment="start"
        disableIntervalMomentum
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.row}
      >
        {CARDS.map((Card, i) => (
          <View key={LABELS[i]} style={{ width: CARD_W, marginRight: i === CARDS.length - 1 ? 0 : CARD_GAP }}>
            <Card data={data} />
          </View>
        ))}
      </ScrollView>

      <View style={styles.dots}>
        {LABELS.map((label, i) => (
          <View key={label} style={styles.dotItem}>
            <View style={[styles.dot, i === index && styles.dotActive]} />
            <Text style={[styles.dotLabel, i === index && styles.dotLabelActive]}>{label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 18,
  },
  row: {
    paddingRight: 0,
  },
  card: {
    minHeight: 210,
    padding: 18,
    borderRadius: radii.md,
    backgroundColor: "rgba(255,255,255,0.72)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  cardEyebrow: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: colors.accent,
    marginBottom: 10,
  },
  calRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  bigNumber: {
    fontFamily: fonts.display,
    fontSize: 52,
    lineHeight: 54,
    letterSpacing: -1.2,
    color: colors.text,
  },
  bigUnit: {
    marginTop: 2,
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    color: colors.primary,
  },
  aside: {
    alignItems: "flex-end",
    paddingBottom: 4,
  },
  asideValue: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.text,
  },
  asideLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 6,
  },
  trackLg: {
    marginTop: 14,
    height: 6,
    borderRadius: 99,
    backgroundColor: colors.primaryMuted,
    overflow: "hidden",
  },
  trackSm: {
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
  macroRow: {
    marginTop: 16,
    flexDirection: "row",
    gap: 12,
  },
  macro: {
    flex: 1,
  },
  macroLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 2,
  },
  macroValue: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.text,
    marginBottom: 6,
  },
  macroTarget: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
  },
  pairRow: {
    marginTop: 18,
    flexDirection: "row",
    gap: 16,
  },
  pair: {
    flex: 1,
  },
  pairGrow: {
    flex: 1,
  },
  pairLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 4,
  },
  pairValue: {
    fontFamily: fonts.bodyBold,
    fontSize: 22,
    color: colors.text,
  },
  pairValueLg: {
    fontFamily: fonts.display,
    fontSize: 40,
    lineHeight: 44,
    color: colors.text,
  },
  pairHint: {
    marginTop: 4,
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
  },
  dots: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
  },
  dotItem: {
    alignItems: "center",
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 99,
    backgroundColor: colors.primaryMuted,
  },
  dotActive: {
    backgroundColor: colors.primary,
    width: 16,
  },
  dotLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textMuted,
  },
  dotLabelActive: {
    fontFamily: fonts.bodyBold,
    color: colors.primary,
  },
});
