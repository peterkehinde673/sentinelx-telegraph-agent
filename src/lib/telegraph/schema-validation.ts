/**
 * Conservative JSON Schema subset validator for untrusted Telegraph metadata.
 * This is not a full JSON Schema implementation: unknown keywords fail closed.
 * It is local validation only and never probes a miner endpoint.
 */
export type SchemaCheck =
  | { status: "valid"; errors: [] }
  | { status: "invalid"; errors: string[] }
  | { status: "unsupported"; errors: string[] };

const ALLOWED_KEYWORDS = new Set([
  "$schema", "$id", "title", "description", "type", "properties", "required",
  "additionalProperties", "enum", "items", "minLength", "maxLength",
  "minimum", "maximum", "minItems", "maxItems"
]);
const ALLOWED_TYPES = new Set(["object", "array", "string", "number", "integer", "boolean", "null"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function schemaProblems(schema: unknown, path = "$schema"): string[] {
  if (!isRecord(schema)) return [`${path} must be a JSON object`];
  const problems: string[] = [];
  for (const key of Object.keys(schema)) {
    if (!ALLOWED_KEYWORDS.has(key)) problems.push(`${path} uses unsupported keyword "${key}"`);
  }
  if (schema.type !== undefined && (typeof schema.type !== "string" || !ALLOWED_TYPES.has(schema.type))) {
    problems.push(`${path}.type is unsupported`);
  }
  if (schema.properties !== undefined) {
    if (!isRecord(schema.properties)) problems.push(`${path}.properties must be an object`);
    else for (const [key, child] of Object.entries(schema.properties)) problems.push(...schemaProblems(child, `${path}.properties.${key}`));
  }
  if (schema.required !== undefined &&
      (!Array.isArray(schema.required) || schema.required.some((key) => typeof key !== "string"))) {
    problems.push(`${path}.required must be an array of strings`);
  }
  if (schema.items !== undefined) problems.push(...schemaProblems(schema.items, `${path}.items`));
  if (schema.additionalProperties !== undefined && typeof schema.additionalProperties !== "boolean") {
    problems.push(`${path}.additionalProperties must be boolean in the supported subset`);
  }
  if (schema.enum !== undefined && (!Array.isArray(schema.enum) || schema.enum.length === 0)) {
    problems.push(`${path}.enum must be a non-empty array`);
  }
  for (const key of ["minLength", "maxLength", "minItems", "maxItems"] as const) {
    const value = schema[key];
    if (value !== undefined && (!Number.isSafeInteger(value) || (value as number) < 0)) problems.push(`${path}.${key} must be a non-negative integer`);
  }
  for (const key of ["minimum", "maximum"] as const) {
    const value = schema[key];
    if (value !== undefined && (typeof value !== "number" || !Number.isFinite(value))) problems.push(`${path}.${key} must be a finite number`);
  }
  return problems;
}

export function inspectJsonSchema(schema: unknown): SchemaCheck {
  const errors = schemaProblems(schema);
  if (errors.length === 0) return { status: "valid", errors: [] };
  const unsupported = errors.some((error) => error.includes("unsupported keyword") || error.includes("unsupported"));
  return { status: unsupported ? "unsupported" : "invalid", errors };
}

function matchesType(value: unknown, type: string): boolean {
  switch (type) {
    case "object": return isRecord(value);
    case "array": return Array.isArray(value);
    case "string": return typeof value === "string";
    case "number": return typeof value === "number" && Number.isFinite(value);
    case "integer": return typeof value === "number" && Number.isSafeInteger(value);
    case "boolean": return typeof value === "boolean";
    case "null": return value === null;
    default: return false;
  }
}

function valueProblems(value: unknown, schema: Record<string, unknown>, path: string): string[] {
  const errors: string[] = [];
  if (typeof schema.type === "string" && !matchesType(value, schema.type)) {
    return [`${path} must be ${schema.type}`];
  }
  if (Array.isArray(schema.enum) && !schema.enum.some((item) => Object.is(item, value))) {
    errors.push(`${path} must match one of the allowed enum values`);
  }
  if (typeof value === "string") {
    if (typeof schema.minLength === "number" && value.length < schema.minLength) errors.push(`${path} is shorter than minLength`);
    if (typeof schema.maxLength === "number" && value.length > schema.maxLength) errors.push(`${path} exceeds maxLength`);
  }
  if (typeof value === "number") {
    if (typeof schema.minimum === "number" && value < schema.minimum) errors.push(`${path} is below minimum`);
    if (typeof schema.maximum === "number" && value > schema.maximum) errors.push(`${path} exceeds maximum`);
  }
  if (Array.isArray(value)) {
    if (typeof schema.minItems === "number" && value.length < schema.minItems) errors.push(`${path} has fewer than minItems`);
    if (typeof schema.maxItems === "number" && value.length > schema.maxItems) errors.push(`${path} exceeds maxItems`);
    if (isRecord(schema.items)) value.forEach((item, index) => errors.push(...valueProblems(item, schema.items as Record<string, unknown>, `${path}[${index}]`)));
  }
  if (isRecord(value) && isRecord(schema.properties)) {
    const required = Array.isArray(schema.required) ? schema.required.filter((key): key is string => typeof key === "string") : [];
    for (const key of required) if (!(key in value)) errors.push(`${path}.${key} is required`);
    for (const [key, childSchema] of Object.entries(schema.properties)) {
      if (key in value && isRecord(childSchema)) errors.push(...valueProblems(value[key], childSchema, `${path}.${key}`));
    }
    if (schema.additionalProperties === false) {
      for (const key of Object.keys(value)) if (!(key in schema.properties)) errors.push(`${path}.${key} is not allowed`);
    }
  }
  return errors;
}

/** Validate a value only against schemas that pass inspectJsonSchema. */
export function validateJsonValue(value: unknown, schema: unknown): SchemaCheck {
  const inspected = inspectJsonSchema(schema);
  if (inspected.status !== "valid") return inspected;
  const errors = valueProblems(value, schema as Record<string, unknown>, "$input");
  return errors.length ? { status: "invalid", errors } : { status: "valid", errors: [] };
}
