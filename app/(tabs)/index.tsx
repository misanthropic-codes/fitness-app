import { StyleSheet, Text, View } from "react-native";
import { Screen } from "../../components/Screen";
import { colors } from "../../constants/theme";

export default function TodayScreen() {
  return (
    <Screen title="Today" subtitle="Daily totals, remaining targets, and quick status.">
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Nutrition</Text>
        <Text style={styles.cardValue}>No meals logged yet</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Activity</Text>
        <Text style={styles.cardValue}>No workouts logged yet</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.primary,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  cardValue: {
    fontSize: 16,
    color: colors.text,
  },
});
