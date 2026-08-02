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
const BLOCKED_KEY = "flare24_blocked";
const REPORTS_KEY = "flare24_reports";

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
  const all = [
    ...custom,
    ...defaultFlares.filter((d) => !custom.some((c) => c.id === d.id)),
  ];
  return all.filter((f) => !blocked.includes(f.id));
}

export function addFlare(
  flare: Omit<Flare, "id" | "trust" | "verified" | "mine">
): Flare {
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

  all[idx] = {
    ...all[idx],
    messages: [...all[idx].messages, msg],
    updatedAt: Date.now(),
  };

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
