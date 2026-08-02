"use client";

import { useEffect, useState } from "react";

/**
 * Soft privacy layer for web.
 * True screenshot blocking needs a native app (iOS/Android).
 * This blurs sensitive UI when the tab is hidden or on print attempts.
 */
export function ScreenGuard({ children }: { children: React.ReactNode }) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    function onVisibility() {
      setHidden(document.visibilityState === "hidden");
    }
    function onBlur() {
      // Optional soft blur when window loses focus (some mobile capture flows)
      // Disabled by default for UX — enable if needed:
      // setHidden(true);
    }
    function onFocus() {
      setHidden(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      // Deter casual print-screen style workflows on desktop
      if (e.key === "PrintScreen") {
        setHidden(true);
        setTimeout(() => setHidden(false), 800);
      }
    }

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <div className={hidden ? "select-none" : undefined}>
      <div
        className={
          hidden
            ? "pointer-events-none blur-xl opacity-40 transition-all duration-200"
            : "transition-all duration-200"
        }
      >
        {children}
      </div>
      {hidden && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 text-white/70 text-sm">
          Contenu masqué temporairement
        </div>
      )}
    </div>
  );
}
