import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import { ApiError } from "../../lib/api";
import { colors, fonts, radii } from "../../constants/theme";

export default function SetupScreen() {
  const { user, completeSetup } = useAuth();
  const defaultTz = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    [],
  );

  const [displayName, setDisplayName] = useState(
    user?.profile?.displayName ?? "",
  );
  const [heightCm, setHeightCm] = useState(
    user?.profile?.heightCm != null ? String(user.profile.heightCm) : "",
  );
  const [units, setUnits] = useState<"metric" | "imperial">("metric");
  const [calorieTarget, setCalorieTarget] = useState("2100");
  const [stepsGoal, setStepsGoal] = useState("10000");
  const [weightTarget, setWeightTarget] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async () => {
    setError(null);
    if (!displayName.trim()) {
      setError("Add a display name");
      return;
    }
    setBusy(true);
    try {
      const height = heightCm.trim() ? Number(heightCm) : undefined;
      await completeSetup({
        displayName: displayName.trim(),
        heightCm: height && !Number.isNaN(height) ? height : undefined,
        preferredUnits: units,
        timezone: defaultTz,
        calorieTarget: calorieTarget ? Number(calorieTarget) : undefined,
        stepsGoal: stepsGoal ? Number(stepsGoal) : undefined,
        weightTargetKg: weightTarget ? Number(weightTarget) : undefined,
      });
      router.replace("/(tabs)");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save profile");
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.wrap}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.brand}>Set up your profile</Text>
          <Text style={styles.sub}>
            Basics only — you can change goals anytime in Profile.
          </Text>

          <Text style={styles.label}>Display name</Text>
          <TextInput
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="What should we call you?"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
          />

          <Text style={styles.label}>Height (cm, optional)</Text>
          <TextInput
            keyboardType="decimal-pad"
            value={heightCm}
            onChangeText={setHeightCm}
            placeholder="170"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
          />

          <Text style={styles.label}>Units</Text>
          <View style={styles.row}>
            {(["metric", "imperial"] as const).map((u) => (
              <Pressable
                key={u}
                onPress={() => setUnits(u)}
                style={[styles.chip, units === u && styles.chipOn]}
              >
                <Text style={[styles.chipText, units === u && styles.chipTextOn]}>
                  {u}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.section}>Starter goals</Text>

          <Text style={styles.label}>Daily calories</Text>
          <TextInput
            keyboardType="number-pad"
            value={calorieTarget}
            onChangeText={setCalorieTarget}
            style={styles.input}
          />

          <Text style={styles.label}>Daily steps</Text>
          <TextInput
            keyboardType="number-pad"
            value={stepsGoal}
            onChangeText={setStepsGoal}
            style={styles.input}
          />

          <Text style={styles.label}>Weight target (kg, optional)</Text>
          <TextInput
            keyboardType="decimal-pad"
            value={weightTarget}
            onChangeText={setWeightTarget}
            placeholder="72"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
          />

          <Text style={styles.tz}>Timezone · {defaultTz}</Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            onPress={onSubmit}
            disabled={busy}
            style={({ pressed }) => [
              styles.btn,
              busy && styles.btnDisabled,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.btnText}>{busy ? "Saving…" : "Start tracking"}</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  wrap: { paddingHorizontal: 24, paddingTop: 28, paddingBottom: 40 },
  brand: {
    fontFamily: fonts.display,
    fontSize: 32,
    color: colors.primary,
  },
  sub: {
    marginTop: 8,
    marginBottom: 24,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textMuted,
  },
  section: {
    marginTop: 8,
    marginBottom: 12,
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.text,
  },
  label: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 6,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: radii.md,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.text,
    marginBottom: 16,
  },
  row: { flexDirection: "row", gap: 10, marginBottom: 18 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radii.lg,
    backgroundColor: "rgba(255,255,255,0.7)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.textMuted,
    textTransform: "capitalize",
  },
  chipTextOn: { color: "#F6F1E8", fontFamily: fonts.bodyBold },
  tz: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 12,
  },
  error: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.danger,
    marginBottom: 12,
  },
  btn: {
    marginTop: 8,
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: 16,
    alignItems: "center",
  },
  btnDisabled: { opacity: 0.45 },
  pressed: { opacity: 0.85 },
  btnText: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: "#F6F1E8",
  },
});
