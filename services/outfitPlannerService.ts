import AsyncStorage from "@react-native-async-storage/async-storage";
import type {
  PlannedOutfit,
  PlannedOutfitInput,
} from "../types/outfitPlanner";

const STORAGE_KEY = "flightfits.plannedOutfits";

function createId(): string {
  return `outfit-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

async function readOutfits(): Promise<PlannedOutfit[]> {
  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  if (!stored) return [];

  try {
    const parsed: unknown = JSON.parse(stored);
    return Array.isArray(parsed) ? (parsed as PlannedOutfit[]) : [];
  } catch {
    return [];
  }
}

async function writeOutfits(outfits: PlannedOutfit[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(outfits));
}

export async function getPlannedOutfits(
  tripId?: string
): Promise<PlannedOutfit[]> {
  const outfits = await readOutfits();
  const filtered = tripId
    ? outfits.filter((outfit) => outfit.tripId === tripId)
    : outfits;

  return filtered.sort((a, b) => {
    if (a.date && b.date) return a.date.localeCompare(b.date);
    if (a.date) return -1;
    if (b.date) return 1;
    return b.createdAt.localeCompare(a.createdAt);
  });
}

export async function getPlannedOutfit(
  id: string
): Promise<PlannedOutfit | null> {
  const outfits = await readOutfits();
  return outfits.find((outfit) => outfit.id === id) ?? null;
}

export async function createPlannedOutfit(
  input: PlannedOutfitInput
): Promise<PlannedOutfit> {
  const outfits = await readOutfits();
  const now = new Date().toISOString();

  const outfit: PlannedOutfit = {
    id: createId(),
    tripId: input.tripId,
    name: input.name.trim(),
    date: input.date,
    occasion: input.occasion,
    closetItemIds: input.closetItemIds,
    notes: input.notes?.trim() || undefined,
    favorite: input.favorite ?? false,
    createdAt: now,
    updatedAt: now,
  };

  await writeOutfits([outfit, ...outfits]);
  return outfit;
}

export async function updatePlannedOutfit(
  id: string,
  input: PlannedOutfitInput
): Promise<PlannedOutfit> {
  const outfits = await readOutfits();
  const existing = outfits.find((outfit) => outfit.id === id);

  if (!existing) throw new Error("Outfit not found.");

  const updated: PlannedOutfit = {
    ...existing,
    ...input,
    id,
    name: input.name.trim(),
    notes: input.notes?.trim() || undefined,
    updatedAt: new Date().toISOString(),
  };

  await writeOutfits(
    outfits.map((outfit) => (outfit.id === id ? updated : outfit))
  );

  return updated;
}

export async function deletePlannedOutfit(id: string): Promise<void> {
  const outfits = await readOutfits();
  await writeOutfits(outfits.filter((outfit) => outfit.id !== id));
}

export async function toggleOutfitFavorite(id: string): Promise<void> {
  const outfits = await readOutfits();

  await writeOutfits(
    outfits.map((outfit) =>
      outfit.id === id
        ? {
            ...outfit,
            favorite: !outfit.favorite,
            updatedAt: new Date().toISOString(),
          }
        : outfit
    )
  );
}
