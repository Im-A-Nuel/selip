"use client";

// Registers the service worker in production only. A registered fetch-handling
// SW is what makes the PWA installable (enables beforeinstallprompt) and lets
// InstallPrompt actually appear. Skipped in dev to avoid HMR cache headaches.

import { useEffect } from "react";

export function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    const register = () =>
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    if (document.readyState === "complete") register();
    else window.addEventListener("load", register);
    return () => window.removeEventListener("load", register);
  }, []);
  return null;
}
