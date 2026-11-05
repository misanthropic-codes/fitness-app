import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import type { ComponentProps } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "../../constants/theme";

type IconName = ComponentProps<typeof Ionicons>["name"];

const ACTIONS: { label: string; icon: IconName }[] = [
  { label: "Food", icon: "restaurant-outline" },
  { label: "Weight", icon: "scale-outline" },
  { label: "Train", icon: "barbell-outline" },
  { label: "Drink", icon: "wine-outline" },
  { label: "Smoke", icon: "flame-outline" },
];

export function QuickActions() {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Log</Text>
      <View style={styles.row}>
        {ACTIONS.map((action) => (
          <Pressable
            key={action.label}
            onPress={() => router.push("/log")}
            accessibilityRole="button"
            accessibilityLabel={`Log ${action.label}`}
            style={({ pressed }) => [styles.item, pressed && styles.pressed]}
          >
            <Ionicons name={action.icon} size={22} color={colors.primary} />
            <Text style={styles.label}>{action.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 28,
  },
  title: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.text,
    marginBottom: 14,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  item: {
    alignItems: "center",
    gap: 6,
    minWidth: 52,
  },
  pressed: {
    opacity: 0.7,
  },
  label: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.textMuted,
  },
});
