"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getConversations, type Conversation } from "@/lib/store";

export default function MessagesPage() {
  const [convos, setConvos] = useState<Conversation[]>([]);

  useEffect(() => {
    setConvos(getConversations());
  }, []);

  return (
    <div className="px-5 py-8">
      <h1 className="heading-serif text-4xl tracking-tight mb-2">Messages</h1>
      <p className="text-white/50 text-sm mb-8">Conversations discrètes et temporaires.</p>

      {convos.length === 0 ? (
        <div className="glass rounded-3xl p-10 text-center">
          <div className="text-3xl mb-4 text-[#C5A46E]/50">◈</div>
          <p className="text-white/60 text-sm leading-relaxed">
            Aucune conversation pour le moment.
            <br />
            Réponds à un Flare pour démarrer.
          </p>
          <Link
            href="/discover"
            className="inline-block mt-6 text-sm text-[#C5A46E] hover:underline"
          >
            Voir les Flares
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {convos.map((c) => {
            const last = c.messages[c.messages.length - 1];
            return (
              <Link
                key={c.id}
                href={`/messages/${c.id}`}
                className="block glass rounded-3xl p-5 border border-white/5 hover:border-[#C5A46E]/25 transition"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold">{c.city}</span>
                  <span className="text-[10px] text-white/30">
                    {new Date(c.updatedAt).toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-white/50 text-sm truncate">{c.intent}</p>
                {last && (
                  <p className="text-white/40 text-xs mt-2 truncate">
                    {last.fromMe ? "Toi · " : ""}
                    {last.text}
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
