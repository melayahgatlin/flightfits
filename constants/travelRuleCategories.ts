export const TRAVEL_RULE_CATEGORIES = [
  {
    value: "entry",
    label: "Entry and visas",
    emoji: "🛂",
  },
  {
    value: "law",
    label: "Local laws",
    emoji: "⚖️",
  },
  {
    value: "dress",
    label: "Dress expectations",
    emoji: "👗",
  },
  {
    value: "etiquette",
    label: "Etiquette",
    emoji: "🤝",
  },
  {
    value: "safety",
    label: "Safety",
    emoji: "🛡️",
  },
  {
    value: "transportation",
    label: "Transportation",
    emoji: "🚇",
  },
  {
    value: "money",
    label: "Money and tipping",
    emoji: "💳",
  },
  {
    value: "technology",
    label: "Phones and internet",
    emoji: "📱",
  },
  {
    value: "health",
    label: "Health",
    emoji: "🩹",
  },
  {
    value: "other",
    label: "Other",
    emoji: "ℹ️",
  },
] as const;

export type TravelRuleCategory =
  (typeof TRAVEL_RULE_CATEGORIES)[number]["value"];