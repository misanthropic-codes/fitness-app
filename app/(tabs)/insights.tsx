import { StyleSheet, Text, View } from "react-native";
import { Screen } from "../../components/Screen";
import { colors } from "../../constants/theme";

export default function InsightsScreen() {
  return (
    <Screen
      title="Insights"
      subtitle="Period comparisons and evidence-backed explanations will show here."
    >
      <View style={styles.empty}>
        <Text style={styles.emptyText}>
          Log a few days of data to unlock daily and weekly insights.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  empty: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 20,
  },
  emptyText: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textMuted,
  },
});
