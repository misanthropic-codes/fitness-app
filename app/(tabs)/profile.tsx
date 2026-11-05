import { StyleSheet, Text, View } from "react-native";
import { Screen } from "../../components/Screen";
import { colors } from "../../constants/theme";

const ROWS = ["Health profile", "Goals", "Units & timezone", "Privacy"] as const;

export default function ProfileScreen() {
  return (
    <Screen title="Profile" subtitle="Personal details, goals, and app preferences.">
      {ROWS.map((label) => (
        <View key={label} style={styles.row}>
          <Text style={styles.rowText}>{label}</Text>
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  rowText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: "500",
  },
});
