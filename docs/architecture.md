# SentinelX architecture (initial plan)

## Current state

The current application is a dashboard scaffold with a typed catalogue of Exchange mission Intents. It does not yet make Telegraph requests, sign transactions, settle payments, verify receipts, or generate live risk conclusions.

## Target request lifecycle

1. **Intake** — accept a token address, network, and requested listing decision.
2. **Validation** — validate address format and supported network configuration before spending.
3. **Plan** — select the mission-relevant Telegraph Intents and apply a configurable spend limit.
4. **Purchase** — issue paid requests through Telegraph's supported router/SDK; never call a provider directly as a substitute.
5. **Verify** — validate each returned answer, provider/miner identity, confidence/evaluation metadata, receipt, cost, chain/network and transaction hash.
6. **Synthesize** — derive a risk memo from received evidence, show missing or conflicting results, and avoid presenting model confidence as certainty.
7. **Audit trail** — store request status and evidence references without exposing secrets or unnecessarily retaining sensitive data.
8. **Display** — show a spend panel with clickable explorer links and an always-visible testnet boundary.

## Proposed module boundaries

- `src/lib/telegraph`: official SDK adapter, Intent catalogue, request/receipt types.
- `src/lib/agent`: plan, budget controls, orchestration, memo synthesis.
- `src/lib/risk`: evidence normalization and explainable risk factors.
- `src/lib/config`: network, chain ID, router, token and pricing configuration.
- `src/app`: dashboard and server-side endpoints.

These modules should be added after confirming the official Season II integration guide and contract interfaces. Do not invent SDK methods or contract addresses.

## Security and integrity requirements

- No private key or signing secret in browser code, git history, or `NEXT_PUBLIC_*` variables.
- Fail closed if network configuration or receipt verification is missing.
- Apply request budgets, timeouts, schema validation, and bounded retries.
- Separate sample fixtures from live data and label fixtures clearly.
- Keep transaction hashes and costs tied to the actual returned settlement evidence.
- Include a clear testnet boundary and make network-specific values configuration, not hard-coded business logic.
