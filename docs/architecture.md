# SentinelX architecture (initial plan)

## Current state

The current application is a dashboard scaffold with a typed catalogue of Exchange mission Intents. It does not yet make paid Telegraph requests, sign transactions, settle payments, verify receipts, or generate live risk conclusions.

## Verified Telegraph integration facts

- Season II's Exchange mission is an Apps & Agents use case.
- The documented testnet is **Base Sepolia**, EVM chain ID **84532**.
- The documented engine base URL is `https://devnode.telegraphprotocol.com/engine`.
- Paid inference uses Telegraph's x402 payment flow; the documented client packages include `@x402/fetch` and `@x402/evm`.
- Successful paid calls can return `X-TELEGRAPH-RECEIPT`, including receipt hash, miner, Intent, amount, settlement chain and transaction hash.
- The actual payment challenge is authoritative for the amount and destination. Never hard-code a payment recipient or assume the request price.
- The live miner catalogue and supported Intents can change. Discovery endpoints are the source of truth.

Official references:
- https://hackathon.telegraphprotocol.com/missions/exchange
- https://hackathon.telegraphprotocol.com/rules
- https://docs.telegraphprotocol.com/docs/using/engine-ask
- https://docs.telegraphprotocol.com/docs/using/x402-inference
- https://docs.telegraphprotocol.com/docs/protocol/addresses-and-params

## Target request lifecycle

1. **Intake** — accept a token address, network, and the listing decision to make.
2. **Validation** — validate address format and supported network configuration before spending.
3. **Discovery** — inspect live miners, declared Intents, schemas and floor prices before requesting paid work.
4. **Budget preflight** — read the actual x402 payment challenge, calculate the offered price and enforce a user-approved spend ceiling before signing.
5. **Purchase** — issue paid requests through Telegraph's supported engine/x402 flow; never call an upstream provider directly as a substitute.
6. **Verify** — validate each returned answer, miner identity, receipt, cost, chain/network and transaction hash.
7. **Synthesize** — derive a risk memo from received evidence, show missing or conflicting results, and avoid presenting model confidence as certainty.
8. **Audit trail** — store request status and evidence references without exposing secrets or unnecessarily retaining sensitive data.
9. **Display** — show a spend panel with clickable explorer links and an always-visible testnet boundary.

## Proposed module boundaries

- `src/lib/telegraph`: discovery client, x402 adapter, Intent catalogue, request/receipt types.
- `src/lib/agent`: plan, budget controls, orchestration, memo synthesis.
- `src/lib/risk`: evidence normalization and explainable risk factors.
- `src/lib/config`: network, chain ID, token and pricing configuration.
- `src/app`: dashboard and server-side endpoints.

Implement the adapter against the official API and package signatures. Do not invent SDK methods or contract addresses.

## Security and integrity requirements

- No private key or signing secret in browser code, git history, or `NEXT_PUBLIC_*` variables.
- Fail closed if network configuration or receipt verification is missing.
- Apply request budgets, timeouts, schema validation, and bounded retries.
- Preflight the actual payment challenge and do not sign until the amount is within the user-approved ceiling.
- Separate sample fixtures from live data and label fixtures clearly.
- Keep transaction hashes and costs tied to the actual returned settlement evidence.
- Include a clear testnet boundary and make network-specific values configuration, not hard-coded business logic.
