import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { TodayLogEntry } from "../../data/today";
import { colors, fonts, radii } from "../../constants/theme";

type Props = { entries: TodayLogEntry[] };

export function TodayFeed({ entries }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.title}>Logged today</Text>
        {entries.length > 0 ? (
          <Text style={styles.meta}>{entries.length}</Text>
        ) : null}
      </View>

      {entries.length === 0 ? (
        <Pressable
          onPress={() => router.push("/log")}
          accessibilityRole="button"
          accessibilityLabel="Add first log"
          style={({ pressed }) => [styles.empty, pressed && styles.pressed]}
        >
          <Text style={styles.emptyTitle}>Your day is blank</Text>
          <Text style={styles.emptyBody}>
            Meals, training, weight, and lifestyle will land here.
          </Text>
          <Text style={styles.emptyCta}>Add first log</Text>
        </Pressable>
      ) : (
        <View style={styles.list}>
          {entries.map((entry, index) => (
            <View
              key={entry.id}
              style={[styles.row, index === entries.length - 1 && styles.rowLast]}
            >
              <View style={styles.main}>
                <Text style={styles.rowTitle}>{entry.title}</Text>
                <Text style={styles.rowDetail}>{entry.detail}</Text>
              </View>
              <Text style={styles.rowTime}>{entry.time}</Text>
            </View>
          ))}
        </View>
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
    marginBottom: 14,
  },
  title: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.text,
  },
  meta: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.primary,
  },
  empty: {
    paddingVertical: 28,
    paddingHorizontal: 20,
    borderRadius: radii.md,
    backgroundColor: "rgba(255,255,255,0.55)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    alignItems: "flex-start",
  },
  pressed: {
    opacity: 0.85,
  },
  emptyTitle: {
    fontFamily: fonts.display,
    fontSize: 22,
    lineHeight: 26,
    color: colors.text,
  },
  emptyBody: {
    marginTop: 8,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
    maxWidth: 260,
  },
  emptyCta: {
    marginTop: 16,
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.primary,
  },
  list: {
    gap: 0,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  rowLast: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  main: {
    flex: 1,
  },
  rowTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.text,
  },
  rowDetail: {
    marginTop: 3,
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
  },
  rowTime: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
});
