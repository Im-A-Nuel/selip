"use client";

// Minimal toast system: a provider + useToast() hook. Toasts stack at the
// bottom, auto-dismiss, and respect reduced motion via CSS.

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";

interface Toast {
  id: number;
  message: string;
  leaving?: boolean;
}

const ToastContext = createContext<(message: string) => void>(() => {});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const seq = useRef(0);

  const toast = useCallback((message: string) => {
    seq.current += 1;
    const id = seq.current;
    setToasts((t) => [...t, { id, message }]);
    // Trigger the leave animation, then remove after it finishes.
    setTimeout(() => {
      setToasts((t) => t.map((x) => (x.id === id ? { ...x, leaving: true } : x)));
      setTimeout(() => {
        setToasts((t) => t.filter((x) => x.id !== id));
      }, 220);
    }, 2400);
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-[calc(1.5rem+env(safe-area-inset-bottom))] z-[60] flex flex-col items-center gap-2 px-6">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white shadow-xl shadow-ink/25 ${
              t.leaving ? "toast-out" : "toast-in"
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
