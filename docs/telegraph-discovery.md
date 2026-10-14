# Telegraph discovery integration notes

**Verification status:** Endpoint paths and response contracts below are documented by Telegraph's official documentation. The live node response has not yet been captured and checked from this development environment. The app must continue to display discovery as unavailable if the request fails or returns an unrecognized payload.

## Free discovery endpoints

- Canonical intents: `GET https://devnode.telegraphprotocol.com/engine/v1/intents`
- Miner catalogue: `GET https://devnode.telegraphprotocol.com/api/miners`
- Miners serving one intent: `GET https://devnode.telegraphprotocol.com/engine/v1/intents/{intent}/miners`
- Filtered miner catalogue: `GET https://devnode.telegraphprotocol.com/api/miners?intent={CANONICAL_INTENT}`
- Signal verification after a real request: `GET https://devnode.telegraphprotocol.com/engine/v1/signal/{signal_hash}`

## Documented data shape

The intent catalogue returns canonical intents with descriptions and a current miner count. Canonical registration does not guarantee active coverage, so a zero miner count must remain visible and must block paid execution for that intent.

The miner catalogue is documented as a JSON array. Records include numeric `id`, `slug`, `name`, `endpoints` (including path, method, and schema), `supported_intents`, `activation_status`, and `min_price_usdc`. The set changes as miners register or deregister. Numeric IDs must be taken from discovery at runtime and never copied from examples.

## Implementation in this repository

- `src/lib/telegraph/catalog.ts` normalizes the live canonical intent catalogue.
- `src/lib/telegraph/miners.ts` normalizes the miner catalogue, validates endpoint path/method metadata, and derives conservative per-intent availability only from active miners that declare the intent and at least one valid endpoint. Request schemas remain untrusted metadata and must be validated before execution.
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
