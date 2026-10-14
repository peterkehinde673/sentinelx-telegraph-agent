import { PROPOSED_FUTURE_INTENTS } from "./future-intents";

export const TELEGRAPH_BASE_URL =
  process.env.TELEGRAPH_API_URL ?? "https://devnode.telegraphprotocol.com";

export type CanonicalIntent = {
  id: string;
  description: string;
  minerCount: number | null;
  source: "telegraph";
};

export type IntentCatalog = {
  canonical: CanonicalIntent[];
  proposed: typeof PROPOSED_FUTURE_INTENTS[number][];
  fetchedAt: string | null;
  source: "live" | "fallback";
  error?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readIntent(item: unknown): CanonicalIntent | null {
  if (typeof item === "string" && /^[A-Z][A-Z0-9_]{1,95}$/.test(item)) {
    return { id: item, description: "Canonical intent reported by Telegraph.", minerCount: null, source: "telegraph" };
  }
  if (!isRecord(item)) return null;
  const idValue = item.id ?? item.intent ?? item.name ?? item.intent_id;
  if (typeof idValue !== "string" || !/^[A-Z][A-Z0-9_]{1,95}$/.test(idValue)) return null;
  const descriptionValue = item.description ?? item.purpose ?? item.summary;
  const countValue = item.miner_count ?? item.minerCount ?? item.miners_count ?? item.active_miners;
  const minerCount = typeof countValue === "number" && Number.isFinite(countValue) && countValue >= 0
    ? countValue
    : null;
  return {
    id: idValue,
    description: typeof descriptionValue === "string" ? descriptionValue : "Canonical intent reported by Telegraph.",
    minerCount,
    source: "telegraph"
  };
}

export function parseCanonicalIntents(payload: unknown): CanonicalIntent[] {
  const candidate = Array.isArray(payload)
    ? payload
    : isRecord(payload)
      ? (Array.isArray(payload.intents) ? payload.intents
        : Array.isArray(payload.data) ? payload.data
        : Array.isArray(payload.results) ? payload.results : [])
      : [];
  const byId = new Map<string, CanonicalIntent>();
  for (const entry of candidate) {
    const parsed = readIntent(entry);
    if (parsed) byId.set(parsed.id, parsed);
  }
  return [...byId.values()].sort((a, b) => a.id.localeCompare(b.id));
}

export async function getIntentCatalog(): Promise<IntentCatalog> {
  const endpoint = `${TELEGRAPH_BASE_URL.replace(/\/$/, "")}/engine/v1/intents`;
  try {
    const response = await fetch(endpoint, {
      headers: { accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(4500)
    });
    if (!response.ok) throw new Error(`Telegraph returned HTTP ${response.status}`);
    const canonical = parseCanonicalIntents(await response.json());
    if (canonical.length === 0) throw new Error("Telegraph returned an empty or unrecognized intent catalogue");
    return { canonical, proposed: [...PROPOSED_FUTURE_INTENTS], fetchedAt: new Date().toISOString(), source: "live" };
  } catch (error) {
    return {
      canonical: [],
      proposed: [...PROPOSED_FUTURE_INTENTS],
      fetchedAt: null,
      source: "fallback",
      error: error instanceof Error ? error.message : "Unknown catalogue fetch error"
    };
  }
}
