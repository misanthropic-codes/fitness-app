import { Pressable, StyleSheet, Text, View } from "react-native";
import { Screen } from "../../components/Screen";
import { colors } from "../../constants/theme";

const ACTIONS = ["Food", "Weight", "Workout", "Alcohol", "Smoking"] as const;

export default function LogScreen() {
  return (
    <Screen title="Log" subtitle="Quick entry for meals, body, activity, and lifestyle.">
      <View style={styles.grid}>
        {ACTIONS.map((label) => (
          <Pressable
            key={label}
            style={({ pressed }) => [styles.action, pressed && styles.actionPressed]}
            accessibilityRole="button"
            accessibilityLabel={`Log ${label}`}
          >
            <Text style={styles.actionText}>{label}</Text>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  action: {
    width: "47%",
    backgroundColor: colors.primaryMuted,
    borderRadius: 12,
    paddingVertical: 22,
    paddingHorizontal: 14,
    alignItems: "center",
  },
  actionPressed: {
    opacity: 0.75,
  },
  actionText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary,
  },
});
