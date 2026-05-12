import { fetch } from "expo/fetch";
import Constants from "expo-constants";
import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { Platform } from "react-native";

const DEV_API_PORT = "5000";

function isDevBuild(): boolean {
  return typeof __DEV__ !== "undefined" && __DEV__;
}

function isHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

function isLoopbackHost(hostname: string): boolean {
  const normalized = hostname.toLowerCase();
  return (
    normalized === "localhost" ||
    normalized.startsWith("127.") ||
    normalized === "::1" ||
    normalized === "[::1]"
  );
}

function protocolForHost(host: string): "http" | "https" {
  return host.startsWith("localhost") || /^\d+\.\d+\.\d+\.\d+/.test(host)
    ? "http"
    : "https";
}

function getHostNameFromUri(uri: string | undefined): string | null {
  if (!uri) return null;

  try {
    const url = new URL(isHttpUrl(uri) ? uri : `http://${uri}`);
    return url.hostname || null;
  } catch {
    return null;
  }
}

function getWebDevHost(): string {
  const hostname =
    typeof globalThis.location?.hostname === "string"
      ? globalThis.location.hostname
      : "";

  return hostname || "localhost";
}

function getWebRuntimeOrigin(): string | null {
  if (Platform.OS !== "web") return null;

  const origin =
    typeof globalThis.location?.origin === "string"
      ? globalThis.location.origin
      : "";

  return origin && origin !== "null" ? origin : null;
}

function getReleaseWebFallbackUrl(): string | null {
  if (isDevBuild()) return null;
  return getWebRuntimeOrigin();
}

function getDevFallbackHost(): string {
  if (Platform.OS === "web") {
    return `${getWebDevHost()}:${DEV_API_PORT}`;
  }

  const expoHost = getHostNameFromUri(Constants.expoConfig?.hostUri);

  if (expoHost) {
    return `${expoHost}:${DEV_API_PORT}`;
  }

  console.warn(
    "EXPO_PUBLIC_DOMAIN is not set and Expo hostUri is unavailable; using localhost:5000. This only works for local web or emulators.",
  );
  return `localhost:${DEV_API_PORT}`;
}

function toApiUrl(hostOrUrl: string): string {
  const trimmed = hostOrUrl.trim();

  if (!trimmed) {
    throw new Error("EXPO_PUBLIC_DOMAIN is empty; configure the API host.");
  }

  let url: URL;

  try {
    url = new URL(
      isHttpUrl(trimmed) ? trimmed : `${protocolForHost(trimmed)}://${trimmed}`,
    );
  } catch {
    throw new Error(
      "EXPO_PUBLIC_DOMAIN is invalid; configure a host like example.com or 192.168.x.x:5000.",
    );
  }

  if (!isDevBuild()) {
    if (isLoopbackHost(url.hostname)) {
      throw new Error(
        "Release builds cannot use a localhost API host. Set EXPO_PUBLIC_DOMAIN to the production API domain.",
      );
    }
    // Fail closed on cleartext: a misconfigured EXPO_PUBLIC_DOMAIN (bare IP, http
    // host, missing protocol) must not silently send learner audio/text over HTTP.
    // Defense-in-depth on top of platform ATS — never trust the OS to block this.
    if (url.protocol !== "https:") {
      throw new Error(
        `Release builds require an https:// API host. Got '${url.protocol}//${url.hostname}'. Set EXPO_PUBLIC_DOMAIN to a https URL.`,
      );
    }
  }

  return url.href;
}

/**
 * Gets the base URL for the Express API server (e.g., "http://localhost:3000")
 * @returns {string} The API base URL
 */
export function getApiUrl(): string {
  let host = process.env.EXPO_PUBLIC_DOMAIN;

  if (!host) {
    const webOrigin = getWebRuntimeOrigin();
    if (!isDevBuild() && webOrigin) {
      return toApiUrl(webOrigin);
    }

    if (!isDevBuild()) {
      throw new Error(
        "EXPO_PUBLIC_DOMAIN is required for production/release API requests unless web API proxying is configured on the same origin.",
      );
    }

    console.warn("EXPO_PUBLIC_DOMAIN is not set, using development API fallback");
    host = getDevFallbackHost();
  }

  try {
    return toApiUrl(host);
  } catch (error) {
    const webOrigin = getReleaseWebFallbackUrl();
    if (webOrigin) {
      console.warn(
        "EXPO_PUBLIC_DOMAIN is not usable in production web; using same-origin API proxy instead.",
      );
      return toApiUrl(webOrigin);
    }

    if (!isDevBuild()) {
      throw error;
    }

    console.warn(
      "EXPO_PUBLIC_DOMAIN is invalid, using development API fallback",
    );
    return toApiUrl(getDevFallbackHost());
  }
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  route: string,
  data?: unknown | undefined,
): Promise<Response> {
  const baseUrl = getApiUrl();
  const url = new URL(route, baseUrl);

  const res = await fetch(url.toString(), {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const baseUrl = getApiUrl();
    const url = new URL(queryKey.join("/") as string, baseUrl);

    const res = await fetch(url.toString(), {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
