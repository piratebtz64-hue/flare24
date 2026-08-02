"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { getFlares } from "@/lib/store";
import {
  getNotificationSupport,
  requestNotificationPermission,
  sendTestNotification,
} from "@/lib/notifications";
import {
  trackGoldView,
  trackLogout,
  trackNotificationsEnabled,
} from "@/lib/analytics";

const CITIES = ["Bayonne", "Biarritz", "Anglet", "Bidart", "Saint-Jean-de-Luz"];

export default function ProfilePage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState("Bayonne");
  const [myFlares, setMyFlares] = useState(0);
  const [notifStatus, setNotifStatus] = useState("…");
  const [notifMsg, setNotifMsg] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
      setLoading(false);
    });
    const saved = localStorage.getItem("flare24_city");
    if (saved) setCity(saved);
    setMyFlares(getFlares().filter((f) => f.mine).length);
    setNotifStatus(getNotificationSupport());
  }, []);

  function saveCity(c: string) {
    setCity(c);
    localStorage.setItem("flare24_city", c);
  }

  async function enableNotifications() {
    setNotifMsg(null);
    const state = await requestNotificationPermission();
    setNotifStatus(state);
    if (state === "granted") {
      trackNotificationsEnabled();
      const ok = sendTestNotification();
      setNotifMsg(
        ok
          ? "Notification test envoyée. Vérifie ton écran de verrouillage."
          : "Permission OK, mais le navigateur a bloqué l'affichage."
      );
    } else if (state === "denied") {
      setNotifMsg("Refusé. Active les notifications dans les réglages du téléphone.");
    } else if (state === "unsupported") {
      setNotifMsg("Ce navigateur ne gère pas les notifications.");
    } else {
      setNotifMsg("Permission non accordée.");
    }
  }

  async function logout() {
    trackLogout();
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="px-5 py-8 pb-28">
      <h1 className="heading-serif text-4xl tracking-tight mb-8">Profil</h1>

      <div className="glass rounded-3xl p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#C5A46E] to-[#A67C52] flex items-center justify-center text-[#111] font-bold text-xl">
            {email?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div className="min-w-0">
            <div className="font-semibold truncate">
              {loading ? "…" : email ?? "Non connecté"}
            </div>
            <div className="text-xs text-white/40 mt-0.5 flex items-center gap-2">
              <span>Membre</span>
              <span className="text-[#C5A46E]">· Gold à activer</span>
            </div>
          </div>
        </div>

        <div className="mb-5">
          <label className="text-xs text-white/50 block mb-2">Ta ville</label>
          <div className="flex flex-wrap gap-2">
            {CITIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => saveCity(c)}
                className={`min-h-[40px] px-3 rounded-full text-xs transition ${
                  city === c
                    ? "bg-[#C5A46E] text-[#111] font-semibold"
                    : "bg-white/5 text-white/60 border border-white/10"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-white/5 rounded-2xl py-3">
            <div className="text-[#C5A46E] font-semibold">{city.slice(0, 3)}</div>
            <div className="text-[10px] text-white/40">Zone</div>
          </div>
          <div className="bg-white/5 rounded-2xl py-3">
            <div className="text-[#C5A46E] font-semibold">{myFlares}</div>
            <div className="text-[10px] text-white/40">Mes Flares</div>
          </div>
          <div className="bg-white/5 rounded-2xl py-3">
            <div className="text-[#C5A46E] font-semibold text-[11px] truncate px-1">
              {notifStatus}
            </div>
            <div className="text-[10px] text-white/40">Notifs</div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <button
          type="button"
          onClick={enableNotifications}
          className="w-full text-left glass rounded-2xl px-5 py-4 text-sm border border-white/10"
        >
          Activer / tester les notifications
        </button>
        {notifMsg && (
          <p className="text-xs text-white/50 px-2">{notifMsg}</p>
        )}

        <Link
          href="/pricing"
          onClick={() => trackGoldView()}
          className="block glass rounded-2xl px-5 py-4 text-sm border border-[#C5A46E]/25 text-[#C5A46E]"
        >
          Passer Gold — 4,99 €/mois
        </Link>
        <Link
          href="/create"
          className="block glass rounded-2xl px-5 py-4 text-sm hover:border-white/20 border border-transparent transition"
        >
          Allumer un Flare
        </Link>
        <Link
          href="/legal/contact"
          className="block glass rounded-2xl px-5 py-4 text-sm hover:border-white/20 border border-transparent transition"
        >
          Signaler un problème
        </Link>
        <Link
          href="/legal/privacy"
          className="block glass rounded-2xl px-5 py-4 text-sm text-white/50 hover:border-white/20 border border-transparent transition"
        >
          Confidentialité
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
