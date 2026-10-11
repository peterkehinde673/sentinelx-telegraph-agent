export const EXCHANGE_INTENTS = [
  {
    id: "SMART_CONTRACT_AUDIT",
    label: "Smart contract audit",
    purpose: "Inspect contract source or bytecode for common security weaknesses."
  },
  {
    id: "ONCHAIN_METRIC_VERIFY",
    label: "On-chain metric verification",
    purpose: "Verify supported balances, events, gas metrics, and transaction states."
  },
  {
    id: "SANCTIONS_SCREENING_MATCH",
    label: "Sanctions screening",
    purpose: "Check supported counterparties against applicable sanctions lists."
  },
  {
    id: "SOCIAL_BOT_DETECTION",
    label: "Social bot detection",
    purpose: "Assess coordinated or inauthentic social-account patterns."
  },
  {
    id: "CODE_REVIEW",
    label: "Contributor and code review",
    purpose: "Review available repository code and engineering signals."
  },
  {
    id: "WASH_TRADING_DETECTION",
    label: "Wash-trading detection",
    purpose: "Look for suspicious circular or affiliated trading patterns."
  }
] as const;

export type ExchangeIntentId = (typeof EXCHANGE_INTENTS)[number]["id"];

export function getExchangeIntent(id: string) {
  return EXCHANGE_INTENTS.find((intent) => intent.id === id);
}

export function isExchangeIntentId(value: string): value is ExchangeIntentId {
  return EXCHANGE_INTENTS.some((intent) => intent.id === value);
}
