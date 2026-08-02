"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  getConversation,
  reportTarget,
  blockId,
  sendMessage,
  startConversation,
  type Conversation,
  type Flare,
} from "@/lib/store";

function ChatInner() {
  const params = useParams();
  const search = useSearchParams();
  const router = useRouter();
  const rawId = String(params.id || "");
  const city = search.get("city") || "Pays Basque";
  const intent = search.get("intent") || "Flare";

  const [convo, setConvo] = useState<Conversation | null>(null);
  const [text, setText] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const existing = getConversation(rawId);
    if (existing) {
      setConvo(existing);
      return;
    }
    const flare: Flare = {
      id: rawId,
      city,
      intent,
      tag: "Privé",
      trust: 90,
      expires: "2h",
      verified: true,
    };
    const created = startConversation(flare);
    setConvo({ ...created, id: created.id, flareId: rawId });
  }, [rawId, city, intent]);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const t = text.trim();
    if (!t || !convo) return;

    const updated = sendMessage(convo.id, t) || sendMessage(rawId, t);
    if (updated) {
      setConvo(updated);
    } else {
      setConvo((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          messages: [
            ...prev.messages,
            { id: `m_${Date.now()}`, text: t, fromMe: true, at: Date.now() },
            {
              id: `m_${Date.now() + 1}`,
              text: "Bien reçu. On peut en parler discrètement.",
              fromMe: false,
              at: Date.now() + 1,
            },
          ],
          updatedAt: Date.now(),
        };
      });
    }
    setText("");
  }

  function handleBlock() {
    blockId(rawId);
    if (convo) blockId(convo.id);
    setMenuOpen(false);
    setToast("Conversation bloquée");
    setTimeout(() => router.push("/messages"), 600);
  }

  function handleReport(reason: string) {
    reportTarget(rawId, reason);
    if (convo) reportTarget(convo.id, reason);
    setMenuOpen(false);
    setToast("Signalement enregistré");
    setTimeout(() => router.push("/messages"), 700);
  }

  if (!convo) {
    return (
      <div className="px-5 py-16 text-center text-white/40 text-sm">
        Chargement…
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)] relative">
      <div className="px-5 py-4 border-b border-white/10 bg-[#0A0A0A] flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link href="/messages" className="text-xs text-white/40">
            ← Messages
          </Link>
          <div className="font-semibold mt-1">{convo.city}</div>
          <div className="text-xs text-white/40 truncate">{convo.intent}</div>
        </div>
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="shrink-0 min-h-[44px] min-w-[44px] text-white/50 text-xl"
          aria-label="Options"
        >
          ⋮
        </button>
      </div>

      {menuOpen && (
        <div className="absolute right-4 top-16 z-50 w-56 glass rounded-2xl border border-white/10 overflow-hidden shadow-xl">
          <button
            type="button"
            onClick={() => handleReport("Comportement inapproprié")}
            className="w-full text-left px-4 py-3.5 text-sm hover:bg-white/5"
          >
            Signaler
          </button>
          <button
            type="button"
            onClick={handleBlock}
            className="w-full text-left px-4 py-3.5 text-sm text-red-400 hover:bg-red-500/10"
          >
            Bloquer et quitter
          </button>
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            className="w-full text-left px-4 py-3.5 text-sm text-white/40 hover:bg-white/5"
          >
            Annuler
          </button>
        </div>
      )}

      {toast && (
        <div className="mx-5 mt-3 text-center text-xs text-emerald-400 bg-emerald-500/10 rounded-2xl py-2">
          {toast}
        </div>
      )}

      <div className="flex-1 px-5 py-4 space-y-3 overflow-y-auto">
        {convo.messages.map((m) => (
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
          className="flex-1 min-h-[48px] bg-white/5 border border-white/15 rounded-2xl px-4 text-sm outline-none"
          autoComplete="off"
        />
        <button
          type="submit"
          className="min-h-[48px] min-w-[88px] bg-[#C5A46E] text-[#111] px-5 rounded-2xl text-sm font-semibold active:opacity-80"
        >
          Envoyer
        </button>
      </form>
    </div>
  );
}

export default function ConversationPage() {
  return (
    <Suspense
      fallback={
        <div className="px-5 py-16 text-center text-white/40 text-sm">
          Chargement…
        </div>
      }
    >
      <ChatInner />
    </Suspense>
  );
}
