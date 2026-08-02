export default function MessagesPage() {
  return (
    <div className="px-5 py-8">
      <h1 className="heading-serif text-4xl tracking-tight mb-2">Messages</h1>
      <p className="text-white/50 text-sm mb-10">Conversations discrètes et temporaires.</p>

      <div className="glass rounded-3xl p-10 text-center">
        <div className="text-3xl mb-4 opacity-40">◈</div>
        <p className="text-white/50 text-sm">
          Aucune conversation pour le moment.
          <br />
          Réponds à un Flare pour démarrer.
        </p>
      </div>
    </div>
  );
}
