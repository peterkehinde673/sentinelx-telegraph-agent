export const TELEGRAPH_MINERS_URL = `${(process.env.TELEGRAPH_API_URL ?? "https://devnode.telegraphprotocol.com").replace(/\/$/, "")}/api/miners`;

export type TelegraphMinerEndpoint = {
  path: string;
  method: string;
  schema: unknown | null;
};

export type TelegraphMiner = {
  id: string;
  name: string;
  slug: string | null;
  activationStatus: string | null;
  supportedIntents: string[];
  minPriceUsdc: number | null;
  /** Provider-supplied miner-level schemas; untrusted until validated against a specific endpoint. */
  inputSchema?: unknown;
  outputSchema?: unknown;
  endpoints: TelegraphMinerEndpoint[];
};

export type MinerCatalog = {
  miners: TelegraphMiner[];
  fetchedAt: string | null;
  source: "live" | "fallback";
  error?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringValue(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function stringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((item): item is string => typeof item === "string" && /^[A-Z][A-Z0-9_]{1,95}$/.test(item)))].sort();
}

function readEndpoint(value: unknown): TelegraphMinerEndpoint | null {
  if (!isRecord(value)) return null;
  const path = stringValue(value.path ?? value.endpoint);
  const method = stringValue(value.method)?.toUpperCase() ?? null;
  if (!path || !path.startsWith("/") || !method || !/^(GET|POST|PUT|PATCH|DELETE)$/.test(method)) return null;
  return { path, method, schema: value.schema ?? value.input_schema ?? value.inputSchema ?? null };
}

function readMiner(value: unknown): TelegraphMiner | null {
  if (!isRecord(value)) return null;
  const idValue = value.id ?? value.miner_id ?? value.registration_id;
  const id = typeof idValue === "number" && Number.isSafeInteger(idValue) && idValue >= 0
    ? String(idValue)
    : typeof idValue === "string" && /^\d{1,20}$/.test(idValue) ? idValue : null;
  if (!id) return null;

  const priceValue = value.min_price_usdc ?? value.minPriceUsdc;
  const minPriceUsdc = typeof priceValue === "number" && Number.isFinite(priceValue) && priceValue >= 0
    ? priceValue
    : typeof priceValue === "string" && priceValue.trim() !== "" && Number.isFinite(Number(priceValue)) && Number(priceValue) >= 0
      ? Number(priceValue)
      : null;

  return {
    id,
    name: stringValue(value.name) ?? stringValue(value.slug) ?? `Miner ${id}`,
    slug: stringValue(value.slug),
    activationStatus: stringValue(value.activation_status) ?? stringValue(value.activationStatus) ?? stringValue(value.status),
    supportedIntents: stringList(value.supported_intents ?? value.supportedIntents ?? value.intents),
    minPriceUsdc,
    ...(Object.prototype.hasOwnProperty.call(value, "input_schema") ? { inputSchema: value.input_schema } : {}),
    ...(Object.prototype.hasOwnProperty.call(value, "output_schema") ? { outputSchema: value.output_schema } : {}),
    endpoints: Array.isArray(value.endpoints)
      ? value.endpoints.map(readEndpoint).filter((endpoint): endpoint is TelegraphMinerEndpoint => endpoint !== null)
      : []
  };
}

export function parseMinerCatalog(payload: unknown): TelegraphMiner[] {
  const candidate = Array.isArray(payload)
    ? payload
    : isRecord(payload)
      ? (Array.isArray(payload.miners) ? payload.miners
        : Array.isArray(payload.data) ? payload.data
        : Array.isArray(payload.results) ? payload.results : [])
      : [];
  const byId = new Map<string, TelegraphMiner>();
  for (const entry of candidate) {
    const miner = readMiner(entry);
    if (miner) byId.set(miner.id, miner);
  }
  return [...byId.values()].sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
}

export async function getMinerCatalog(fetcher: typeof fetch = fetch): Promise<MinerCatalog> {
  try {
    const response = await fetcher(TELEGRAPH_MINERS_URL, {
      headers: { accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(4500)
    });
    if (!response.ok) throw new Error(`Telegraph miner discovery returned HTTP ${response.status}`);
    const miners = parseMinerCatalog(await response.json());
    if (miners.length === 0) throw new Error("Telegraph returned an empty or unrecognized miner catalogue");
    return { miners, fetchedAt: new Date().toISOString(), source: "live" };
  } catch (error) {
    return {
      miners: [],
      fetchedAt: null,
      source: "fallback",
      error: error instanceof Error ? error.message : "Unknown miner discovery error"
    };
  }
}

/** Returns only miners whose provider-reported state and endpoint metadata match the intent. */
export function getIntentMinerAvailability(miners: TelegraphMiner[], intentId: string) {
  const eligible = miners.filter((miner) =>
    (miner.activationStatus ?? "").toLowerCase() === "active" &&
    miner.supportedIntents.includes(intentId) &&
    miner.endpoints.length > 0
  );
  return {
    intentId,
    available: eligible.length > 0,
    minerIds: eligible.map((miner) => miner.id),
    reason: eligible.length > 0 ? null : "No active discovered miner declares this intent with a valid endpoint path and method."
  };
}
