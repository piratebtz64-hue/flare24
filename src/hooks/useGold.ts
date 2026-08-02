"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isFounderEmail, isGoldMember } from "@/lib/gold";

export function useGold() {
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [gold, setGold] = useState(false);
  const [dbGold, setDbGold] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    (async () => {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData.user;
      const e = user?.email ?? null;

      if (!user) {
        if (!cancelled) {
          setEmail(null);
          setGold(false);
          setDbGold(false);
          setLoading(false);
        }
        return;
      }

      // Fondateur = immédiat, pas besoin d’attendre la DB
      if (isFounderEmail(e)) {
        if (!cancelled) {
          setEmail(e);
          setGold(true);
          setDbGold(true);
          setLoading(false);
        }
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("is_gold")
        .eq("id", user.id)
        .maybeSingle();

      const fromDb = Boolean(profile?.is_gold);
      const metaGold = Boolean(
        (user.user_metadata as { gold?: boolean } | undefined)?.gold
      );

      if (!cancelled) {
        setEmail(e);
        setDbGold(fromDb);
        setGold(isGoldMember(e, { dbGold: fromDb, metaGold }));
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { email, gold, dbGold, loading };
}
