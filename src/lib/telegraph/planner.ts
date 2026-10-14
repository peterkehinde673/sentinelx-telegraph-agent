import type { IntentCatalog } from "./catalog";
import type { MinerCatalog, TelegraphMiner } from "./miners";

export type IntentExecutionReadiness =
  | "schema_validation_required"
  | "schema_missing"
  | "unavailable"
  | "unknown";

export type IntentExecutionPlan = {
  intentId: string;
  description: string;
  reportedMinerCount: number | null;
  readiness: IntentExecutionReadiness;
  candidateMiners: Array<{
    id: string;
    name: string;
    endpointCount: number;
    schemaSource: "endpoint" | "miner" | "missing";
  }>;
  reason: string;
};

export type GenericExecutionPlan = {
  source: "live" | "fallback";
  minerSource: "live" | "fallback";
  plannedAt: string;
  intents: IntentExecutionPlan[];
  proposedCount: number;
  paidExecutionAllowed: false;
};

/**
 * Builds a generic, read-only plan for every canonical intent in the supplied
 * live catalogue. It deliberately does not use EXCHANGE_INTENTS as an allowlist
 * and never authorizes a paid request.
 */
export function buildGenericExecutionPlan(
  intents: IntentCatalog,
  miners: MinerCatalog,
  now: Date = new Date()
): GenericExecutionPlan {
  const discoveryIsLive = intents.source === "live" && miners.source === "live";
  const planned = [...intents.canonical].sort((a, b) => a.id.localeCompare(b.id)).map((intent): IntentExecutionPlan => {
    const declared = miners.miners.filter((miner) =>
      (miner.activationStatus ?? "").toLowerCase() === "active" &&
      miner.supportedIntents.includes(intent.id) &&
      miner.endpoints.length > 0
    );

    if (!discoveryIsLive) {
      return {
        intentId: intent.id,
        description: intent.description,
        reportedMinerCount: intent.minerCount,
        readiness: "unknown",
        candidateMiners: [],
        reason: "Both live canonical-intent and miner discovery must succeed before planning candidates."
      };
    }

    if (declared.length === 0) {
      return {
        intentId: intent.id,
        description: intent.description,
        reportedMinerCount: intent.minerCount,
        readiness: "unavailable",
        candidateMiners: [],
        reason: "No active discovered miner declares this intent with a valid endpoint."
      };
    }

    const candidateMiners = declared.map((miner: TelegraphMiner) => {
      const endpointHasSchema = miner.endpoints.some((endpoint) => isSchemaRecord(endpoint.schema));
      const minerHasSchema = isSchemaRecord(miner.inputSchema);
      return {
        id: miner.id,
        name: miner.name,
        endpointCount: miner.endpoints.length,
        schemaSource: endpointHasSchema ? "endpoint" as const : minerHasSchema ? "miner" as const : "missing" as const
      };
    });
    const anyEndpointSchema = candidateMiners.some((candidate) => candidate.schemaSource === "endpoint");

    return {
      intentId: intent.id,
      description: intent.description,
      reportedMinerCount: intent.minerCount,
      readiness: anyEndpointSchema ? "schema_validation_required" : "schema_missing",
      candidateMiners,
      reason: anyEndpointSchema
        ? "Endpoint-level schema metadata exists, but it must be validated against the selected intent and endpoint before execution."
        : "Candidates declare this intent, but no endpoint-level input schema was discovered. Miner-level schemas are not assumed to match every endpoint."
    };
  });

  return {
    source: intents.source,
    minerSource: miners.source,
    plannedAt: now.toISOString(),
    intents: planned,
    proposedCount: intents.proposed.length,
    paidExecutionAllowed: false
  };
}

function isSchemaRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value) &&
    (typeof (value as Record<string, unknown>).type === "string" ||
      typeof (value as Record<string, unknown>).properties === "object" ||
      typeof (value as Record<string, unknown>).$schema === "string");
}
