import AsyncStorage from "@react-native-async-storage/async-storage";

import type {
  PackingCategory,
  PackingItem,
  PackingItemDraft,
  PackingList,
  PackingTripInput,
} from "@/types/packing";

const STORAGE_KEY = "flightfits.packingLists";

const BASE_ITEMS: PackingItemDraft[] = [
  { name: "Passport or photo ID", category: "documents", essential: true },
  { name: "Wallet", category: "documents", essential: true },
  { name: "Travel confirmations", category: "documents", essential: true },
  { name: "Phone", category: "technology", essential: true },
  { name: "Phone charger", category: "technology", essential: true },
  { name: "Portable charger", category: "technology" },
  { name: "Toothbrush", category: "toiletries", essential: true },
  { name: "Toothpaste", category: "toiletries", essential: true },
  { name: "Deodorant", category: "toiletries", essential: true },
  { name: "Skincare essentials", category: "toiletries" },
  { name: "Sleepwear", category: "clothing" },
  { name: "Comfortable walking shoes", category: "shoes", essential: true },
  { name: "Medications", category: "health", essential: true },
];

const ACTIVITY_RULES: Record<string, PackingItemDraft[]> = {
  beach: [
    { name: "Swimsuit", category: "clothing", source: "activity" },
    { name: "Beach cover-up", category: "clothing", source: "activity" },
    { name: "Sunscreen", category: "toiletries", source: "activity" },
    { name: "Sandals", category: "shoes", source: "activity" },
  ],
  hiking: [
    { name: "Hiking shoes", category: "shoes", source: "activity" },
    { name: "Reusable water bottle", category: "miscellaneous", source: "activity" },
    { name: "Day backpack", category: "accessories", source: "activity" },
  ],
  swimming: [
    { name: "Swimsuit", category: "clothing", source: "activity" },
    { name: "Waterproof phone pouch", category: "accessories", source: "activity" },
  ],
  nightlife: [
    { name: "Going-out outfit", category: "clothing", source: "activity" },
    { name: "Dress shoes", category: "shoes", source: "activity" },
    { name: "Small evening bag", category: "accessories", source: "activity" },
  ],
  formal: [
    { name: "Formal outfit", category: "clothing", source: "activity" },
    { name: "Formal shoes", category: "shoes", source: "activity" },
  ],
  business: [
    { name: "Business outfit", category: "clothing", source: "activity" },
    { name: "Laptop", category: "technology", source: "activity" },
    { name: "Laptop charger", category: "technology", source: "activity" },
  ],
  gym: [
    { name: "Workout outfit", category: "clothing", source: "activity" },
    { name: "Athletic shoes", category: "shoes", source: "activity" },
  ],
  snow: [
    { name: "Warm coat", category: "clothing", source: "weather" },
    { name: "Gloves", category: "accessories", source: "weather" },
    { name: "Winter hat", category: "accessories", source: "weather" },
  ],
};

function makeId(name: string): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}`;
}

function tripDays(startDate?: string, endDate?: string): number {
  if (!startDate || !endDate) return 3;

  const start = new Date(`${startDate}T12:00:00`).getTime();
  const end = new Date(`${endDate}T12:00:00`).getTime();

  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) {
    return 3;
  }

  return Math.max(1, Math.floor((end - start) / 86_400_000) + 1);
}

function normalizeActivities(activities?: string[]): string[] {
  return (activities ?? []).map((value) => value.trim().toLowerCase());
}

function toItem(draft: PackingItemDraft): PackingItem {
  return {
    id: makeId(draft.name),
    name: draft.name.trim(),
    category: draft.category,
    quantity: Math.max(1, draft.quantity ?? 1),
    packed: false,
    essential: draft.essential ?? false,
    source: draft.source ?? "base",
    createdAt: new Date().toISOString(),
  };
}

function uniqueDrafts(items: PackingItemDraft[]): PackingItemDraft[] {
  const seen = new Set<string>();

  return items.filter((item) => {
    const key = item.name.trim().toLowerCase();

    if (!key || seen.has(key)) return false;

    seen.add(key);
    return true;
  });
}

export function generatePackingItems(trip: PackingTripInput): PackingItem[] {
  const days = tripDays(trip.startDate, trip.endDate);
  const clothing: PackingItemDraft[] = [
    {
      name: `${Math.min(days + 1, 10)} pairs of underwear`,
      category: "clothing",
      essential: true,
    },
    {
      name: `${Math.min(days + 1, 10)} pairs of socks`,
      category: "clothing",
    },
    {
      name: `${Math.min(Math.ceil(days / 2), 6)} everyday tops`,
      category: "clothing",
    },
    {
      name: `${Math.min(Math.ceil(days / 3), 5)} bottoms`,
      category: "clothing",
    },
  ];

  const luggage = Array.isArray(trip.luggage)
    ? trip.luggage.join(" ").toLowerCase()
    : `${trip.luggageType ?? ""} ${trip.luggage ?? ""}`.toLowerCase();

  const luggageItems: PackingItemDraft[] = [];

  if (luggage.includes("personal")) {
    luggageItems.push({
      name: "Travel-size toiletries",
      category: "toiletries",
    });
  }

  if (luggage.includes("carry")) {
    luggageItems.push({
      name: "Clear liquids bag",
      category: "toiletries",
    });
  }

  if (days >= 7) {
    luggageItems.push({
      name: "Laundry bag",
      category: "miscellaneous",
    });
  }

  const activityItems = normalizeActivities(trip.activities).flatMap((activity) => {
    return Object.entries(ACTIVITY_RULES)
      .filter(([keyword]) => activity.includes(keyword))
      .flatMap(([, items]) => items);
  });

  return uniqueDrafts([
    ...BASE_ITEMS,
    ...clothing,
    ...luggageItems,
    ...activityItems,
  ]).map(toItem);
}

async function readAllLists(): Promise<Record<string, PackingList>> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);

  if (!raw) return {};

  try {
    const parsed: unknown = JSON.parse(raw);

    return parsed && typeof parsed === "object"
      ? (parsed as Record<string, PackingList>)
      : {};
  } catch {
    return {};
  }
}

async function writeAllLists(
  lists: Record<string, PackingList>
): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
}

export async function getPackingList(
  tripId: string
): Promise<PackingList | null> {
  const lists = await readAllLists();
  return lists[tripId] ?? null;
}

export async function getOrCreatePackingList(
  trip: PackingTripInput
): Promise<PackingList> {
  const lists = await readAllLists();
  const existing = lists[trip.id];

  if (existing) return existing;

  const now = new Date().toISOString();
  const created: PackingList = {
    tripId: trip.id,
    items: generatePackingItems(trip),
    generatedAt: now,
    updatedAt: now,
  };

  lists[trip.id] = created;
  await writeAllLists(lists);

  return created;
}

export async function savePackingList(list: PackingList): Promise<void> {
  const lists = await readAllLists();

  lists[list.tripId] = {
    ...list,
    updatedAt: new Date().toISOString(),
  };

  await writeAllLists(lists);
}

export async function togglePackingItem(
  tripId: string,
  itemId: string
): Promise<PackingList> {
  const list = await getPackingList(tripId);

  if (!list) throw new Error("Packing list not found.");

  const updated: PackingList = {
    ...list,
    items: list.items.map((item) =>
      item.id === itemId ? { ...item, packed: !item.packed } : item
    ),
    updatedAt: new Date().toISOString(),
  };

  await savePackingList(updated);
  return updated;
}

export async function addPackingItem(
  tripId: string,
  name: string,
  category: PackingCategory,
  quantity = 1
): Promise<PackingList> {
  const list = await getPackingList(tripId);

  if (!list) throw new Error("Packing list not found.");

  const item = toItem({
    name,
    category,
    quantity,
    source: "custom",
  });

  const updated: PackingList = {
    ...list,
    items: [...list.items, item],
    updatedAt: new Date().toISOString(),
  };

  await savePackingList(updated);
  return updated;
}

export async function deletePackingItem(
  tripId: string,
  itemId: string
): Promise<PackingList> {
  const list = await getPackingList(tripId);

  if (!list) throw new Error("Packing list not found.");

  const updated: PackingList = {
    ...list,
    items: list.items.filter((item) => item.id !== itemId),
    updatedAt: new Date().toISOString(),
  };

  await savePackingList(updated);
  return updated;
}

export async function regeneratePackingList(
  trip: PackingTripInput,
  keepCustomItems = true
): Promise<PackingList> {
  const current = await getPackingList(trip.id);
  const custom = keepCustomItems
    ? current?.items.filter((item) => item.source === "custom") ?? []
    : [];

  const now = new Date().toISOString();
  const next: PackingList = {
    tripId: trip.id,
    items: [...generatePackingItems(trip), ...custom],
    generatedAt: now,
    updatedAt: now,
  };

  await savePackingList(next);
  return next;
}
