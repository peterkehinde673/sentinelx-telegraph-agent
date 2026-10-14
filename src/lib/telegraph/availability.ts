import type { IntentCatalog } from "./catalog";
import type { MinerCatalog } from "./miners";
import { getIntentMinerAvailability } from "./miners";

export type IntentAvailability = {
  intentId: string;
  status: "available" | "unavailable" | "unknown";
  activeMinerIds: string[];
  reportedMinerCount: number | null;
  reason: string | null;
};

export type IntentAvailabilityCatalog = {
  canonical: (IntentCatalog["canonical"][number] & { availability: IntentAvailability })[];
  proposed: IntentCatalog["proposed"];
  fetchedAt: string | null;
  source: "live" | "fallback";
  minerSource: MinerCatalog["source"];
  error?: string;
};

/** Combines live intent registration and miner metadata without guessing on partial discovery failures. */
export function buildIntentAvailabilityCatalog(intents: IntentCatalog, miners: MinerCatalog): IntentAvailabilityCatalog {
  const discoveryVerified = intents.source === "live" && miners.source === "live";
  const canonical = intents.canonical.map((intent) => {
    const availability = getIntentMinerAvailability(miners.miners, intent.id);
    const status = !discoveryVerified ? "unknown" as const : availability.available ? "available" as const : "unavailable" as const;
    return {
      ...intent,
      availability: {
        intentId: intent.id,
        status,
        activeMinerIds: status === "available" ? availability.minerIds : [],
        reportedMinerCount: intent.minerCount,
        reason: status === "unknown" ? "Live intent and miner discovery must both succeed before availability can be confirmed."
          : status === "unavailable" ? availability.reason : null
      }
    };
  });
  const errors = [intents.error, miners.error].filter((value): value is string => Boolean(value));
  return {
    canonical,
    proposed: intents.proposed,
    fetchedAt: discoveryVerified ? [intents.fetchedAt, miners.fetchedAt].filter(Boolean).sort().at(-1) ?? null : null,
    source: intents.source,
    minerSource: miners.source,
    ...(errors.length ? { error: errors.join("; ") } : {})
  };
}
