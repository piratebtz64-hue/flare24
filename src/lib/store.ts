export type Flare = {
  id: string;
  city: string;
  intent: string;
  tag: string;
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

const defaultFlares: Flare[] = [
  {
    id: "f1",
    city: "Bayonne",
    intent: "Ce soir · discret",
    tag: "Hôtel",
    trust: 94,
    expires: "2h",
    verified: true,
  },
  {
    id: "f2",
    city: "Biarritz",
    intent: "Après-midi · intensité",
    tag: "Appartement",
    trust: 88,
    expires: "45min",
    verified: true,
  },
  {
    id: "f3",
    city: "Anglet",
    intent: "Soirée · découverte",
    tag: "Bar d'abord",
    trust: 91,
    expires: "3h",
    verified: true,
  },
  {
    id: "f4",
    city: "Saint-Jean-de-Luz",
    intent: "Maintenant · urgent",
    tag: "Privé",
    trust: 96,
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

export function getFlares(): Flare[] {
  const custom = read<Flare[]>(FLARES_KEY, []);
  return [...custom, ...defaultFlares.filter((d) => !custom.some((c) => c.id === d.id))];
}

export function addFlare(flare: Omit<Flare, "id" | "trust" | "verified" | "mine">): Flare {
  const full: Flare = {
    ...flare,
    id: `mine_${Date.now()}`,
    trust: 90,
    verified: true,
    mine: true,
  };
  const custom = read<Flare[]>(FLARES_KEY, []);
  write(FLARES_KEY, [full, ...custom]);
  return full;
}

export function getConversations(): Conversation[] {
  return read<Conversation[]>(CONVOS_KEY, []).sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getConversation(id: string): Conversation | undefined {
  return getConversations().find((c) => c.id === id);
}

export function startConversation(flare: Flare): Conversation {
  const existing = getConversations().find((c) => c.flareId === flare.id);
  if (existing) return existing;

  const convo: Conversation = {
    id: `c_${Date.now()}`,
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
  const all = getConversations();
  write(CONVOS_KEY, [convo, ...all]);
  return convo;
}

export function sendMessage(convoId: string, text: string): Conversation | undefined {
  const all = getConversations();
  const idx = all.findIndex((c) => c.id === convoId);
  if (idx === -1) return undefined;

  const msg: Message = {
    id: `m_${Date.now()}`,
    text,
    fromMe: true,
    at: Date.now(),
  };

  all[idx] = {
    ...all[idx],
    messages: [...all[idx].messages, msg],
    updatedAt: Date.now(),
  };

  // Auto-reply léger pour que ça paraisse vivant
  const reply: Message = {
    id: `m_${Date.now() + 1}`,
    text: "Bien reçu. On peut en parler discrètement.",
    fromMe: false,
    at: Date.now() + 1,
  };
  all[idx].messages.push(reply);

  write(CONVOS_KEY, all);
  return all[idx];
}
