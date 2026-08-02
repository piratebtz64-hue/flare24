import { computeTrust } from "@/lib/trust";

export type Flare = {
  id: string;
  city: string;
  intent: string;
  tag: string;
  /** Trust score 1–5 */
  trust: number;
  expires: string;
  verified: boolean;
  mine?: boolean;
};

export type Message = {
  id: string;
  text: string;
  fromMe: boolean;
  at: number;
};

export type Conversation = {
  id: string;
  flareId: string;
  city: string;
  intent: string;
  messages: Message[];
  updatedAt: number;
};

const FLARES_KEY = "flare24_flares";
const CONVOS_KEY = "flare24_convos";
const BLOCKED_KEY = "flare24_blocked";
const REPORTS_KEY = "flare24_reports";

const defaultFlares: Flare[] = [
  {
    id: "f1",
    city: "Bayonne",
    intent: "Ce soir · discret",
    tag: "Hôtel",
    trust: computeTrust({ verified: true, hasCity: true, hasActivity: true, accountAgeDays: 14 }),
    expires: "2h",
    verified: true,
  },
  {
    id: "f2",
    city: "Biarritz",
    intent: "Après-midi · intensité",
    tag: "Appartement",
    trust: computeTrust({ verified: true, hasCity: true, hasActivity: true }),
    expires: "45min",
    verified: true,
  },
  {
    id: "f3",
    city: "Anglet",
    intent: "Soirée · découverte",
    tag: "Bar d'abord",
    trust: computeTrust({ verified: false, hasCity: true, hasActivity: true, accountAgeDays: 30 }),
    expires: "3h",
    verified: false,
  },
  {
    id: "f4",
    city: "Bayonne",
    intent: "Maintenant · urgent",
    tag: "Privé",
    trust: computeTrust({ verified: true, hasCity: true, hasActivity: true, accountAgeDays: 10 }),
    expires: "20min",
    verified: true,
  },
];

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function buildAutoReply(
  userText: string,
  city: string,
  intent: string,
  turn: number
): string {
  const t = userText.toLowerCase().trim();
  const short = t.length <= 3;

  if (/^cc$|^salut$|^hey$|^hello$|^bonjour$|^coucou$|^yo$/.test(t) || short) {
    return pick([
      `Salut. T'es sur ${city} ce soir ?`,
      `Hey. Discret de mon côté — t'es libre quand ?`,
      `Coucou. Ton message tombe bien. T'es où vers ${city} ?`,
    ]);
  }

  if (/photo|img|snap|face|visage|instagram|insta/.test(t)) {
    return pick([
      `Je reste sans photo ici. On avance au feeling si ça te va.`,
      `Pas de face sur l'app. On peut se décrire un peu si tu veux.`,
      `Discret = pas de photo. Par contre je peux te dire le vibe.`,
    ]);
  }

  if (/où|ou \?|quartier|place|spot|rencontr/.test(t)) {
    return pick([
      `Vers ${city}, un endroit calme. Tu préfères un verre d'abord ou direct privé ?`,
      `Je peux me déplacer près de ${city}. Tu as un coin en tête ?`,
      `Un bar discret pour commencer, puis on voit. OK pour toi ?`,
    ]);
  }

  if (/heure|quand|dispo|dispo\?|ce soir|maintenant|tout de suite|rapide/.test(t)) {
    return pick([
      `Ce soir ça me va. Tu es plutôt 20h ou plus tard ?`,
      `Je suis flexible sur la prochaine heure. Toi ?`,
      `Si c'est pour ${intent.toLowerCase()}, dis-moi un créneau précis.`,
    ]);
  }

  if (/âge|age|ans|jeune|vieux/.test(t)) {
    return pick([
      `Adulte, consentant, discret. Et toi, tu cherches quel type d'échange ?`,
      `On est sur le même rythme ? Dis-moi ce que tu veux vraiment ce soir.`,
    ]);
  }

  if (/hôtel|hotel|appart|chez|chambre|priv/.test(t)) {
    return pick([
      `Privé OK pour moi. On fixe le lieu une fois qu'on est alignés.`,
      `Hôtel ou appart, tant que c'est calme. Tu gères le spot ?`,
    ]);
  }

  if (/non|pas intéress|stop|laisse|degage|dégage/.test(t)) {
    return pick([
      `OK, pas de souci. Bonne soirée.`,
      `Compris. Je te laisse tranquille.`,
    ]);
  }

  if (turn <= 1) {
    return pick([
      `Salut — j'ai vu ton message sur le Flare. T'es dispo sur ${city} ?`,
      `Hey. ${intent} m'intéresse. Tu veux qu'on clarifie le cadre ?`,
      `Bien reçu. On reste soft et clair : qu'est-ce que tu cherches concrètement ?`,
    ]);
  }

  if (turn === 2) {
    return pick([
      `OK. Pour être carré : discret, consentement, on arrête dès que ça ne match pas.`,
      `Je préfère qu'on se parle 2–3 messages avant de se voir. Ça te va ?`,
      `Dis-moi ton rythme : verre d'abord ou plus direct ?`,
    ]);
  }

  return pick([
    `Hmm, développe un peu — je veux être sûre qu'on est sur la même longueur d'onde.`,
    `OK. Et côté timing / lieu sur ${city}, t'as une idée ?`,
    `Je suis là. Dis-moi ce qui te ferait vraiment kiffer ce soir.`,
    `Carré. On avance uniquement si c'est clair pour les deux.`,
  ]);
}

export function getBlockedIds(): string[] {
  return read<string[]>(BLOCKED_KEY, []);
}

export function blockId(id: string) {
  const list = getBlockedIds();
  if (!list.includes(id)) write(BLOCKED_KEY, [...list, id]);
  deleteConversationByFlareOrId(id);
}

export function reportTarget(id: string, reason: string) {
  const reports = read<{ id: string; reason: string; at: number }[]>(REPORTS_KEY, []);
  write(REPORTS_KEY, [...reports, { id, reason, at: Date.now() }]);
  blockId(id);
}

export function getFlares(): Flare[] {
  const blocked = getBlockedIds();
  const custom = read<Flare[]>(FLARES_KEY, []);
  const normalized = custom.map((f) => ({
    ...f,
    trust: f.trust > 5 ? computeTrust({ verified: f.verified, hasCity: true, hasActivity: true }) : f.trust,
  }));
  const all = [
    ...normalized,
    ...defaultFlares.filter((d) => !normalized.some((c) => c.id === d.id)),
  ];
  return all.filter((f) => !blocked.includes(f.id));
}

export function addFlare(
  flare: Omit<Flare, "id" | "trust" | "verified" | "mine">
): Flare {
  const full: Flare = {
    ...flare,
    id: `mine_${Date.now()}`,
    trust: computeTrust({
      verified: false,
      hasCity: Boolean(flare.city),
      hasActivity: true,
      accountAgeDays: 0,
    }),
    verified: false,
    mine: true,
  };
  const custom = read<Flare[]>(FLARES_KEY, []);
  write(FLARES_KEY, [full, ...custom]);
  return full;
}

export function getConversations(): Conversation[] {
  const blocked = getBlockedIds();
  return read<Conversation[]>(CONVOS_KEY, [])
    .filter((c) => !blocked.includes(c.id) && !blocked.includes(c.flareId))
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getConversation(id: string): Conversation | undefined {
  return getConversations().find((c) => c.id === id || c.flareId === id);
}

export function deleteConversationByFlareOrId(id: string) {
  const all = read<Conversation[]>(CONVOS_KEY, []);
  write(
    CONVOS_KEY,
    all.filter((c) => c.id !== id && c.flareId !== id)
  );
}

export function startConversation(flare: Flare): Conversation {
  const existing = getConversations().find((c) => c.flareId === flare.id);
  if (existing) return existing;

  const convo: Conversation = {
    id: flare.id.startsWith("c_") ? flare.id : `c_${flare.id}`,
    flareId: flare.id,
    city: flare.city,
    intent: flare.intent,
    messages: [
      {
        id: `m_${Date.now()}`,
        text: `Flare · ${flare.city} — ${flare.intent}`,
        fromMe: false,
        at: Date.now(),
      },
    ],
    updatedAt: Date.now(),
  };
  const all = read<Conversation[]>(CONVOS_KEY, []);
  write(CONVOS_KEY, [convo, ...all]);
  return convo;
}

export function sendMessage(
  convoId: string,
  text: string
): Conversation | undefined {
  const all = read<Conversation[]>(CONVOS_KEY, []);
  const idx = all.findIndex((c) => c.id === convoId || c.flareId === convoId);
  if (idx === -1) return undefined;

  const msg: Message = {
    id: `m_${Date.now()}`,
    text,
    fromMe: true,
    at: Date.now(),
  };

  const prev = all[idx];
  const myTurns = prev.messages.filter((m) => m.fromMe).length;

  all[idx] = {
    ...prev,
    messages: [...prev.messages, msg],
    updatedAt: Date.now(),
  };

  const replyText = buildAutoReply(
    text,
    prev.city,
    prev.intent,
    myTurns + 1
  );

  const reply: Message = {
    id: `m_${Date.now() + 1}`,
    text: replyText,
    fromMe: false,
    at: Date.now() + 400,
  };
  all[idx].messages.push(reply);

  write(CONVOS_KEY, all);
  return all[idx];
}
