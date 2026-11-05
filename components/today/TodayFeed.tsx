import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import type { ComponentProps } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { TodayLogEntry } from "../../data/today";
import { colors, fonts, radii } from "../../constants/theme";

type Props = { entries: TodayLogEntry[] };
type IconName = ComponentProps<typeof Ionicons>["name"];
type Kind = TodayLogEntry["kind"];

const KIND_META: Record<Kind, { label: string; icon: IconName; iconOn: IconName }> = {
  meal: { label: "Food", icon: "restaurant-outline", iconOn: "restaurant" },
  weight: { label: "Weight", icon: "scale-outline", iconOn: "scale" },
  workout: { label: "Train", icon: "barbell-outline", iconOn: "barbell" },
  alcohol: { label: "Drink", icon: "wine-outline", iconOn: "wine" },
  smoking: { label: "Smoke", icon: "flame-outline", iconOn: "flame" },
};

const TRACK: Kind[] = ["meal", "weight", "workout", "alcohol", "smoking"];

export function TodayFeed({ entries }: Props) {
  const byKind = TRACK.map((kind) => ({
    kind,
    ...KIND_META[kind],
    items: entries.filter((e) => e.kind === kind),
  }));

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.title}>Logged today</Text>
        <Text style={styles.meta}>
          {entries.length === 0 ? "Nothing yet" : `${entries.length} logged`}
        </Text>
      </View>

      <View style={styles.list}>
        {byKind.map(({ kind, label, icon, iconOn, items }, index) => {
          const done = items.length > 0;
          const latest = items[items.length - 1];
          const last = index === byKind.length - 1;

          return (
            <Pressable
              key={kind}
              onPress={() => router.push("/log")}
              accessibilityRole="button"
              accessibilityLabel={done ? `${label}, ${latest.title}` : `Log ${label}`}
              style={({ pressed }) => [
                styles.row,
                last && styles.rowLast,
                pressed && styles.pressed,
              ]}
            >
              <View style={[styles.iconWrap, done && styles.iconWrapDone]}>
                <Ionicons
                  name={done ? iconOn : icon}
                  size={18}
                  color={done ? colors.primary : colors.textMuted}
                />
              </View>

              <View style={styles.main}>
                <Text style={styles.label}>{label}</Text>
                <Text style={styles.detail} numberOfLines={1}>
                  {done ? latest.title : "Not logged"}
                </Text>
              </View>

              <Text style={[styles.trailing, done && styles.trailingDone]}>
                {done ? latest.time : "+"}
              </Text>
            </Pressable>
          );
        })}
      </View>
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
    fontSize: 13,
    color: colors.textMuted,
  },
  list: {
    borderRadius: radii.md,
    backgroundColor: "rgba(255,255,255,0.72)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  pressed: {
    backgroundColor: "rgba(31,79,63,0.04)",
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(20,32,27,0.05)",
  },
  iconWrapDone: {
    backgroundColor: colors.primaryMuted,
  },
  main: {
    flex: 1,
  },
  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.text,
  },
  detail: {
    marginTop: 2,
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
  },
  trailing: {
    fontFamily: fonts.bodyBold,
    fontSize: 18,
    color: colors.primary,
    minWidth: 28,
    textAlign: "right",
  },
  trailingDone: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.textMuted,
  },
});
