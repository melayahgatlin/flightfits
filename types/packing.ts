export type PackingCategory =
  | "documents"
  | "clothing"
  | "shoes"
  | "toiletries"
  | "technology"
  | "accessories"
  | "health"
  | "miscellaneous";

export interface PackingItemDraft {
  name: string;
  category: PackingCategory;
  quantity?: number;
  essential?: boolean;
  source?: "base" | "activity" | "weather" | "custom";
}

export interface PackingItem {
  id: string;
  name: string;
  category: PackingCategory;
  quantity: number;
  packed: boolean;
  essential: boolean;
  source: "base" | "activity" | "weather" | "custom";
  createdAt: string;
}

export interface PackingList {
  tripId: string;
  items: PackingItem[];
  generatedAt: string;
  updatedAt: string;
}

export interface PackingTripInput {
  id: string;
  tripName?: string;
  name?: string;
  destination?: string;
  startDate?: string;
  endDate?: string;
  luggageType?: string;
  luggage?: string | string[];
  activities?: string[];
}
