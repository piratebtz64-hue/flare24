"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  getConversation,
  sendMessage,
  type Conversation,
} from "@/lib/store";

export default function ConversationPage() {
  const params = useParams();
  const id = String(params?.id ?? "");
  const [convo, setConvo] = useState<Conversation | null>(null);
  const [text, setText] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!id) return;
    setConvo(getConversation(id) ?? null);
    setReady(true);
  }, [id]);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || !convo) return;
    const updated = sendMessage(convo.id, text.trim());
    if (updated) {
      setConvo({ ...updated });
      setText("");
    }
  }

  if (!ready) {
    return (
      <div className="px-5 py-16 text-center text-white/40 text-sm">Chargement…</div>
    );
  }

  if (!convo) {
    return (
      <div className="px-5 py-16 text-center">
        <p className="text-white/50 text-sm mb-4">Conversation introuvable.</p>
        <Link href="/messages" className="text-[#C5A46E] text-sm">
          Retour aux messages
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)]">
      <div className="px-5 py-4 border-b border-white/10 bg-[#0A0A0A]">
        <Link href="/messages" className="text-xs text-white/40">
          ← Messages
        </Link>
        <div className="font-semibold mt-1">{convo.city}</div>
        <div className="text-xs text-white/40 truncate">{convo.intent}</div>
      </div>

      <div className="flex-1 px-5 py-4 space-y-3">
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
