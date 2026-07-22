export type PackingCategory =
  | "clothing"
  | "shoes"
  | "toiletries"
  | "technology"
  | "documents"
  | "accessories"
  | "miscellaneous";

export interface PackingItemDraft {
  name: string;
  category: PackingCategory;
}

export interface PackingItem extends PackingItemDraft {
  id: string;
  quantity: number;
  packed: boolean;
}
