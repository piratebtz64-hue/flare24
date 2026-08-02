import Link from "next/link";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] px-6 py-12 max-w-2xl mx-auto">
      <Link href="/" className="text-sm text-[#C5A46E] mb-8 inline-block">← Accueil</Link>
      <h1 className="heading-serif text-4xl mb-6">Contact</h1>
      <p className="text-white/60 text-sm leading-relaxed mb-6">
        Pour toute question, signalement ou demande liée à ton compte :
      </p>
      <a
        href="mailto:piratebtz64@gmail.com"
        className="text-[#C5A46E] hover:underline"
      >
        piratebtz64@gmail.com
      </a>
    </div>
  );
}
