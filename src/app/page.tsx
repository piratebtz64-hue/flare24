import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <nav className="border-b border-white/10 bg-[#0A0A0A]/95 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#C5A46E] to-[#A67C52] flex items-center justify-center">
              <span className="text-[#0A0A0A] font-bold text-lg">F</span>
            </div>
            <span className="heading-serif text-2xl tracking-tight">Flare24</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/pricing" className="text-sm text-white/70 hover:text-white transition">
              Tarifs
            </Link>
            <Link
              href="/login"
              className="luxury-btn bg-[#C5A46E] text-[#111111] px-5 py-2.5 rounded-2xl text-sm font-semibold"
            >
              Se connecter
            </Link>
          </div>
        </div>
      </nav>

      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-[#C5A46E] mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Pays Basque · Accès sélectif
        </div>

        <h1 className="heading-serif text-5xl md:text-7xl tracking-tighter leading-[1.05] mb-6">
          L'espace privé pour<br />
          les rencontres <span className="text-[#C5A46E]">intenses</span>.
        </h1>

        <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
          Flare24 est un cercle discret pour adultes consentants.
          Des Flares temporaires, près de chez toi. Ce soir, pas demain.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/pricing"
            className="luxury-btn bg-[#C5A46E] hover:bg-[#B38B5A] text-[#111111] px-10 py-4 rounded-3xl font-semibold text-base"
          >
            Rejoindre Flare24 Gold — 4,99 €/mois
          </Link>
          <Link href="#how" className="text-sm text-white/50 hover:text-white transition">
            Comment ça marche →
          </Link>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Zone", value: "Pays Basque" },
            { label: "Format", value: "Flares 24h" },
            { label: "Accès", value: "Membres" },
          ].map((item) => (
            <div key={item.label} className="glass rounded-3xl p-6 text-center">
              <div className="text-2xl font-semibold text-[#C5A46E] mb-1">{item.value}</div>
              <div className="text-xs text-white/50">{item.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="how" className="max-w-6xl mx-auto px-6 pb-24">
        <div className="text-center mb-12">
          <div className="text-xs tracking-[2px] text-[#C5A46E] font-semibold mb-3">COMMENT ÇA MARCHE</div>
          <h2 className="heading-serif text-4xl tracking-tight">Trois étapes. Zéro friction.</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              step: "01",
              title: "Créer ton compte",
              desc: "Inscription simple. Tu restes maître de ce que tu montres.",
            },
            {
              step: "02",
              title: "Allumer un Flare",
              desc: "Tu indiques ce que tu cherches, où, et pour combien de temps. Ça expire tout seul.",
            },
            {
              step: "03",
              title: "Répondre & rencontrer",
              desc: "Tu réponds aux Flares près de toi. Chat discret, puis vous décidez ensemble.",
            },
          ].map((item) => (
            <div key={item.step} className="glass rounded-3xl p-8">
              <div className="text-[#C5A46E] text-sm font-mono mb-4">{item.step}</div>
              <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
              <p className="text-white/60 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="glass rounded-[2rem] p-10 md:p-14 text-center border border-[#C5A46E]/20">
          <div className="text-xs tracking-[2px] text-[#C5A46E] font-semibold mb-4">FLARE24 GOLD</div>
          <h2 className="heading-serif text-4xl md:text-5xl tracking-tight mb-4">
            Accès complet. 4,99 € / mois.
          </h2>
          <p className="text-white/60 max-w-xl mx-auto mb-8">
            Voir les Flares, en créer, répondre, chatter.
            Résiliable à tout moment.
          </p>
          <Link
            href="/pricing"
            className="luxury-btn inline-block bg-[#C5A46E] hover:bg-[#B38B5A] text-[#111111] px-10 py-4 rounded-3xl font-semibold"
          >
            Voir les tarifs
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/10 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/40">
          <div className="heading-serif text-lg text-white/70">Flare24</div>
          <div className="flex gap-6">
            <Link href="/legal/privacy" className="hover:text-white transition">
              Confidentialité
            </Link>
            <Link href="/legal/terms" className="hover:text-white transition">
              CGU
            </Link>
            <Link href="/legal/contact" className="hover:text-white transition">
              Contact
            </Link>
          </div>
          <div>© {new Date().getFullYear()} Flare24</div>
        </div>
      </footer>
    </div>
  );
}
