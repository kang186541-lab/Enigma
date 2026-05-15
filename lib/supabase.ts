// Supabase client — initialized once, used app-wide for auth + RPC + REST.
//
// Environment variables (EXPO_PUBLIC_* are inlined at build time):
//   EXPO_PUBLIC_SUPABASE_URL          — e.g. https://atydkhvemgsrtjthxkwk.supabase.co
//   EXPO_PUBLIC_SUPABASE_ANON_KEY     — publishable / anon key (RLS keeps data safe)
//
// Sessions are persisted on-device via AsyncStorage so users stay signed in
// between launches.

import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// Hard-coded fallbacks for the LinguaAI project. We still prefer env values so
// the same code can target a staging project when needed.
const FALLBACK_URL = "https://atydkhvemgsrtjthxkwk.supabase.co";
const FALLBACK_ANON_KEY =
  "sb_publishable_RrhEzKnlUYcQkratPGijVg_4OAEbykH";

const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() || FALLBACK_URL;
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim() || FALLBACK_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // This should never trip — fallbacks guarantee non-empty values — but the
  // explicit check keeps TypeScript narrowing happy.
  throw new Error(
    "Supabase URL / anon key not configured. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.",
  );
}

// On web, Supabase uses window.localStorage by default. On native, we hand it
// AsyncStorage explicitly so the session survives app restarts.
const storage = Platform.OS === "web" ? undefined : AsyncStorage;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: storage as any,
    autoRefreshToken: true,
    persistSession: true,
    // detectSessionInUrl is only meaningful on web (Supabase reads the OAuth
    // redirect hash). Disabling on native avoids no-op work.
    detectSessionInUrl: Platform.OS === "web",
  },
});

export const SUPABASE_URL = supabaseUrl;
export const SUPABASE_ANON_KEY = supabaseAnonKey;
