"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ProfilePage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
      setLoading(false);
    });
  }, []);

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="px-5 py-8">
      <h1 className="heading-serif text-4xl tracking-tight mb-8">Profil</h1>

      <div className="glass rounded-3xl p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#C5A46E] to-[#A67C52] flex items-center justify-center text-[#111] font-bold text-xl">
            {email?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div>
            <div className="font-semibold">
              {loading ? "…" : email ?? "Non connecté"}
            </div>
            <div className="text-xs text-white/40 mt-0.5">Membre Flare24</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-white/5 rounded-2xl py-3">
            <div className="text-[#C5A46E] font-semibold">—</div>
            <div className="text-[10px] text-white/40">Trust</div>
          </div>
          <div className="bg-white/5 rounded-2xl py-3">
            <div className="text-[#C5A46E] font-semibold">0</div>
            <div className="text-[10px] text-white/40">Flares</div>
          </div>
          <div className="bg-white/5 rounded-2xl py-3">
            <div className="text-[#C5A46E] font-semibold">—</div>
            <div className="text-[10px] text-white/40">ID</div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Link
          href="/pricing"
          className="block glass rounded-2xl px-5 py-4 text-sm hover:border-[#C5A46E]/30 border border-transparent transition"
        >
          Abonnement Gold
        </Link>
        <button
          onClick={logout}
          className="w-full text-left glass rounded-2xl px-5 py-4 text-sm text-red-400/90 hover:bg-red-500/5 transition"
        >
          Se déconnecter
        </button>
      </div>
    </div>
  );
}
