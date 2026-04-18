import { useEffect, useState } from "react";
import { Platform } from "react-native";

let _isOnline = true;
const _listeners = new Set<(online: boolean) => void>();

function notify(online: boolean) {
  _isOnline = online;
  _listeners.forEach((fn) => fn(online));
}

// ── Web listener ──
if (Platform.OS === "web" && typeof window !== "undefined") {
  window.addEventListener("online",  () => notify(true));
  window.addEventListener("offline", () => notify(false));
  _isOnline = navigator.onLine;
}

// ── Native listener (lazy import to avoid web bundling issues) ──
if (Platform.OS !== "web") {
  try {
    const NetInfo = require("@react-native-community/netinfo").default;
    NetInfo.addEventListener((state: { isConnected: boolean | null }) => {
      notify(state.isConnected !== false);
    });
  } catch {
    console.warn("[Network] @react-native-community/netinfo not available, assuming online");
  }
}

/** Returns current online status */
export function getIsOnline(): boolean {
  return _isOnline;
}

/** React hook for online/offline status */
export function useNetwork(): { isOnline: boolean } {
  const [isOnline, setIsOnline] = useState(_isOnline);

  useEffect(() => {
    const handler = (online: boolean) => setIsOnline(online);
    _listeners.add(handler);
    // Sync initial state
    setIsOnline(_isOnline);
    return () => { _listeners.delete(handler); };
  }, []);

  return { isOnline };
}
