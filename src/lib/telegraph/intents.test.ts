import { describe, expect, it } from "vitest";
import {
  EXCHANGE_INTENTS,
  getExchangeIntent,
  isExchangeIntentId
} from "./intents";
import { parseCanonicalIntents } from "./catalog";
import { PROPOSED_FUTURE_INTENTS } from "./future-intents";

describe("Exchange workflow intent catalogue", () => {
  it("contains the mission's planned intelligence requests", () => {
    expect(EXCHANGE_INTENTS.length).toBeGreaterThanOrEqual(5);
    expect(isExchangeIntentId("SMART_CONTRACT_AUDIT")).toBe(true);
    expect(isExchangeIntentId("ONCHAIN_METRIC_VERIFY")).toBe(true);
    expect(isExchangeIntentId("SANCTIONS_SCREENING_MATCH")).toBe(true);
  });

  it("returns a known workflow intent and safely rejects unknown values", () => {
    expect(getExchangeIntent("CODE_REVIEW")?.label).toBe("Contributor and code review");
    expect(getExchangeIntent("NOT_A_REAL_INTENT")).toBeUndefined();
    expect(isExchangeIntentId("NOT_A_REAL_INTENT")).toBe(false);
  });
});

describe("live canonical intent normalization", () => {
  it("accepts an array of Telegraph intent records", () => {
    expect(parseCanonicalIntents([
      { intent: "WEB_SEARCH", description: "Search the web", miner_count: 4 },
      { id: "CODE_REVIEW", description: "Review code", minerCount: 0 }
    ])).toEqual([
      { id: "CODE_REVIEW", description: "Review code", minerCount: 0, source: "telegraph" },
      { id: "WEB_SEARCH", description: "Search the web", minerCount: 4, source: "telegraph" }
    ]);
  });

  it("accepts wrapped payloads, deduplicates, and ignores malformed records", () => {
    const parsed = parseCanonicalIntents({ data: [
      { name: "WEB_SEARCH" },
      { name: "WEB_SEARCH", description: "Latest description", miner_count: 2 },
      { id: "not-valid" },
      null
    ] });
    expect(parsed).toHaveLength(1);
    expect(parsed[0]).toMatchObject({ id: "WEB_SEARCH", description: "Latest description", minerCount: 2 });
  });

  it("keeps future proposals in a separate product registry", () => {
    expect(PROPOSED_FUTURE_INTENTS.length).toBeGreaterThan(10);
    const canonicalWorkflowIds = new Set(EXCHANGE_INTENTS.map((intent) => intent.id));
    expect(PROPOSED_FUTURE_INTENTS.every((intent) => !canonicalWorkflowIds.has(intent.id))).toBe(true);
    expect(PROPOSED_FUTURE_INTENTS.every((intent) => intent.category && intent.purpose)).toBe(true);
  });
});
