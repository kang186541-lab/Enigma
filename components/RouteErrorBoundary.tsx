/**
 * Per-route error boundary fallback for expo-router.
 *
 * When a route module exports a component named `ErrorBoundary`, expo-router
 * wraps THAT route's subtree in a boundary and renders this component on a
 * render-phase throw. Without it, any render error in a data-driven screen
 * (a malformed lesson / story / chat / escape node) unwinds all the way to the
 * single root ErrorBoundary, whose only action is "reload the whole app" — so
 * one bad record bricks the entire session. With a per-route boundary the crash
 * is contained to that one screen and the learner can simply go back, leaving
 * the rest of the app (home, progress, other modes) fully alive.
 *
 * Usage in a route file:
 *   export { RouteErrorBoundary as ErrorBoundary } from "@/components/RouteErrorBoundary";
 *
 * The fallback is intentionally self-contained (no context/i18n dependency) so
 * it can never itself throw while rendering an error. Reports to Sentry via
 * captureError (no-op until EXPO_PUBLIC_SENTRY_DSN is set), which is necessary
 * because a per-route boundary catches BEFORE the root one would.
 */
import React, { useEffect } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { router } from "expo-router";
import { captureError } from "@/lib/monitoring";
import { EmojiText } from "@/components/EmojiText";
import { C, F } from "@/constants/theme";

export function RouteErrorBoundary({ error, retry }: { error: Error; retry: () => void }) {
  useEffect(() => {
    captureError(error, { boundary: "route" });
  }, [error]);

  const goBack = () => {
    try {
      if (router.canGoBack()) router.back();
      else router.replace("/");
    } catch {
      router.replace("/");
    }
  };

  return (
    <View style={s.wrap}>
      <EmojiText style={s.emoji}>🦊</EmojiText>
      <Text style={s.title}>이 화면에 문제가 생겼어요</Text>
      <Text style={s.sub}>Something went wrong on this screen.{"\n"}다른 화면은 그대로예요 — 돌아가서 다시 들어와 주세요.</Text>
      <View style={s.row}>
        <Pressable style={[s.btn, s.btnPrimary]} onPress={retry} accessibilityRole="button" accessibilityLabel="Retry">
          <Text style={s.btnPrimaryText}>다시 시도 · Retry</Text>
        </Pressable>
        <Pressable style={[s.btn, s.btnGhost]} onPress={goBack} accessibilityRole="button" accessibilityLabel="Go back">
          <Text style={s.btnGhostText}>돌아가기 · Go back</Text>
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, alignItems: "center", justifyContent: "center", padding: 28, gap: 12, backgroundColor: C.bg1 },
  emoji: { fontSize: 44 },
  title: { color: C.gold, fontFamily: F.header, fontSize: 20, textAlign: "center" },
  sub: { color: C.parchment, fontFamily: F.bodySemi, fontSize: 14, lineHeight: 20, textAlign: "center", opacity: 0.9 },
  row: { flexDirection: "row", gap: 10, marginTop: 8, flexWrap: "wrap", justifyContent: "center" },
  btn: { minHeight: 46, borderRadius: 23, paddingHorizontal: 22, alignItems: "center", justifyContent: "center" },
  btnPrimary: { backgroundColor: C.gold },
  btnPrimaryText: { color: C.bg1, fontFamily: F.bodyBold, fontSize: 15 },
  btnGhost: { borderWidth: 1, borderColor: C.border },
  btnGhostText: { color: C.parchment, fontFamily: F.bodyBold, fontSize: 15 },
});
