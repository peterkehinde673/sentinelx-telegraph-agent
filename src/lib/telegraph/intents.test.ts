import { describe, expect, it } from "vitest";
import {
  EXCHANGE_INTENTS,
  getExchangeIntent,
  isExchangeIntentId
} from "./intents";
import { getIntentCatalog, parseCanonicalIntents } from "./catalog";
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

  it("accepts the captured live Telegraph intent record shape", () => {
    expect(parseCanonicalIntents({
      count: 134,
      canonical_on_chain: 134,
      with_miners: 134,
      intents: [{
        intent_id: "SMART_CONTRACT_AUDIT",
        intent_name: "SMART_CONTRACT_AUDIT",
        description: "Inspects bytecode and smart contract source code.",
        miner_count: 11,
        canonical: true
      }]
    })).toEqual([{
      id: "SMART_CONTRACT_AUDIT",
      description: "Inspects bytecode and smart contract source code.",
      minerCount: 11,
      source: "telegraph"
    }]);
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


  it("returns an empty list for empty, unknown, or non-array payloads", () => {
    expect(parseCanonicalIntents([])).toEqual([]);
    expect(parseCanonicalIntents({ intents: [] })).toEqual([]);
    expect(parseCanonicalIntents({ unexpected: [{ id: "WEB_SEARCH" }] })).toEqual([]);
    expect(parseCanonicalIntents("not-json-records")).toEqual([]);
  });

  it("does not accept malformed IDs or invalid miner counts", () => {
    expect(parseCanonicalIntents([
      { id: "lowercase_bad" },
      { id: "WEB_SEARCH", miner_count: -2 },
      { id: "CODE_REVIEW", miner_count: "many" }
    ])).toEqual([
      { id: "CODE_REVIEW", description: "Canonical intent reported by Telegraph.", minerCount: null, source: "telegraph" },
      { id: "WEB_SEARCH", description: "Canonical intent reported by Telegraph.", minerCount: null, source: "telegraph" }
    ]);
  });

  it("returns an explicit fallback state for HTTP failures", async () => {
    const fakeFetch: typeof fetch = async () => new Response("unavailable", { status: 503 });
    const result = await getIntentCatalog(fakeFetch);
    expect(result.source).toBe("fallback");
    expect(result.canonical).toEqual([]);
    expect(result.error).toContain("HTTP 503");
    expect(result.proposed.length).toBeGreaterThan(0);
  });

  it("treats an empty live catalogue as unavailable rather than success", async () => {
    const fakeFetch: typeof fetch = async () => Response.json({ intents: [] });
    const result = await getIntentCatalog(fakeFetch);
    expect(result.source).toBe("fallback");
    expect(result.canonical).toEqual([]);
    expect(result.error).toContain("empty or unrecognized");
  });

  it("returns fallback state when the request throws", async () => {
    const fakeFetch: typeof fetch = async () => { throw new Error("network offline"); };
    const result = await getIntentCatalog(fakeFetch);
    expect(result.source).toBe("fallback");
    expect(result.error).toBe("network offline");
    expect(result.fetchedAt).toBeNull();
  });

  it("keeps future proposals in a separate product registry", () => {
    expect(PROPOSED_FUTURE_INTENTS.length).toBeGreaterThan(10);
    const canonicalWorkflowIds = new Set<string>(EXCHANGE_INTENTS.map((intent) => intent.id));
    expect(PROPOSED_FUTURE_INTENTS.every((intent) => !canonicalWorkflowIds.has(intent.id))).toBe(true);
    expect(PROPOSED_FUTURE_INTENTS.every((intent) => intent.category && intent.purpose)).toBe(true);
  });
});
