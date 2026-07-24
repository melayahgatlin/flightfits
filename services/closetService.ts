import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ClosetItem, ClosetItemInput } from "../types/closet";

const STORAGE_KEY = "flightfits.closet";

function createId(): string {
  return `closet-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

async function readItems(): Promise<ClosetItem[]> {
  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  if (!stored) return [];

  try {
    const parsed: unknown = JSON.parse(stored);
    return Array.isArray(parsed) ? (parsed as ClosetItem[]) : [];
  } catch {
    return [];
  }
}

async function writeItems(items: ClosetItem[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export async function getClosetItems(): Promise<ClosetItem[]> {
  const items = await readItems();
  return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getClosetItem(id: string): Promise<ClosetItem | null> {
  const items = await readItems();
  return items.find((item) => item.id === id) ?? null;
}

export async function createClosetItem(
  input: ClosetItemInput
): Promise<ClosetItem> {
  const items = await readItems();
  const now = new Date().toISOString();

  const item: ClosetItem = {
    id: createId(),
    name: input.name.trim(),
    category: input.category,
    color: input.color.trim(),
    brand: input.brand?.trim() || undefined,
    imageUri: input.imageUri,
    seasons: input.seasons,
    tags: input.tags,
    notes: input.notes?.trim() || undefined,
    favorite: input.favorite ?? false,
    createdAt: now,
    updatedAt: now,
  };

  await writeItems([item, ...items]);
  return item;
}

export async function updateClosetItem(
  id: string,
  input: ClosetItemInput
): Promise<ClosetItem> {
  const items = await readItems();
  const existing = items.find((item) => item.id === id);

  if (!existing) throw new Error("Closet item not found.");

  const updated: ClosetItem = {
    ...existing,
    ...input,
    id,
    name: input.name.trim(),
    color: input.color.trim(),
    brand: input.brand?.trim() || undefined,
    notes: input.notes?.trim() || undefined,
    updatedAt: new Date().toISOString(),
  };

  await writeItems(items.map((item) => (item.id === id ? updated : item)));
  return updated;
}

export async function toggleClosetFavorite(id: string): Promise<void> {
  const items = await readItems();

  await writeItems(
    items.map((item) =>
      item.id === id
        ? {
            ...item,
            favorite: !item.favorite,
            updatedAt: new Date().toISOString(),
          }
        : item
    )
  );
}

export async function deleteClosetItem(id: string): Promise<void> {
  const items = await readItems();
  await writeItems(items.filter((item) => item.id !== id));
}
