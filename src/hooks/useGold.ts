"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isGoldMember } from "@/lib/gold";

export function useGold() {
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [gold, setGold] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      const e = data.user?.email ?? null;
      setEmail(e);
      setGold(isGoldMember(e));
      setLoading(false);
    });
  }, []);

  return { email, gold, loading };
}
