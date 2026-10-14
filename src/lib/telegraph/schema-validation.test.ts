import { describe, expect, it } from "vitest";
import { inspectJsonSchema, validateJsonValue } from "./schema-validation";

describe("conservative schema inspection", () => {
  it("accepts a supported object schema and validates required fields and types", () => {
    const schema = {
      type: "object",
      properties: { address: { type: "string", minLength: 4 }, chainId: { type: "integer", minimum: 1 } },
      required: ["address", "chainId"],
      additionalProperties: false
    };
    expect(inspectJsonSchema(schema).status).toBe("valid");
    expect(validateJsonValue({ address: "0xabc", chainId: 84532 }, schema)).toEqual({ status: "valid", errors: [] });
    expect(validateJsonValue({ address: "x", chainId: 0 }, schema).status).toBe("invalid");
    expect(validateJsonValue({ address: "0xabc" }, schema).status).toBe("invalid");
    expect(validateJsonValue({ address: "0xabc", chainId: 1, extra: true }, schema).status).toBe("invalid");
  });

  it("fails closed for unsupported schema keywords rather than guessing", () => {
    const result = inspectJsonSchema({ type: "object", oneOf: [{ type: "string" }] });
    expect(result.status).toBe("unsupported");
    expect(result.errors[0]).toContain("oneOf");
    expect(validateJsonValue("x", { type: "string", pattern: "^x" }).status).toBe("unsupported");
  });

  it("rejects malformed schema shapes", () => {
    expect(inspectJsonSchema(null).status).toBe("invalid");
    expect(inspectJsonSchema({ type: "made-up" }).status).toBe("unsupported");
    expect(inspectJsonSchema({ type: "array", items: { type: "integer" } }).status).toBe("valid");
    expect(validateJsonValue([1, 2], { type: "array", items: { type: "integer" } }).status).toBe("valid");
    expect(validateJsonValue([1, "two"], { type: "array", items: { type: "integer" } }).status).toBe("invalid");
  });
});
