import Constants from "expo-constants";
import { Platform } from "react-native";
import { getToken } from "./auth-storage";

/** Host machine IP Expo already uses for Metro (works on emulator + device). */
function getExpoPackagerHost(): string | null {
  const candidates = [
    Constants.expoConfig?.hostUri,
    Constants.expoGoConfig?.debuggerHost,
    // classic manifest
    (Constants as { manifest?: { debuggerHost?: string; hostUri?: string } }).manifest
      ?.debuggerHost,
    (Constants as { manifest?: { hostUri?: string } }).manifest?.hostUri,
  ].filter(Boolean) as string[];

  for (const value of candidates) {
    const host = value.split(":")[0]?.trim();
    if (host && host !== "localhost" && host !== "127.0.0.1") return host;
  }
  return null;
}

function resolveApiUrl() {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL?.trim();
  const packagerHost = getExpoPackagerHost();

  // Prefer explicit env if it is a real reachable host (not localhost on device/emulator).
  if (fromEnv) {
    const isLoopback = /localhost|127\.0\.0\.1/.test(fromEnv);
    if (!isLoopback) return fromEnv;
    if (Platform.OS === "ios") return fromEnv;
    // Android + loopback env: swap in packager LAN IP, else 10.0.2.2
    if (packagerHost) {
      const fixed = fromEnv.replace(/localhost|127\.0\.0\.1/, packagerHost);
      console.warn("[api] using Expo packager host", { from: fromEnv, to: fixed });
      return fixed;
    }
    return fromEnv.replace(/localhost|127\.0\.0\.1/, "10.0.2.2");
  }

  if (packagerHost) return `http://${packagerHost}:3001`;
  if (Platform.OS === "android") return "http://10.0.2.2:3001";
  return "http://localhost:3001";
}

export const API_URL = resolveApiUrl();
console.log("[api] base URL", API_URL, {
  platform: Platform.OS,
  packagerHost: getExpoPackagerHost(),
  env: process.env.EXPO_PUBLIC_API_URL,
});

export type ApiUser = {
  id: string;
  email: string;
  createdAt: string;
  profile: {
    displayName: string | null;
    heightCm: number | null;
    preferredUnits: string;
    timezone: string;
    onboardingComplete: boolean;
  } | null;
  goals: { id: string; type: string; target: number; unit: string; status: string }[];
};

export type AuthResponse = { token: string; user: ApiUser };

type ApiErrorBody = {
  code?: string;
  message?: string;
  fields?: Record<string, string>;
};

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
    public fields?: Record<string, string>,
  ) {
    super(message);
  }
}

async function request<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {},
): Promise<T> {
  const url = `${API_URL}${path}`;
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(options.headers as Record<string, string> | undefined),
  };

  if (options.auth !== false) {
    const token = await getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  console.log("[api] request", { method: options.method ?? "GET", url });

  const controller = new AbortController();
  const timeoutMs = 15_000;
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let res: Response;
  try {
    res = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });
  } catch (err) {
    const aborted = err instanceof Error && err.name === "AbortError";
    console.error("[api] network error", { url, aborted, message: String(err), err });
    throw new ApiError(
      aborted ? "TIMEOUT" : "NETWORK_ERROR",
      aborted
        ? `API timed out at ${API_URL}`
        : `Cannot reach API at ${API_URL}. Backend must be on your LAN (same Wi‑Fi).`,
      0,
    );
  } finally {
    clearTimeout(timer);
  }

  const text = await res.text();
  let data: ApiErrorBody & T;
  try {
    data = text ? (JSON.parse(text) as ApiErrorBody & T) : ({} as T);
  } catch (err) {
    console.error("[api] non-JSON response", {
      url,
      status: res.status,
      text: text.slice(0, 200),
      err,
    });
    throw new ApiError("BAD_RESPONSE", `Bad response from API (${res.status})`, res.status);
  }

  if (!res.ok) {
    const body = data as ApiErrorBody;
    console.warn("[api] error response", {
      url,
      status: res.status,
      code: body.code,
      message: body.message,
      fields: body.fields,
    });
    throw new ApiError(
      body.code ?? "REQUEST_FAILED",
      body.message ?? `Request failed (${res.status})`,
      res.status,
      body.fields,
    );
  }

  console.log("[api] ok", { url, status: res.status });
  return data as T;
}

export const api = {
  register(email: string, password: string) {
    console.log("[api] register", { email, passwordLen: password.length });
    return request<AuthResponse>("/v1/auth/register", {
      method: "POST",
      auth: false,
      body: JSON.stringify({ email, password }),
    });
  },
  login(email: string, password: string) {
    console.log("[api] login", { email, passwordLen: password.length });
    return request<AuthResponse>("/v1/auth/login", {
      method: "POST",
      auth: false,
      body: JSON.stringify({ email, password }),
    });
  },
  me() {
    return request<{ user: ApiUser }>("/v1/me");
  },
  patchMe(body: Record<string, unknown>) {
    return request<{ user: ApiUser }>("/v1/me", {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },
  setup(body: {
    displayName: string;
    heightCm?: number;
    preferredUnits: "metric" | "imperial";
    timezone: string;
    goals?: { type: string; target: number; unit: string }[];
  }) {
    return request<{ user: ApiUser }>("/v1/me/setup", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },
};
