import { describe, expect, it } from "vitest";
import { buildIntentAvailabilityCatalog } from "./availability";
import type { IntentCatalog } from "./catalog";
import type { MinerCatalog } from "./miners";

const intents: IntentCatalog = {
  canonical: [
    { id: "CODE_REVIEW", description: "Review code", minerCount: 1, source: "telegraph" },
    { id: "WEB_SEARCH", description: "Search", minerCount: 0, source: "telegraph" }
  ],
  proposed: [],
  fetchedAt: "2026-10-14T08:00:00.000Z",
  source: "live"
};

const miners: MinerCatalog = {
  miners: [{
    id: "12", name: "Review miner", slug: "review-miner", activationStatus: "active",
    supportedIntents: ["CODE_REVIEW"], minPriceUsdc: 0.01,
    endpoints: [{ path: "/review", method: "POST", schema: { type: "object" } }]
  }],
  fetchedAt: "2026-10-14T08:01:00.000Z",
  source: "live"
};

describe("combined intent availability", () => {
  it("marks an intent available only when an active discovered miner declares a valid endpoint", () => {
    const result = buildIntentAvailabilityCatalog(intents, miners);
    expect(result.canonical[0].availability).toEqual({
      intentId: "CODE_REVIEW", status: "available", activeMinerIds: ["12"], reportedMinerCount: 1, reason: null
    });
    expect(result.canonical[1].availability.status).toBe("unavailable");
    expect(result.canonical[1].availability.activeMinerIds).toEqual([]);
    expect(result.source).toBe("live");
    expect(result.minerSource).toBe("live");
  });

  it("never infers unavailable when either live discovery source failed", () => {
    const offline: MinerCatalog = { miners: [], fetchedAt: null, source: "fallback", error: "offline" };
    const result = buildIntentAvailabilityCatalog(intents, offline);
    expect(result.canonical.every((intent) => intent.availability.status === "unknown")).toBe(true);
    expect(result.canonical.every((intent) => intent.availability.activeMinerIds.length === 0)).toBe(true);
    expect(result.fetchedAt).toBeNull();
    expect(result.error).toContain("offline");
  });
});
