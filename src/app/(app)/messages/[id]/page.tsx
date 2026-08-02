"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";

type Msg = { id: string; text: string; fromMe: boolean };

export default function ConversationPage() {
  const params = useParams();
  const search = useSearchParams();
  const id = String(params?.id ?? "chat");
  const city = search.get("city") || "Pays Basque";
  const intent = search.get("intent") || "Flare";

  const [messages, setMessages] = useState<Msg[]>(() => [
    {
      id: "sys",
      text: `${city} — ${intent}`,
      fromMe: false,
    },
  ]);
  const [text, setText] = useState("");

  const title = useMemo(() => city, [city]);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;

    const mine: Msg = { id: `m_${Date.now()}`, text: t, fromMe: true };
    const reply: Msg = {
      id: `m_${Date.now() + 1}`,
      text: "Bien reçu. On peut en parler discrètement.",
      fromMe: false,
    };
    setMessages((prev) => [...prev, mine, reply]);
    setText("");
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)]">
      <div className="px-5 py-4 border-b border-white/10 bg-[#0A0A0A]">
        <Link href="/messages" className="text-xs text-white/40">
          ← Messages
        </Link>
        <div className="font-semibold mt-1">{title}</div>
        <div className="text-xs text-white/40 truncate">{intent}</div>
      </div>

      <div className="flex-1 px-5 py-4 space-y-3">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
              m.fromMe
                ? "ml-auto bg-[#C5A46E] text-[#111]"
                : "bg-white/10 text-white/90"
            }`}
          >
            {m.text}
          </div>
        ))}
      </div>

      <form
        onSubmit={handleSend}
        className="px-5 py-4 border-t border-white/10 flex gap-2 bg-[#0A0A0A]"
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Écrire un message…"
          className="flex-1 bg-white/5 border border-white/15 rounded-2xl px-4 py-3 text-sm outline-none"
        />
        <button
          type="submit"
          className="bg-[#C5A46E] text-[#111] px-5 rounded-2xl text-sm font-semibold"
        >
          Envoyer
        </button>
      </form>
    </div>
  );
}
