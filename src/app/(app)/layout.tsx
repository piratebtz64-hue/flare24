import Link from "next/link";

const nav = [
  { href: "/discover", label: "Découvrir", icon: "✦" },
  { href: "/create", label: "Créer", icon: "＋" },
  { href: "/messages", label: "Messages", icon: "◈" },
  { href: "/profile", label: "Profil", icon: "○" },
];

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0A0A0A] pb-24">
      <header className="border-b border-white/10 bg-[#0A0A0A]/95 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-5 py-4 flex items-center justify-between">
          <Link href="/discover" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#C5A46E] to-[#A67C52] flex items-center justify-center">
              <span className="text-[#0A0A0A] font-bold text-sm">F</span>
            </div>
            <span className="heading-serif text-xl">Flare24</span>
          </Link>
          <Link
            href="/pricing"
            className="text-xs text-[#C5A46E] border border-[#C5A46E]/30 px-3 py-1.5 rounded-full"
          >
            Gold
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto">{children}</main>

      <nav className="fixed bottom-0 inset-x-0 border-t border-white/10 bg-[#0A0A0A]/95 backdrop-blur-xl z-40">
        <div className="max-w-3xl mx-auto grid grid-cols-4">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 py-3 text-white/50 hover:text-[#C5A46E] transition text-xs"
            >
              <span className="text-lg leading-none">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
