"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * If Supabase lands the user on Site URL (/) with #access_token&type=recovery,
 * forward them to the password update page with the hash intact.
 */
export function AuthHashCatcher() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash;
    if (!hash || hash.length < 10) return;

    const params = new URLSearchParams(hash.replace(/^#/, ""));
    const type = params.get("type");
    const access = params.get("access_token");

    if (access && (type === "recovery" || type === "signup" || type === "magiclink" || type === "invite")) {
      if (type === "recovery") {
        router.replace(`/auth/update-password${hash}`);
      } else {
        router.replace(`/auth/callback${window.location.search || ""}`);
      }
    }
  }, [router]);

  return null;
}
