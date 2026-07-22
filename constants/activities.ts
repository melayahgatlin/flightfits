export const ACTIVITIES = [
  {
    id: "sightseeing",
    label: "Sightseeing",
    emoji: "🏛️",
  },
  {
    id: "beach",
    label: "Beach",
    emoji: "🏖️",
  },
  {
    id: "nightlife",
    label: "Nightlife",
    emoji: "🌙",
  },
  {
    id: "business",
    label: "Business",
    emoji: "💼",
  },
  {
    id: "hiking",
    label: "Hiking",
    emoji: "🥾",
  },
  {
    id: "shopping",
    label: "Shopping",
    emoji: "🛍️",
  },
  {
    id: "theme-park",
    label: "Theme park",
    emoji: "🎢",
  },
  {
    id: "cooking-class",
    label: "Cooking class",
    emoji: "🍳",
  },
  {
    id: "fine-dining",
    label: "Fine dining",
    emoji: "🍽️",
  },
  {
    id: "religious-site",
    label: "Religious site",
    emoji: "🕌",
  },
  {
    id: "concert",
    label: "Concert",
    emoji: "🎤",
  },
  {
    id: "festival",
    label: "Festival",
    emoji: "🎪",
  },
  {
    id: "fashion-event",
    label: "Fashion event",
    emoji: "✨",
  },
  {
    id: "museum",
    label: "Museum",
    emoji: "🖼️",
  },
  {
    id: "food-tour",
    label: "Food tour",
    emoji: "🥟",
  },
   {
    id: "miscellaneous",
    label: "Misc",
    emoji: "🎭",
  },
] as const;

export type ActivityId = (typeof ACTIVITIES)[number]["id"];

export const ACTIVITY_LABELS: Record<ActivityId, string> =
  Object.fromEntries(
    ACTIVITIES.map((activity) => [
      activity.id,
      activity.label,
    ])
  ) as Record<ActivityId, string>;