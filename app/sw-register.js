"use client";
import { useEffect } from "react";

// Registers /sw.js in production only — in dev a worker would serve stale
// chunks between edits. Scope is / because sw.js is served from the root.
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Offline support is best-effort; the app works without it.
    });
  }, []);
  return null;
}
