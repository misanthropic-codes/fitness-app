import { Link, router } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import { ApiError } from "../../lib/api";
import { colors, fonts, radii } from "../../constants/theme";

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async () => {
    setError(null);
    setBusy(true);
    try {
      await signUp(email.trim(), password);
      router.replace("/(onboarding)/setup");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not create account");
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.wrap}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Text style={styles.brand}>Create account</Text>
        <Text style={styles.sub}>Email and password for now — social login later.</Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
        />

        <Text style={styles.label}>Password (min 8)</Text>
        <TextInput
          secureTextEntry
          autoComplete="new-password"
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          onPress={onSubmit}
          disabled={busy || !email || password.length < 8}
          style={({ pressed }) => [
            styles.btn,
            (busy || !email || password.length < 8) && styles.btnDisabled,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.btnText}>{busy ? "Creating…" : "Continue"}</Text>
        </Pressable>

        <Text style={styles.footer}>
          Already have an account?{" "}
          <Link href="/(auth)/login" style={styles.link}>
            Sign in
          </Link>
        </Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  wrap: { flex: 1, paddingHorizontal: 24, paddingTop: 36 },
  brand: {
    fontFamily: fonts.display,
    fontSize: 34,
    color: colors.primary,
  },
  sub: {
    marginTop: 8,
    marginBottom: 28,
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.textMuted,
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
  footer: {
    marginTop: 22,
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
  },
  link: {
    fontFamily: fonts.bodyBold,
    color: colors.primary,
  },
});
