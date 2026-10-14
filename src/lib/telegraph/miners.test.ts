import { describe, expect, it } from "vitest";
import { getMinerCatalog, parseMinerCatalog } from "./miners";

describe("Telegraph miner discovery normalization", () => {
  it("parses documented miner fields and supported intents", () => {
    expect(parseMinerCatalog([{
      id: 12,
      slug: "sample-miner",
      name: "Sample Miner",
      activation_status: "active",
      supported_intents: ["CODE_REVIEW", "WEB_SEARCH", "invalid"],
      min_price_usdc: "0.01",
      endpoints: [{ path: "/review", method: "POST" }]
    }])).toEqual([{
      id: "12",
      name: "Sample Miner",
      slug: "sample-miner",
      activationStatus: "active",
      supportedIntents: ["CODE_REVIEW", "WEB_SEARCH"],
      minPriceUsdc: 0.01,
      endpoints: [{ path: "/review", method: "POST" }]
    }]);
  });

  it("supports wrapped payloads, deduplicates by ID, and sorts numerically", () => {
    const miners = parseMinerCatalog({ data: [
      { id: 10, name: "Ten" },
      { id: 2, name: "Two" },
      { id: 2, name: "Two updated", supported_intents: ["CODE_REVIEW"] },
      { id: "bad" },
      null
    ] });
    expect(miners.map((miner) => miner.id)).toEqual(["2", "10"]);
    expect(miners[0].name).toBe("Two updated");
  });

  it("returns an empty list for unrecognized payloads", () => {
    expect(parseMinerCatalog({ unexpected: [] })).toEqual([]);
    expect(parseMinerCatalog([])).toEqual([]);
  });

  it("returns fallback state for HTTP failures", async () => {
    const result = await getMinerCatalog(async () => new Response("offline", { status: 503 }));
    expect(result.source).toBe("fallback");
    expect(result.miners).toEqual([]);
    expect(result.error).toContain("HTTP 503");
  });

  it("returns fallback state for empty catalogues and network errors", async () => {
    const empty = await getMinerCatalog(async () => Response.json([]));
    expect(empty.source).toBe("fallback");
    expect(empty.error).toContain("empty or unrecognized");

    const offline = await getMinerCatalog(async () => { throw new Error("network offline"); });
    expect(offline.source).toBe("fallback");
    expect(offline.error).toBe("network offline");
    expect(offline.fetchedAt).toBeNull();
  });
});
