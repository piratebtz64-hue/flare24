"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { isGoldMember } from "@/lib/gold";

export function GoldBadge() {
  const [gold, setGold] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setGold(isGoldMember(data.user?.email));
    });
  }, []);

  if (gold) {
    return (
      <span className="text-xs text-emerald-400 border border-emerald-500/40 px-3 py-2 rounded-full min-h-[36px] flex items-center">
        Gold ✓
      </span>
    );
  }

  return (
    <Link
      href="/pricing"
      className="text-xs text-[#C5A46E] border border-[#C5A46E]/30 px-3 py-2 rounded-full min-h-[36px] flex items-center"
    >
      Gold
    </Link>
  );
}
