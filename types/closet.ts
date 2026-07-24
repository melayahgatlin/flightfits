export type ClosetCategory =
  | "tops"
  | "bottoms"
  | "dresses"
  | "outerwear"
  | "shoes"
  | "bags"
  | "accessories"
  | "swimwear"
  | "other";

export type ClosetSeason =
  | "spring"
  | "summer"
  | "fall"
  | "winter"
  | "all-season";

export interface ClosetItem {
  id: string;
  name: string;
  category: ClosetCategory;
  color: string;
  brand?: string;
  imageUri?: string;
  seasons: ClosetSeason[];
  tags: string[];
  notes?: string;
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ClosetItemInput {
  name: string;
  category: ClosetCategory;
  color: string;
  brand?: string;
  imageUri?: string;
  seasons: ClosetSeason[];
  tags: string[];
  notes?: string;
  favorite?: boolean;
}
