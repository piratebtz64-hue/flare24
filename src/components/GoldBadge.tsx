"use client";

import Link from "next/link";
import { useGold } from "@/hooks/useGold";

export function GoldBadge() {
  const { gold, loading } = useGold();

  if (loading) {
    return (
      <span className="text-xs text-white/30 border border-white/10 px-3 py-2 rounded-full min-h-[36px] flex items-center">
        …
      </span>
    );
  }

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
