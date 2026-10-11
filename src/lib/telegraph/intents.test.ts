import { describe, expect, it } from "vitest";
import {
  EXCHANGE_INTENTS,
  getExchangeIntent,
  isExchangeIntentId
} from "./intents";

describe("Exchange intent catalogue", () => {
  it("contains the mission's planned intelligence requests", () => {
    expect(EXCHANGE_INTENTS.length).toBeGreaterThanOrEqual(5);
    expect(isExchangeIntentId("SMART_CONTRACT_AUDIT")).toBe(true);
    expect(isExchangeIntentId("ONCHAIN_METRIC_VERIFY")).toBe(true);
    expect(isExchangeIntentId("SANCTIONS_SCREENING_MATCH")).toBe(true);
  });

  it("returns a known intent and safely rejects unknown values", () => {
    expect(getExchangeIntent("CODE_REVIEW")?.label).toBe("Contributor and code review");
    expect(getExchangeIntent("NOT_A_REAL_INTENT")).toBeUndefined();
    expect(isExchangeIntentId("NOT_A_REAL_INTENT")).toBe(false);
  });
});
