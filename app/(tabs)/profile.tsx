import { Redirect, router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Screen } from "../../components/Screen";
import { useAuth } from "../../context/AuthContext";
import { colors, fonts } from "../../constants/theme";

export default function ProfileScreen() {
  const { user, loading, signOut } = useAuth();

  if (loading) return null;
  if (!user) return <Redirect href="/(auth)/login" />;

  const profile = user.profile;
  const goalLine = (type: string) => {
    const g = user.goals.find((x) => x.type === type);
    return g ? `${g.target} ${g.unit}` : "—";
  };

  return (
    <Screen title="Profile" subtitle="Personal details, goals, and app preferences.">
      <View style={styles.card}>
        <Text style={styles.label}>Name</Text>
        <Text style={styles.value}>{profile?.displayName ?? "—"}</Text>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{user.email}</Text>
        <Text style={styles.label}>Height</Text>
        <Text style={styles.value}>
          {profile?.heightCm != null ? `${profile.heightCm} cm` : "—"}
        </Text>
        <Text style={styles.label}>Units · timezone</Text>
        <Text style={styles.value}>
          {profile?.preferredUnits ?? "metric"} · {profile?.timezone ?? "UTC"}
        </Text>
      </View>

      <Text style={styles.section}>Goals</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Calories</Text>
        <Text style={styles.value}>{goalLine("calories")}</Text>
        <Text style={styles.label}>Steps</Text>
        <Text style={styles.value}>{goalLine("steps")}</Text>
        <Text style={styles.label}>Weight</Text>
        <Text style={styles.value}>{goalLine("weight")}</Text>
      </View>

      <Pressable
        onPress={async () => {
          await signOut();
          router.replace("/(auth)/login");
        }}
        style={({ pressed }) => [styles.signOut, pressed && { opacity: 0.75 }]}
      >
        <Text style={styles.signOutText}>Sign out</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  section: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.text,
    marginBottom: 10,
  },
  label: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 8,
  },
  value: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.text,
    marginTop: 2,
  },
  signOut: {
    marginTop: 8,
    paddingVertical: 14,
    alignItems: "center",
  },
  signOutText: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.danger,
  },
});
