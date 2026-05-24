// Auth state for the whole app.
//
// Wraps Supabase auth so the rest of the app only cares about:
//   - `user`: the current Supabase user object (or null when signed out)
//   - `signInWithGoogle()`: kick off Google OAuth — flow differs per platform
//   - `signOut()`: clear local session
//
// On web, signInWithGoogle redirects the page. On native, it opens an in-app
// browser via expo-web-browser and Supabase handles the auth-code exchange.

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Platform } from "react-native";
import type { Session, User } from "@supabase/supabase-js";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { supabase } from "@/lib/supabase";
import { flushProgressPush } from "@/lib/progressSync";
import { clearLocalProgressState } from "@/lib/progressStorage";
import { setUserContext } from "@/lib/monitoring";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signInWithEmail: (email: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Required on native so the in-app browser closes after the redirect.
WebBrowser.maybeCompleteAuthSession();

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Pull existing session (persisted in AsyncStorage / localStorage).
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      if (data.session?.user) {
        setUserContext({
          id: data.session.user.id,
          email: data.session.user.email ?? undefined,
        });
      }
      setLoading(false);
    });

    // Subscribe to auth changes (login, logout, token refresh, ...).
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return;
      setSession(nextSession);
      if (nextSession?.user) {
        setUserContext({
          id: nextSession.user.id,
          email: nextSession.user.email ?? undefined,
        });
      } else {
        setUserContext(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    try {
      if (Platform.OS === "web") {
        // Web: Supabase redirects the whole page; on return the SDK reads the
        // session out of the URL fragment via detectSessionInUrl.
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: window.location.origin,
          },
        });
        if (error) return { error: error.message };
        return { error: null };
      }

      // Native: open the Supabase-hosted auth screen in an in-app browser and
      // capture the redirect back into the app via expo-linking.
      const redirectTo = Linking.createURL("auth-callback");
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          skipBrowserRedirect: true,
        },
      });
      if (error || !data?.url) {
        return { error: error?.message ?? "Could not start sign-in." };
      }

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
      if (result.type !== "success" || !result.url) {
        return { error: result.type === "cancel" ? null : "Sign-in cancelled." };
      }

      const url = new URL(result.url);
      const params = url.hash.startsWith("#")
        ? new URLSearchParams(url.hash.slice(1))
        : url.searchParams;
      const access_token = params.get("access_token");
      const refresh_token = params.get("refresh_token");
      if (access_token && refresh_token) {
        const { error: setErr } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });
        if (setErr) return { error: setErr.message };
      }
      return { error: null };
    } catch (e) {
      const message = e instanceof Error ? e.message : "Sign-in failed.";
      return { error: message };
    }
  }, []);

  const signInWithEmail = useCallback(async (email: string) => {
    try {
      const trimmed = email.trim();
      if (!trimmed) return { error: "Please enter your email." };
      const redirectTo =
        Platform.OS === "web"
          ? window.location.origin
          : Linking.createURL("auth-callback");
      const { error } = await supabase.auth.signInWithOtp({
        email: trimmed,
        options: { emailRedirectTo: redirectTo },
      });
      if (error) return { error: error.message };
      return { error: null };
    } catch (e) {
      const message = e instanceof Error ? e.message : "Email sign-in failed.";
      return { error: message };
    }
  }, []);

  const signOut = useCallback(async () => {
    // Flush pending progress to Supabase BEFORE clearing local data.
    // If the flush failed (offline / 5xx), keep the local state intact so
    // the user can retry sign-out when connectivity returns — otherwise an
    // offline sign-out would strand their unsynced XP forever.
    const ok = await flushProgressPush();
    if (!ok) {
      console.warn("[Auth] sign-out aborted — could not flush progress to server. Try again when online.");
      throw new Error("FLUSH_FAILED");
    }
    await supabase.auth.signOut();
    await clearLocalProgressState();
    setUserContext(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      session,
      loading,
      signInWithGoogle,
      signInWithEmail,
      signOut,
    }),
    [session, loading, signInWithGoogle, signInWithEmail, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}
