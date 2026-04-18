import { useState, useCallback, createElement } from "react";
import { AppToast, ToastType } from "@/components/AppToast";

interface ToastState {
  message: string;
  type: ToastType;
  key: number;
}

export function useAppToast() {
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    setToast({ message, type, key: Date.now() });
  }, []);

  const ToastElement = toast
    ? createElement(AppToast, {
        key: toast.key,
        message: toast.message,
        type: toast.type,
        onDone: () => setToast(null),
      })
    : null;

  return { showToast, ToastElement };
}
