import { createClient } from "@/lib/supabase/client";
import type { Flare } from "@/lib/store";
import { computeTrust, normalizeTrust } from "@/lib/trust";

type DbFlare = {
  id: string;
  user_id: string;
  city: string;
  intent: string;
  tag: string | null;
  expires_at: string;
  active: boolean;
  created_at: string;
};

function hoursFromLabel(label: string): number {
  if (label === "1h") return 1;
  if (label === "2h") return 2;
  if (label === "4h") return 4;
  if (label === "Ce soir") return 8;
  const m = label.match(/(\d+)/);
  return m ? Number(m[1]) : 2;
}

function formatExpires(expiresAt: string): string {
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return "expiré";
  const min = Math.round(ms / 60000);
  if (min < 60) return `${min}min`;
  const h = Math.round(min / 60);
  return `${h}h`;
}

function mapDbToFlare(row: DbFlare, myId?: string | null): Flare {
  return {
    id: row.id,
    city: row.city,
    intent: row.intent,
    tag: row.tag || "Privé",
    trust: normalizeTrust(
      computeTrust({
        verified: false,
        hasCity: Boolean(row.city),
        hasActivity: true,
        accountAgeDays: 3,
      }),
      false
    ),
    expires: formatExpires(row.expires_at),
    verified: false,
    mine: myId ? row.user_id === myId : false,
  };
}

/** Liste les Flares actifs en base (auth requis par RLS). */
export async function fetchFlaresFromDb(): Promise<Flare[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("flares")
    .select("id,user_id,city,intent,tag,expires_at,active,created_at")
    .eq("active", true)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(50);

  if (error || !data) {
    console.warn("[flares-db] fetch", error?.message);
    return [];
  }

  return (data as DbFlare[]).map((r) => mapDbToFlare(r, user?.id));
}

/** Crée un Flare en base. Retourne null si échec (fallback local). */
export async function createFlareInDb(input: {
  city: string;
  intent: string;
  tag: string;
  durationLabel: string;
}): Promise<Flare | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // Assure un profil (trigger peut manquer sur anciens comptes)
  await supabase.from("profiles").upsert(
    {
      id: user.id,
      display_name: user.email?.split("@")[0] ?? "membre",
    },
    { onConflict: "id" }
  );

  const hours = hoursFromLabel(input.durationLabel);
  const expires_at = new Date(Date.now() + hours * 3600 * 1000).toISOString();

  const { data, error } = await supabase
    .from("flares")
    .insert({
      user_id: user.id,
      city: input.city,
      intent: input.intent,
      tag: input.tag,
      expires_at,
      active: true,
    })
    .select("id,user_id,city,intent,tag,expires_at,active,created_at")
    .single();

  if (error || !data) {
    console.warn("[flares-db] create", error?.message);
    return null;
  }

  return mapDbToFlare(data as DbFlare, user.id);
}
