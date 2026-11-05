import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, type ApiUser } from "../lib/api";
import { clearToken, getToken, saveToken } from "../lib/auth-storage";

type AuthState = {
  user: ApiUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<ApiUser>;
  signUp: (email: string, password: string) => Promise<ApiUser>;
  refresh: () => Promise<void>;
  completeSetup: (input: {
    displayName: string;
    heightCm?: number;
    preferredUnits: "metric" | "imperial";
    timezone: string;
    calorieTarget?: number;
    stepsGoal?: number;
    weightTargetKg?: number;
  }) => Promise<ApiUser>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const token = await getToken();
    if (!token) {
      setUser(null);
      return;
    }
    const { user: next } = await api.me();
    setUser(next);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await refresh();
      } catch {
        await clearToken();
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [refresh]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { token, user: next } = await api.login(email, password);
    await saveToken(token);
    setUser(next);
    return next;
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const { token, user: next } = await api.register(email, password);
    await saveToken(token);
    setUser(next);
    return next;
  }, []);

  const completeSetup = useCallback(
    async (input: {
      displayName: string;
      heightCm?: number;
      preferredUnits: "metric" | "imperial";
      timezone: string;
      calorieTarget?: number;
      stepsGoal?: number;
      weightTargetKg?: number;
    }) => {
      const goals: { type: string; target: number; unit: string }[] = [];
      if (input.calorieTarget) {
        goals.push({ type: "calories", target: input.calorieTarget, unit: "kcal" });
      }
      if (input.stepsGoal) {
        goals.push({ type: "steps", target: input.stepsGoal, unit: "steps" });
      }
      if (input.weightTargetKg) {
        goals.push({ type: "weight", target: input.weightTargetKg, unit: "kg" });
      }

      const { user: next } = await api.setup({
        displayName: input.displayName,
        heightCm: input.heightCm,
        preferredUnits: input.preferredUnits,
        timezone: input.timezone,
        goals: goals.length ? goals : undefined,
      });
      setUser(next);
      return next;
    },
    [],
  );

  const signOut = useCallback(async () => {
    await clearToken();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, signIn, signUp, refresh, completeSetup, signOut }),
    [user, loading, signIn, signUp, refresh, completeSetup, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
