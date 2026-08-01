import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Flame, Globe, Heart, ChevronRight, MapPin, Clock, Shield, Zap, Eye } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useI18n, LANGUAGES } from "@/contexts/I18nContext";

// Premium Landing - Gold Theme - Full content in repo via zip import recommended
export default function Landing() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { lang, setLang } = useI18n();
  const trackMutation = trpc.analytics.track.useMutation();

  useEffect(() => {
    trackMutation.mutate({ event: "home_view" });
    const lastVisit = localStorage.getItem("flare24_last_visit");
    if (lastVisit) trackMutation.mutate({ event: "return_visit" });
    localStorage.setItem("flare24_last_visit", Date.now().toString());
  }, []);

  const handleCta = () => {
    trackMutation.mutate({ event: "click_allumer" });
    if (user) navigate("/app");
    else window.location.href = getLoginUrl();
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white overflow-x-hidden">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-[#0A0A0A]/75 backdrop-blur-2xl">
        <div className="container flex items-center justify-between py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#C5A46E] to-[#A67C52] flex items-center justify-center shadow-lg shadow-[#C5A46E]/25">
              <Flame className="w-4 h-4 text-[#0A0A0A]" />
            </div>
            <span className="heading-serif text-[22px] tracking-tight">Flare24</span>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <button onClick={() => navigate("/app")} className="luxury-btn bg-gradient-to-r from-[#C5A46E] to-[#A67C52] text-[#0A0A0A] font-semibold text-sm px-5 py-2.5 rounded-2xl">Mon app</button>
            ) : (
              <a href={getLoginUrl()} className="luxury-btn bg-gradient-to-r from-[#C5A46E] to-[#A67C52] text-[#0A0A0A] font-semibold text-sm px-5 py-2.5 rounded-2xl">Rejoindre</a>
            )}
          </div>
        </div>
      </nav>

      <section className="pt-28 pb-16 px-4 relative overflow-hidden ambient-glow">
        <div className="container max-w-3xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-live" />
            <span className="text-xs text-white/55 font-medium tracking-wide">Éclats actifs en ce moment</span>
          </div>
          <h1 className="heading-serif text-5xl sm:text-6xl md:text-7xl leading-[1.05] mb-5">
            <span className="gold-text-gradient">Rencontres intenses.</span><br />
            <span className="text-white">Ce soir.</span>
          </h1>
          <p className="text-lg md:text-xl text-white/55 mb-10 max-w-xl mx-auto leading-relaxed">
            Publie un <span className="text-[#C5A46E] font-medium">Éclat</span>. Vois qui est disponible <span className="text-white/80 font-medium">maintenant</span> autour de toi.
          </p>
          <button onClick={handleCta} className="luxury-btn group relative px-10 py-5 md:px-14 md:py-6 rounded-2xl bg-gradient-to-r from-[#C5A46E] via-[#D4B896] to-[#A67C52] text-[#0A0A0A] font-bold text-lg md:text-xl shadow-2xl shadow-[#C5A46E]/30">
            <div className="relative flex items-center justify-center gap-2.5">
              <Flame className="w-6 h-6" />
              <span>Allumer mon Éclat</span>
              <ChevronRight className="w-5 h-5" />
            </div>
          </button>
          <p className="text-[11px] text-white/30 tracking-[0.2em] uppercase font-medium mt-4">Visible 4h max · Éphémère · Gratuit</p>
        </div>
      </section>

      <section className="py-20 px-4 border-t border-white/[0.05]">
        <div className="container max-w-4xl mx-auto text-center">
          <p className="section-label mb-2">Pourquoi Flare24</p>
          <h2 className="heading-serif text-3xl md:text-4xl text-white mb-12">Pas comme les autres</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {["Urgence réelle", "Zéro blabla", "Discret & libre"].map((title) => (
              <div key={title} className="glass rounded-2xl p-6">
                <h3 className="font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm text-white/50">Chaque Éclat expire en 4h max. Pas de profils fantômes.</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="container max-w-2xl mx-auto text-center">
          <div className="glass-strong rounded-3xl p-10 md:p-14">
            <h2 className="heading-serif text-3xl md:text-4xl text-white mb-4">Prêt à allumer ton premier Éclat ?</h2>
            <p className="text-white/45 mb-8">Gratuit. 4h max. Aucun abonnement pour commencer.</p>
            <button onClick={handleCta} className="luxury-btn px-10 py-4 rounded-2xl bg-gradient-to-r from-[#C5A46E] to-[#A67C52] text-[#0A0A0A] font-bold shadow-xl shadow-[#C5A46E]/25">
              <span className="flex items-center gap-2 justify-center"><Flame className="w-5 h-5" /> Allumer mon Éclat</span>
            </button>
          </div>
        </div>
      </section>

      <footer className="py-8 px-4 border-t border-white/[0.05] text-center text-white/25 text-xs">
        <p>© 2026 Flare24. Tous droits réservés.</p>
      </footer>
    </div>
  );
}
