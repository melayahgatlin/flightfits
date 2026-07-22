import { ACTIVITY_PACKING_RULES } from "@/constants/packingRules";
import type {
  PackingCategory,
  PackingItem,
  PackingItemDraft,
} from "@/types/packing";
import type { TripDraft } from "@/types/trip";
import { calculateTripLength } from "@/utils/date";
import { uniqueByName } from "@/utils/helpers";

export function generatePackingList(trip: TripDraft): PackingItem[] {
  const days = Math.max(
    1,
    calculateTripLength(trip.startDate, trip.endDate)
  );

  const baseItems: PackingItemDraft[] = [
    { name: "Passport or photo ID", category: "documents" },
    { name: "Wallet", category: "documents" },
    { name: "Phone charger", category: "technology" },
    { name: "Toothbrush", category: "toiletries" },
    { name: "Toothpaste", category: "toiletries" },
    { name: `${Math.min(days + 1, 10)} pairs of underwear`, category: "clothing" },
    { name: `${Math.min(days + 1, 10)} pairs of socks`, category: "clothing" },
    { name: `${Math.min(Math.ceil(days / 2), 5)} everyday tops`, category: "clothing" },
    { name: `${Math.min(Math.ceil(days / 3), 4)} bottoms`, category: "clothing" },
    { name: "Sleepwear", category: "clothing" },
    { name: "Comfortable walking shoes", category: "shoes" },
  ];

  if (trip.luggageType === "personal-item") {
    baseItems.push({
      name: "Travel-size toiletries",
      category: "toiletries",
    });
  }

  if (trip.luggageType === "carry-on") {
    baseItems.push({
      name: "Clear liquids bag",
      category: "toiletries",
    });
  }

  if (days >= 7) {
    baseItems.push({
      name: "Laundry bag",
      category: "miscellaneous",
    });
  }

  const activityItems = ACTIVITY_PACKING_RULES.filter((rule) =>
    trip.activities.includes(rule.activity)
  ).flatMap((rule) => rule.items);

  return uniqueByName([...baseItems, ...activityItems]).map(
    (item, index) => ({
      id: `packing-${index + 1}-${slugify(item.name)}`,
      name: item.name,
      category: item.category as PackingCategory,
      packed: false,
      quantity: 1,
    })
  );
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
