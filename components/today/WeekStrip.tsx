import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import type { WeekDay } from "../../data/today";
import { colors, fonts } from "../../constants/theme";

type Props = { week: WeekDay[] };

export function WeekStrip({ week }: Props) {
  const trained = week.filter((d) => d.trained === true).length;

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.title}>Training</Text>
        <Text style={styles.meta}>{trained} this week</Text>
      </View>
      <View style={styles.row}>
        {week.map((day) => {
          const on = day.trained === true;
          const future = day.trained === null;
          return (
            <View key={day.key} style={styles.day}>
              <Ionicons
                name={on ? "flame" : "flame-outline"}
                size={on ? 18 : 16}
                color={
                  on
                    ? "#E53935"
                    : future
                      ? colors.border
                      : "rgba(229,57,53,0.35)"
                }
                style={day.isToday ? styles.today : undefined}
              />
              <Text style={[styles.label, day.isToday && styles.labelToday]}>
                {day.label}
              </Text>
            </View>
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
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  day: {
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  today: {
    opacity: 1,
  },
  label: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: colors.textMuted,
  },
  labelToday: {
    color: colors.text,
    fontFamily: fonts.bodyBold,
  },
});

