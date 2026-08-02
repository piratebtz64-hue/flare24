"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Catches Supabase auth redirects that land on Site URL (/).
 * - Hash tokens (#access_token&type=recovery)
 * - Query PKCE (?code=...)
 * - token_hash flow
 * Then forces navigation to the right page.
 */
export function AuthHashCatcher() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    let cancelled = false;

    async function handle() {
      const url = new URL(window.location.href);
      const search = url.searchParams;
      const hashRaw = window.location.hash.startsWith("#")
        ? window.location.hash.slice(1)
        : window.location.hash;
      const hash = hashRaw ? new URLSearchParams(hashRaw) : null;

      // --- A) PKCE code on any path (often /) ---
      const code = search.get("code");
      if (code) {
        const next =
          search.get("next") ||
          (search.get("type") === "recovery"
            ? "/auth/update-password"
            : "/auth/update-password");
        // Prefer recovery form after password emails; magic links also OK to land on discover via callback
        const targetNext =
          search.get("type") === "recovery" || !search.get("next")
            ? "/auth/update-password"
            : search.get("next")!;
        window.location.replace(
          `/auth/callback?code=${encodeURIComponent(code)}&next=${encodeURIComponent(
            search.get("next") ||
              (search.get("type") === "recovery"
                ? "/auth/update-password"
                : "/discover")
          )}`
        );
        return;
      }

      // --- B) token_hash in query (email templates) ---
      const tokenHash = search.get("token_hash");
      const type = search.get("type");
      if (tokenHash && type) {
        try {
          const supabase = createClient();
          const { error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: type as "recovery" | "signup" | "magiclink" | "email",
          });
          if (!error && !cancelled) {
            window.location.replace(
              type === "recovery" ? "/auth/update-password" : "/discover"
            );
          }
        } catch {
          /* ignore */
        }
        return;
      }

      // --- C) Implicit / hash tokens ---
      if (hash && hash.get("access_token")) {
        const access_token = hash.get("access_token")!;
        const refresh_token = hash.get("refresh_token") || "";
        const hashType = hash.get("type") || "";

        try {
          const supabase = createClient();
          if (refresh_token) {
            await supabase.auth.setSession({ access_token, refresh_token });
          }
        } catch {
          /* continue to redirect anyway */
        }

        if (cancelled) return;

        // Strip hash then go to form
        if (hashType === "recovery" || !hashType) {
          window.location.replace("/auth/update-password");
        } else {
          window.location.replace("/discover");
        }
      }
    }

    // Run immediately + once after short delay (some mobile mail apps inject late)
    void handle();
    const t = window.setTimeout(() => void handle(), 400);

    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, []);

  return null;
}
