export const PACKING_CATEGORY_ORDER = [
  "documents",
  "clothing",
  "shoes",
  "accessories",
  "toiletries",
  "technology",
  "health",
  "weather",
  "activity",
  "miscellaneous",
] as const;

export const PACKING_CATEGORY_LABELS: Record<
  (typeof PACKING_CATEGORY_ORDER)[number],
  string
> = {
  documents: "Documents",
  clothing: "Clothing",
  shoes: "Shoes",
  accessories: "Accessories",
  toiletries: "Toiletries",
  technology: "Technology",
  health: "Health",
  weather: "Weather essentials",
  activity: "Activity essentials",
  miscellaneous: "Miscellaneous",
};

export const UNIVERSAL_PACKING_ESSENTIALS = [
  {
    name: "Passport or government-issued ID",
    category: "documents",
    essential: true,
  },
  {
    name: "Payment card",
    category: "documents",
    essential: true,
  },
  {
    name: "Phone",
    category: "technology",
    essential: true,
  },
  {
    name: "Phone charger",
    category: "technology",
    essential: true,
  },
  {
    name: "Toothbrush",
    category: "toiletries",
    essential: true,
  },
  {
    name: "Toothpaste",
    category: "toiletries",
    essential: true,
  },
  {
    name: "Daily medication",
    category: "health",
    essential: true,
  },
] as const;