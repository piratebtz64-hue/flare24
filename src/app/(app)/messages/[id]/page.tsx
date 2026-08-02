"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import {
  getConversation,
  sendMessage,
  startConversation,
  type Conversation,
  type Flare,
} from "@/lib/store";

function ChatInner() {
  const params = useParams();
  const search = useSearchParams();
  const rawId = String(params.id || "");
  const city = search.get("city") || "Pays Basque";
  const intent = search.get("intent") || "Flare";

  const [convo, setConvo] = useState<Conversation | null>(null);
  const [text, setText] = useState("");

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
    // Keep URL id stable for share/back
    const fixed = { ...created, id: rawId, flareId: rawId };
    setConvo(fixed);
  }, [rawId, city, intent]);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const t = text.trim();
    if (!t || !convo) return;

    const updated = sendMessage(convo.id, t);
    if (updated) {
      setConvo(updated);
    } else {
      // Fallback if id mismatch (opened via flare id)
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

  if (!convo) {
    return (
      <div className="px-5 py-16 text-center text-white/40 text-sm">
        Chargement…
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)]">
      <div className="px-5 py-4 border-b border-white/10 bg-[#0A0A0A]">
        <Link href="/messages" className="text-xs text-white/40 active:text-white">
          ← Messages
        </Link>
        <div className="font-semibold mt-1">{convo.city}</div>
        <div className="text-xs text-white/40 truncate">{convo.intent}</div>
      </div>

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
