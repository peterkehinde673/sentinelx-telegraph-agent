import { describe, expect, it } from "vitest";
import { buildGenericExecutionPlan } from "./planner";
import type { IntentCatalog } from "./catalog";
import type { MinerCatalog } from "./miners";

const intents: IntentCatalog = {
  canonical: [
    { id: "SMART_CONTRACT_AUDIT", description: "Audit", minerCount: 1, source: "telegraph" },
    { id: "A_NEW_INTENT_ADDED_LATER", description: "Future canonical intent", minerCount: 1, source: "telegraph" },
    { id: "UNSERVED_INTENT", description: "No current provider", minerCount: 0, source: "telegraph" }
  ],
  proposed: [{ id: "LOCAL_PROPOSAL", label: "Local proposal", category: "Test", purpose: "Not canonical" }],
  fetchedAt: "2026-10-14T00:00:00.000Z",
  source: "live"
};

const miners: MinerCatalog = {
  miners: [
    {
      id: "11", name: "Audit Miner", slug: "audit", activationStatus: "active",
      supportedIntents: ["SMART_CONTRACT_AUDIT"], minPriceUsdc: null,
      endpoints: [{ path: "/audit", method: "POST", schema: null }],
      inputSchema: { type: "object", properties: { address: { type: "string" } } }
    },
    {
      id: "12", name: "New Intent Miner", slug: "new-intent", activationStatus: "active",
      supportedIntents: ["A_NEW_INTENT_ADDED_LATER"], minPriceUsdc: null,
      endpoints: [{ path: "/inspect", method: "POST", schema: { type: "object", properties: { input: { type: "string" } } } }]
    }
  ],
  fetchedAt: "2026-10-14T00:00:00.000Z",
  source: "live"
};

describe("generic intent execution planning", () => {
  it("plans every canonical intent without a six-intent allowlist", () => {
    const result = buildGenericExecutionPlan(intents, miners, new Date("2026-10-14T12:00:00.000Z"));
    expect(result.intents.map((item) => item.intentId)).toEqual([
      "A_NEW_INTENT_ADDED_LATER", "SMART_CONTRACT_AUDIT", "UNSERVED_INTENT"
    ]);
    expect(result.intents.find((item) => item.intentId === "A_NEW_INTENT_ADDED_LATER")?.readiness).toBe("schema_validation_required");
    expect(result.intents.find((item) => item.intentId === "SMART_CONTRACT_AUDIT")?.readiness).toBe("schema_missing");
    expect(result.intents.find((item) => item.intentId === "UNSERVED_INTENT")?.readiness).toBe("unavailable");
    expect(result.proposedCount).toBe(1);
    expect(result.paidExecutionAllowed).toBe(false);
  });

  it("does not infer candidates when either discovery source is offline", () => {
    const offline: MinerCatalog = { miners: [], fetchedAt: null, source: "fallback", error: "offline" };
    const result = buildGenericExecutionPlan(intents, offline, new Date("2026-10-14T12:00:00.000Z"));
    expect(result.intents).toHaveLength(intents.canonical.length);
    expect(result.intents.every((item) => item.readiness === "unknown" && item.candidateMiners.length === 0)).toBe(true);
    expect(result.paidExecutionAllowed).toBe(false);
  });
});
