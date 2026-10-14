/**
 * Product roadmap capabilities that do not currently have a canonical Telegraph
 * Intent ID. These are proposals only: never submit them as canonical IDs or
 * claim they are live until Telegraph registers them on-chain.
 */
export const PROPOSED_FUTURE_INTENTS = [
  { id: "TOKEN_RUGPULL_EARLY_WARNING", label: "Token rug-pull early warning", category: "Web3 risk", purpose: "Combine ownership, liquidity, holder concentration and behavior signals to flag rug-pull risk." },
  { id: "TOKEN_UPGRADEABILITY_RISK", label: "Token upgradeability risk", category: "Web3 risk", purpose: "Explain proxy, admin, pause and upgrade controls that could affect holders." },
  { id: "TOKEN_HOLDER_CONCENTRATION", label: "Token holder concentration", category: "Web3 risk", purpose: "Measure concentration and identify unusually influential holder clusters." },
  { id: "LIQUIDITY_LOCK_VERIFICATION", label: "Liquidity lock verification", category: "Web3 risk", purpose: "Verify lock contracts, unlock dates and liquidity withdrawal conditions." },
  { id: "TOKEN_OWNERSHIP_RENOUNCEMENT_VERIFY", label: "Ownership renouncement verification", category: "Web3 risk", purpose: "Verify whether privileged ownership was actually renounced and what controls remain." },
  { id: "TOKEN_TAX_BEHAVIOR_ANALYSIS", label: "Token tax behavior analysis", category: "Web3 risk", purpose: "Inspect buy, sell and transfer tax behavior across relevant transaction paths." },
  { id: "BRIDGE_EXPLOIT_EXPOSURE", label: "Bridge exploit exposure", category: "Web3 risk", purpose: "Assess bridge dependencies and known exploit patterns affecting an asset." },
  { id: "TOKEN_CLAIM_VERIFICATION", label: "Token claim verification", category: "Web3 risk", purpose: "Cross-check token project claims against contract state and independently sourced evidence." },
  { id: "PROJECT_TEAM_REPUTATION", label: "Project team reputation", category: "Entity risk", purpose: "Aggregate attributable public evidence about team track record and disclosed affiliations." },
  { id: "TOKEN_DISCLOSURE_CONSISTENCY", label: "Token disclosure consistency", category: "Entity risk", purpose: "Compare whitepaper, website, contract metadata and public statements for material conflicts." },
  { id: "TOKEN_INCIDENT_MONITOR", label: "Token incident monitoring", category: "Monitoring", purpose: "Detect and summarize material exploit, pause, depeg and liquidity incidents." },
  { id: "TOKEN_RISK_CHANGE_DETECTION", label: "Token risk change detection", category: "Monitoring", purpose: "Compare new evidence with prior reports and identify material risk-score changes." },
  { id: "TOKEN_EVIDENCE_FRESHNESS", label: "Token evidence freshness", category: "Evidence quality", purpose: "Track source age, block height, observation time and evidence expiry." },
  { id: "MULTI_CHAIN_TOKEN_IDENTITY", label: "Multi-chain token identity", category: "Web3 risk", purpose: "Determine whether contracts deployed across networks represent the same claimed asset." },
  { id: "TOKEN_LISTING_POLICY_MATCH", label: "Listing policy match", category: "Compliance", purpose: "Compare evidence against a configurable exchange listing policy and explain gaps." },
  { id: "TOKEN_RISK_REPORT_REPRODUCIBILITY", label: "Risk report reproducibility", category: "Evidence quality", purpose: "Recompute a report from stored source references, request receipts and versioned scoring rules." }
] as const;

export type ProposedFutureIntent = (typeof PROPOSED_FUTURE_INTENTS)[number];
