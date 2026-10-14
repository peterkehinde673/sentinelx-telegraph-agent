# SentinelX — Master Build Plan and Progress Ledger

> **Control file:** `.sentinelx/MASTER_PLAN.md`
>
> This is the single source of truth for project phases, acceptance criteria, and remaining work. Read it before every SentinelX work session and update it at the end of each meaningful work session.
>
> **Editing rule:** The phase names, scope, task lists, requirements, and acceptance criteria are fixed once this file is established. Do not rewrite, reorder, expand, or silently remove them. The only routine edits permitted are changing a phase's progress marker from `[ ]` to `[x]` after all of that phase's acceptance criteria are verified, and updating the small `Last verified` / `Current next action` fields below. Do not mark a phase complete based on code being written alone; evidence must exist in the repository, automated checks, a verifiable network result, or a documented manual verification. If scope genuinely changes, append a dated amendment at the bottom rather than rewriting the original plan.
>
> **Repository:** https://github.com/peterkehinde673/sentinelx-telegraph-agent
>
> **Operating constraint:** GitHub-first development. Use repository edits, GitHub Actions, and GitHub-connected tools wherever possible. Use Ubuntu in Termux only for tasks that cannot reasonably be completed through the GitHub workflow.
>
> **Safety rule:** Never commit private keys, seed phrases, live credentials, or payment secrets. Never report simulated results, placeholder receipts, or unverified hashes as real.

## Project definition

SentinelX is an autonomous token-intelligence and listing-risk agent for Telegraph Season II (Apps & Agents track, Exchange mission). A user supplies a chain and token contract/address; SentinelX discovers available intelligence capabilities, selects suitable canonical Telegraph intents and miners, performs only authorized paid requests, verifies returned evidence and receipts, and produces a reproducible token-listing risk memo with transparent costs, provenance, uncertainty, and verifiable transaction references.

The product must cover:
1. **Every canonical Telegraph Intent** discovered from Telegraph's live catalogue, not a manually frozen subset.
2. **Every canonical intent that is currently unavailable**, by showing its registration status and availability accurately and explaining when no miner can serve it; never pretend it ran.
3. **Future/unregistered capabilities** maintained in a separate internal proposal registry. These are product capabilities or planned adapters, not canonical Telegraph intent IDs. They must never be sent to Telegraph as registered intents unless Telegraph officially registers them.
4. **Unknown future canonical intents** without requiring a code release just to appear in the catalogue. A generic adapter must be used when an intent is supported by the live protocol and its request schema is understood; unknown or incompatible schemas must be shown as unsupported pending adapter/schema validation, not guessed.
5. **Newly registered intents and changing miner coverage**, discovered dynamically and reflected in the UI and execution planner.

## Current control state

- **Last verified:** 2026-10-14 — GitHub Actions run #33 passed on commit `9bb59421d9f91e41abc6ab7472e942541c2ac0c5`; TypeScript check, unit tests, and production build all succeeded. The normalized endpoint test expectation is corrected. Live Telegraph endpoint payloads and actual per-intent schema compatibility remain unverified.
- **Current next action:** Capture live `/api/miners` and `/engine/v1/intents` responses from a reachable runtime, validate actual endpoint schemas and per-intent coverage, and expose verified availability in the dashboard before wiring the execution planner.
- **Secrets configured:** Not verified.
- **Public demo deployment:** Not verified.
- **Real Telegraph paid transaction:** Not verified.
- **Hackathon submission artifacts:** Not verified.

## Phase ledger

A phase is complete only when every acceptance criterion in that phase is satisfied. If any criterion is not satisfied, leave the checkbox unchecked and state the blocker in the current work session or commit/PR description.

### Phase 0 — Repository foundation and continuous integration
- [ ] **DONE — Foundation is verified**
- Scope:
  - Establish the Next.js, React, TypeScript application structure and environment template.
  - Keep the dashboard truthful about features that are not connected yet.
  - Establish GitHub Actions for type checking, tests, and production build.
  - Keep secrets out of source and document GitHub-first development.
- Acceptance criteria:
  - [ ] GitHub Actions type-check job passes on the latest main commit.
  - [ ] All unit tests pass on the latest main commit.
  - [ ] Production build passes on the latest main commit.
  - [ ] No committed secret/private key or fabricated live status is present.
  - [ ] README explains setup, architecture, current limitations, and safety boundary.

### Phase 1 — Canonical intent discovery and full registry
- [ ] **DONE — Live catalogue coverage is verified**
- Scope:
  - Load the canonical intent list from Telegraph's live documented endpoint.
  - Normalize supported response shapes, validate IDs, deduplicate records, and handle endpoint errors/timeouts.
  - Expose a read-only API route and a searchable dashboard registry.
  - Show canonical IDs and descriptions, and miner counts only when actually supplied by a trustworthy response.
  - Distinguish a failed/unavailable catalogue fetch from an empty catalogue.
  - Ensure new canonical IDs appear without maintaining a fixed allowlist.
- Acceptance criteria:
  - [ ] Unit tests cover response shapes, malformed entries, duplicates, empty responses, and network failure behavior.
  - [ ] UI labels live canonical data separately from local fallback/roadmap data.
  - [ ] A manual/API check confirms the displayed canonical IDs came from Telegraph's live endpoint.
  - [ ] No roadmap proposal is represented as canonical.
  - [ ] The dashboard remains usable when Telegraph is temporarily unreachable.

### Phase 2 — Future capability registry and adapter contract
- [ ] **DONE — Forward-compatible capability design is verified**
- Scope:
  - Keep not-yet-registered product capabilities in a dedicated internal registry.
  - Give each proposal a stable internal identifier, purpose, category, required evidence, dependencies, and implementation state as the codebase grows.
  - Define a shared adapter contract so canonical intents can be integrated without bespoke dashboard logic for every intent.
  - Keep protocol intent IDs, product capability IDs, and UI labels as separate concepts.
  - Allow a future proposal to become an implementation only after its behavior and evidence sources are defined; do not impersonate a Telegraph intent.
- Acceptance criteria:
  - [ ] Tests prove proposed IDs are not added to the canonical list or passed as Telegraph IDs.
  - [ ] Adapter contract has typed input/output, validation, timeout/error behavior, provenance, and cost/receipt metadata.
  - [ ] Unsupported capability state is explicit and understandable to the user.
  - [ ] Registry can grow without rewriting the master plan; only this progress marker may be changed in this file during normal work.

### Phase 3 — Live miner discovery and per-intent schemas
- [ ] **DONE — Availability and schemas are verified**
- Scope:
  - Query documented Telegraph miner discovery APIs and the live intent catalogue.
  - Discover which miners serve each canonical intent and refresh coverage at run time.
  - Determine real request schemas, required fields, output shape, and any protocol constraints from official docs or live metadata.
  - Handle no-miner, stale-miner, malformed-schema, timeout, and partial-coverage cases.
  - Avoid calling paid endpoints merely to discover information that can be retrieved free.
- Acceptance criteria:
  - [ ] Tests cover miner discovery parsing and zero-miner responses.
  - [ ] UI displays current availability with retrieval timestamp and a clear unknown/stale state.
  - [ ] Execution planner refuses unavailable intents without paying.
  - [ ] No sample miner ID or placeholder receipt is presented as live.
  - [ ] A checked-in integration note records the endpoint and schema evidence used.

### Phase 4 — Server-side Telegraph client and intent execution planner
- [ ] **DONE — Generic execution planning is verified**
- Scope:
  - Create a server-only Telegraph client; never expose signing credentials to browser code.
  - Accept token/network context and the requested intelligence objective.
  - Select relevant canonical intents and miners using real availability and validated schemas.
  - Support every canonical intent through generic protocol handling where its schema is understood; route specialized intents through adapters where necessary.
  - Explain why an intent was selected, skipped, unsupported, or unavailable.
  - Validate all input and output at runtime; set timeouts and bounded retries.
- Acceptance criteria:
  - [ ] Unit tests cover planning, schema mismatch, unsupported intent, no available miner, timeouts, and partial results.
  - [ ] Server-only modules cannot be imported into client components.
  - [ ] Request/response schemas are validated and errors are safe to display.
  - [ ] No paid request runs merely because a page loaded or a catalogue was opened.
  - [ ] All intent execution paths have explicit provenance and status fields.

### Phase 5 — Payment challenge inspection, budget controls, and authorization
- [ ] **DONE — Safe paid-request boundary is verified**
- Scope:
  - Integrate Telegraph's documented x402 payment flow only after confirming the current official SDK/API usage.
  - Inspect the real payment challenge before signing; derive network, token, amount, and pay-to destination from the challenge, not hard-coded assumptions.
  - Enforce per-request, per-analysis, per-day, and user-configured total spend limits before payment.
  - Require explicit user authorization for a defined spend budget; provide a no-spend/read-only mode.
  - Do not use unrestricted automatic payment wrappers if they bypass pre-payment budget inspection.
  - Protect against duplicate payment, repeated retries, unbounded loops, malformed challenges, unexpected chain/token/destination, and stale quotes.
- Acceptance criteria:
  - [ ] Unit tests prove requests above budget and unexpected payment challenges are rejected before signing.
  - [ ] No-spend mode is the default until the user explicitly authorizes spending.
  - [ ] Server-side secrets are referenced only through environment variables/deployment secrets.
  - [ ] User sees estimated/quoted maximum spend before authorizing a paid analysis.
  - [ ] Failed/denied requests are not misreported as paid or settled.
  - [ ] No real private key is stored in the repository, logs, browser bundle, or chat.

### Phase 6 — Testnet settlement and machine-to-machine proof
- [ ] **DONE — A real testnet transaction is verified**
- Scope:
  - Use the official configured Telegraph test network and documented token/contract settings.
  - Complete a real autonomous machine-to-machine Telegraph request after explicit budget authorization.
  - Capture the actual request, miner, amount, network, transaction hash, settlement state, and receipt.
  - Independently verify settlement using the documented receipt/signal verification flow and the appropriate explorer.
  - Provide idempotency/correlation IDs and persist an audit trail without exposing secrets.
- Acceptance criteria:
  - [ ] At least one real paid request succeeds on the required testnet.
  - [ ] A real settlement/transaction hash opens the correct explorer and matches the recorded network.
  - [ ] The receipt and signal hash are verified using an independent supported check.
  - [ ] The UI labels the environment as testnet and clearly states no mainnet funds are being used.
  - [ ] Evidence is saved in the repository as a sanitized test record; no credentials or personal wallet secrets are committed.
  - [ ] No placeholder transaction hash, sample receipt, or simulated event is used as proof.
  - [ ] Meet the hackathon's checkpoint requirement for a settled transaction by the published deadline.

### Phase 7 — Receipt verification, evidence provenance, and audit trail
- [ ] **DONE — Evidence is independently auditable**
- Scope:
  - Parse actual Telegraph response metadata and receipt headers defensively.
  - Verify receipt structure, request association, settlement state, amount, payer/miner, network, timestamp, and signal hash wherever the protocol provides these fields.
  - Preserve raw response evidence safely alongside normalized records.
  - Hash the final report and its evidence manifest for reproducibility.
  - Distinguish provider claims from independently verified on-chain facts.
- Acceptance criteria:
  - [ ] Tests reject malformed, mismatched, stale, or incomplete receipts.
  - [ ] Every paid result links to the request record, provider/miner, amount, network, transaction hash if present, and verification status.
  - [ ] Evidence records include source, observed-at time, retrieval time, and content hash where applicable.
  - [ ] The system never upgrades an unverified provider statement into a verified on-chain fact.
  - [ ] Audit trail can be inspected/exported without disclosing secrets.

### Phase 8 — Token intelligence orchestration and risk memo
- [ ] **DONE — End-to-end evidence-backed analysis works**
- Scope:
  - Accept chain/network and token contract/address with strict validation.
  - Build an evidence plan that considers the full canonical catalogue and relevant future capability registry.
  - Execute available, relevant intents within the authorized budget; skip irrelevant/unavailable/unsupported items transparently.
  - Normalize evidence into findings, severity, confidence, freshness, source quality, conflicts, and unknowns.
  - Generate a listing risk memo with summary, evidence, counter-evidence, scoring explanation, missing data, limitations, and recommended next checks.
  - Make the score explainable and configurable; avoid claiming certainty or financial advice.
- Acceptance criteria:
  - [ ] End-to-end tests cover a successful partial analysis and a degraded/low-evidence analysis.
  - [ ] Every material claim links to evidence or is explicitly marked as inference/unknown.
  - [ ] Missing data lowers confidence or appears as a gap; it is never silently treated as safe.
  - [ ] Conflicting results remain visible and do not disappear through simplistic averaging.
  - [ ] Report includes a reproducibility hash and a machine-readable export.
  - [ ] No risk result is fabricated to make the dashboard look complete.

### Phase 9 — Dashboard product experience
- [ ] **DONE — User-facing workflow is complete**
- Scope:
  - Build the complete flow from token input through plan review, budget authorization, execution, progress, findings, receipts, and report export.
  - Show live catalogue status, miner availability, selected/skipped intents, cost estimate/actual cost, transaction links, receipt verification, and evidence freshness.
  - Add filters/search, clear loading/empty/error states, accessible controls, responsive layouts, and useful explanations.
  - Clearly separate live data, cached data, local proposals, unavailable capabilities, and demo fixtures.
- Acceptance criteria:
  - [ ] A user can complete the core flow without editing code or opening developer tools.
  - [ ] No UI implies an action completed before the server confirms it.
  - [ ] Budget approval precedes paid execution and shows the scope the user approved.
  - [ ] Transaction links are clickable and point to the correct network.
  - [ ] Responsive and accessibility smoke checks pass.
  - [ ] All demo/sample fixtures are clearly labelled and excluded from real activity totals.

### Phase 10 — Reliability, security, and adversarial testing
- [ ] **DONE — Release-quality safety checks pass**
- Scope:
  - Test prompt injection and malicious instructions inside token metadata, websites, miner outputs, and returned documents.
  - Prevent untrusted evidence from changing system instructions, payment policy, or tool permissions.
  - Add rate limiting, request-size limits, validation, timeout limits, safe logging, and appropriate data retention.
  - Test duplicate submissions, race conditions, replay, network failure, provider failure, stale catalogue data, and partial settlement.
  - Audit dependency vulnerabilities and configuration/secrets handling.
- Acceptance criteria:
  - [ ] Automated test suite covers critical failure and abuse cases.
  - [ ] No untrusted miner/token content can authorize spending or override system policy.
  - [ ] Logs redact keys, auth headers, payment payload secrets, and sensitive environment values.
  - [ ] No critical/high security issue is left untriaged for release.
  - [ ] Failure states are recoverable and visible; no false success messages.
  - [ ] A security/release checklist is checked into the repository.

### Phase 11 — Commercial readiness and mainnet-ready configuration
- [ ] **DONE — Commercial and deployment configuration is reviewed**
- Scope:
  - Keep chain ID, network, token, endpoint, explorer, and price assumptions in validated configuration.
  - Separate testnet and mainnet profiles; default to testnet and refuse unknown network configurations.
  - Document target customer, listing-desk workflow, pricing assumptions, operating costs, limits, and why the product is commercially useful.
  - Define tenant/user authorization and spending ownership before any multi-user or production deployment.
  - Document monitoring, incident response, support, and upgrade/rollback strategy.
- Acceptance criteria:
  - [ ] Configuration is validated at startup and refuses unsafe combinations.
  - [ ] Mainnet cannot be selected accidentally and requires a separate explicit deployment decision.
  - [ ] No production private key or wallet is bundled in the app.
  - [ ] Commercial summary explains buyer, pain point, workflow, cost model, differentiator, and limitations.
  - [ ] Production-readiness gaps are documented honestly.

### Phase 12 — Deployment, demo, and hackathon submission
- [ ] **DONE — Submission package is complete**
- Scope:
  - Deploy a public demo using a supported host and server-side secret configuration.
  - Run the full workflow on the deployed app with verified testnet evidence.
  - Prepare a concise demo video, project description, architecture summary, commercial summary, testing instructions, and links to code/demo/transaction evidence.
  - Ensure public-facing documentation matches the actual shipped features.
  - Verify the submission is complete before the published deadline.
- Acceptance criteria:
  - [ ] Public demo URL works without requiring the judge to run local setup.
  - [ ] Deployed demo shows actual verifiable testnet request/settlement evidence.
  - [ ] A 60-second demo video is published and linked.
  - [ ] Commercial summary and architecture are complete.
  - [ ] Testing instructions are concise and reproducible.
  - [ ] All required submission fields and links are checked.
  - [ ] No unsupported claims about integrations, live data, users, or transaction volume remain.

### Phase 13 — Final acceptance and handoff
- [ ] **DONE — Final product acceptance passed**
- Scope:
  - Review every earlier phase against its acceptance criteria.
  - Confirm canonical intent coverage and all known gaps, including no-miner and unknown-schema cases.
  - Confirm proposed future capabilities remain separate from canonical Telegraph intents.
  - Verify fresh clone/deploy instructions and operational handoff.
  - Produce a final status report with known limitations and next steps after the hackathon.
- Acceptance criteria:
  - [ ] Every phase above is marked complete only after its evidence is checked.
  - [ ] No critical release blocker remains.
  - [ ] Final end-to-end demo is repeatable.
  - [ ] Final handoff lists known limitations, operational instructions, and future improvements.
  - [ ] No unverified claim is presented as completed functionality.

## Required engineering invariants

These apply in every phase and do not need to be re-added to individual tasks:
- **Canonical means official:** only Telegraph's live catalogue or authoritative protocol evidence can establish a canonical intent.
- **Future means proposed:** locally planned capability identifiers are never impersonated as official Telegraph IDs.
- **Discovery is read-only:** viewing the app/catalogue never triggers paid requests.
- **Explicit spend authorization:** the user approves the scope and maximum spend before any paid execution.
- **Challenge-derived payment data:** inspect the actual payment challenge; never guess recipient, amount, token, or chain.
- **Evidence before conclusion:** each material report finding has provenance, freshness, and confidence/uncertainty.
- **No fabricated proof:** never invent miner IDs, request counts, costs, receipt values, signal hashes, transaction hashes, or verification results.
- **Secrets stay server-side:** no private keys in Git, browser code, client-visible responses, logs, screenshots, or chat.
- **GitHub-first:** implement and verify through GitHub-connected tools and Actions where practical; Termux only when genuinely necessary.
- **Plan integrity:** the phase scope and acceptance criteria in this file are stable; routine edits are limited to completion markers and the small current-state fields at the top.

## Dated amendments

Append only if a material scope change is approved. Do not rewrite the original phase definitions.
- None.
