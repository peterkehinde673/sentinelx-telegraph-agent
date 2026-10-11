# SentinelX — Telegraph Intelligence Agent

SentinelX is being built for Telegraph Hackathon Season II, Apps & Agents track, with the Exchange mission as its initial target.

It is intended to coordinate ranked intelligence requests, collect verifiable Telegraph receipts, and produce an evidence-backed listing risk memo with a transparent cost line.

> **Current status:** foundation scaffold only. Telegraph request execution, payment settlement, receipt verification, and risk scoring from live intelligence are not yet implemented. The interface must never represent demo data as live network results.

## Development approach

- GitHub-first: source changes and automated checks live in this repository.
- GitHub Actions: type-check, tests, and production build.
- Ubuntu in Termux: only for tasks that cannot reasonably be completed in GitHub or GitHub Actions.
- Testnet first, with chain/network/token/pricing settings kept in configuration rather than hard-coded into business logic.

## Stack

- Next.js + React + TypeScript
- Vitest for unit tests
- GitHub Actions for CI
- Telegraph integration to be added after verifying the official SDK/contracts and current build instructions

## Local development (fallback only)

```bash
npm install
npm run dev
npm run typecheck
npm test
npm run build
```

## Current intelligence plan

The initial Exchange mission plan references these Telegraph Intents:

- `SMART_CONTRACT_AUDIT`
- `ONCHAIN_METRIC_VERIFY`
- `SANCTIONS_SCREENING_MATCH`
- `SOCIAL_BOT_DETECTION`
- `CODE_REVIEW`
- `WASH_TRADING_DETECTION`

These names describe the planned request types, not evidence that live calls are connected.

## Required before competition submission

1. Implement actual paid requests through Telegraph routing.
2. Display real provider/miner details, cost, network label, transaction hash, and verifiable receipt per request.
3. Verify at least one autonomous machine-to-machine transaction.
4. Show the testnet boundary clearly and support switching network-specific values through configuration.
5. Add integration tests and a public demo URL.
6. Never claim an unverified or simulated transaction is real.

## Security

Never commit private keys, seed phrases, API secrets, or production credentials. Use GitHub Actions secrets and server-side environment variables for sensitive values.
