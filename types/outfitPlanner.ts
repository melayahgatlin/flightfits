export type OutfitOccasion =
  | "casual"
  | "dinner"
  | "nightlife"
  | "beach"
  | "work"
  | "formal"
  | "travel"
  | "activity"
  | "other";

export interface PlannedOutfit {
  id: string;
  tripId?: string;
  name: string;
  date?: string;
  occasion: OutfitOccasion;
  closetItemIds: string[];
  notes?: string;
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PlannedOutfitInput {
  tripId?: string;
  name: string;
  date?: string;
  occasion: OutfitOccasion;
  closetItemIds: string[];
  notes?: string;
  favorite?: boolean;
}
