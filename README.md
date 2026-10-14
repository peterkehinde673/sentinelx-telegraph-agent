# SentinelX — Telegraph Intelligence Agent

SentinelX is being built for Telegraph Hackathon Season II, Apps & Agents track, with the Exchange mission as its initial commercial workflow.

It is intended to coordinate intelligence requests, collect verifiable Telegraph receipts, and produce evidence-backed token-listing risk reports with transparent cost and uncertainty.

> **Current status:** the foundation and live intent-catalogue discovery are being implemented. Paid request execution, settlement verification, and live risk scoring are not yet implemented. The interface must never represent demo data as live network results.

## Capability coverage

- **Canonical catalogue:** the app queries Telegraph's live `GET /engine/v1/intents` endpoint rather than hard-coding a frozen list. It normalizes the response and lets users search/filter the full set.
- **Miner availability:** canonical intent metadata includes the reported miner count where the endpoint provides it. A canonical intent may have no active miner, so future paid execution must check coverage before spending.
- **Forward-compatible roadmap:** product ideas for capabilities not yet canonical are maintained separately in `src/lib/telegraph/future-intents.ts`. They are labelled as proposals, never treated as registered intent IDs or sent to Telegraph as canonical intents.
- **Network changes:** the live list is re-fetched at request time; the app does not assume the current canonical set is permanent.
- **Graceful fallback:** if Telegraph's catalogue is unreachable, the UI reports that state honestly and still distinguishes proposals from canonical intents.

## Development approach

- GitHub-first: source changes and automated checks live in this repository.
- GitHub Actions: type-check, tests, and production build.
- Ubuntu in Termux: only for tasks that cannot reasonably be completed in GitHub or GitHub Actions.
- Testnet first, with chain/network/token/pricing settings kept in configuration rather than hard-coded into business logic.

## Stack

- Next.js + React + TypeScript
- Vitest for unit tests
- GitHub Actions for CI
- Telegraph's documented Engine API for live intent discovery

## Local development (fallback only)

```bash
npm install
npm run dev
npm run typecheck
npm test
npm run build
```

## Next implementation milestones

1. Discover live miners and request schemas for each selected canonical intent.
2. Implement paid Telegraph requests with server-side credentials, challenge inspection, explicit spending limits, and no default autonomous spend.
3. Display real miner/provider metadata, costs, network labels, transaction hashes, receipts, and independently verifiable signal hashes.
4. Verify at least one autonomous machine-to-machine transaction on the required testnet.
5. Build evidence-based scoring with provenance, timestamps, conflicts, missing data, and uncertainty surfaced.
6. Add integration tests and a public demo URL.
7. Never claim an unverified or simulated transaction is real.

## Security

Never commit private keys, seed phrases, API secrets, or production credentials. Use server-side environment variables or deployment secrets. Discovery must remain free and read-only; paid execution must not begin until the actual payment challenge and budget policy have been checked.

## Official references

- [Telegraph Intent documentation](https://docs.telegraphprotocol.com/docs/using/intents)
- [Telegraph Engine inference and discovery](https://docs.telegraphprotocol.com/docs/using/engine-ask)
- [Telegraph inference paths and verification](https://docs.telegraphprotocol.com/docs/using/inference-paths)
