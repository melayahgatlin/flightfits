export const ITINERARY_CATEGORIES = [
  {
    value: "activity",
    label: "Activity",
    emoji: "📍",
  },
  {
    value: "food",
    label: "Food",
    emoji: "🍽️",
  },
  {
    value: "transportation",
    label: "Transportation",
    emoji: "🚆",
  },
  {
    value: "accommodation",
    label: "Accommodation",
    emoji: "🏨",
  },
  {
    value: "shopping",
    label: "Shopping",
    emoji: "🛍️",
  },
  {
    value: "fashion",
    label: "Fashion",
    emoji: "👗",
  },
  {
    value: "nightlife",
    label: "Nightlife",
    emoji: "🌙",
  },
  {
    value: "event",
    label: "Event",
    emoji: "🎟️",
  },
  {
    value: "other",
    label: "Other",
    emoji: "✨",
  },
] as const;

export type ItineraryCategory =
  (typeof ITINERARY_CATEGORIES)[number]["value"];

export const DEFAULT_ITINERARY_START_TIME = "09:00";
export const DEFAULT_ITINERARY_DURATION_MINUTES = 90;