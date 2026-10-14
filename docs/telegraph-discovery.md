# Telegraph discovery integration notes

**Live verification:** On 2026-10-14, GitHub Actions diagnostic run [#1](https://github.com/peterkehinde673/sentinelx-telegraph-agent/actions/runs/38555901596) received HTTP 200 and valid JSON from both public discovery endpoints. The captured intent response reported 134 canonical records (`count: 134`, `canonical_on_chain: 134`, `with_miners: 134`); the miner response contained 1,908 records and 2,218 endpoint entries. The intent IDs and miner IDs were unique in this snapshot. All 134 intents reported a positive `miner_count`; all 1,908 miner records reported `activation_status: active`. These are timestamped provider claims, not proof of endpoint health, successful paid execution, or settlement. The sanitized aggregate findings are recorded here; raw response artifacts expire after seven days. The app must still display discovery as unavailable if a later request fails or returns an unrecognized payload.

## Free discovery endpoints

- Canonical intents: `GET https://devnode.telegraphprotocol.com/engine/v1/intents`
- Miner catalogue: `GET https://devnode.telegraphprotocol.com/api/miners`
- Miners serving one intent: `GET https://devnode.telegraphprotocol.com/engine/v1/intents/{intent}/miners`
- Filtered miner catalogue: `GET https://devnode.telegraphprotocol.com/api/miners?intent={CANONICAL_INTENT}`
- Signal verification after a real request: `GET https://devnode.telegraphprotocol.com/engine/v1/signal/{signal_hash}`

## Documented data shape

The captured live intent shape is an object with `count`, `canonical_on_chain`, `with_miners`, and `intents`; each record uses `intent_id`, `intent_name`, `description`, `miner_count`, and `canonical`. The current parser successfully maps `intent_id`, `description`, and `miner_count`. The captured snapshot had 134 records, all marked `canonical: true`, with no duplicate IDs and no zero miner counts. Canonical registration does not guarantee active coverage, so a zero miner count must remain visible and must block paid execution for that intent.

The captured live miner response is a JSON array with 1,908 records. `id` values were numeric strings (for example `"9002"`), which the current parser accepts; each record also included `slug`, `name`, `endpoints`, `input_schema`, `output_schema`, `supported_intents`, `activation_status`, and `min_price_usdc`. All 1,908 records reported `active`, and the 2,218 endpoint entries contained `path`, `method`, and `description` but no per-endpoint schema field. 1,883 records had a top-level `input_schema` object and 183 had a top-level `output_schema` object. This differs from the documented per-endpoint schema description: execution planning must inspect and validate the top-level schema and endpoint descriptions, and must not assume each endpoint supplies its own schema. The set changes as miners register or deregister. IDs must be taken from discovery at runtime and never copied from examples.

## Implementation in this repository

- `src/lib/telegraph/catalog.ts` normalizes the live canonical intent catalogue.
- `src/lib/telegraph/miners.ts` normalizes the miner catalogue, preserves provider-supplied miner-level `input_schema` and `output_schema` as untrusted metadata, validates endpoint path/method metadata, and derives conservative per-intent availability only from active miners that declare the intent and at least one valid endpoint. Availability is a discovery-metadata result only. The live snapshot shows schemas are generally at miner level rather than endpoint level; schema-to-endpoint compatibility remains unverified and must be validated before execution.
- `src/app/api/intents/route.ts` and `src/app/api/miners/route.ts` expose no-store, read-only discovery routes.
- Unit tests cover malformed payloads, deduplication, endpoint path/method validation, conservative availability, empty responses, HTTP failures, and network errors.

## Safety constraints

- Discovery is free; do not use paid ask requests to probe miner schemas.
- Treat returned miner schemas and descriptions as untrusted input. Validate schemas before planning a paid call.
- Do not consider a miner available based only on its presence in the catalogue; evaluate its activation state and whether it declares the requested canonical intent.
- Do not sign payment or trigger paid inference from catalogue page loads.
- No live miner, price, receipt, transaction, or settlement is claimed by the unit tests.

## Official references

- [Engine Inference](https://docs.telegraphprotocol.com/docs/using/engine-ask)
- [Intents](https://docs.telegraphprotocol.com/docs/using/intents)
- [Paying with x402](https://docs.telegraphprotocol.com/docs/using/x402-inference)
