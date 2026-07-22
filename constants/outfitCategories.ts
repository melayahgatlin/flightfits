export const OUTFIT_CATEGORIES = [
  {
    value: "top",
    label: "Tops",
    singularLabel: "Top",
  },
  {
    value: "bottom",
    label: "Bottoms",
    singularLabel: "Bottom",
  },
  {
    value: "dress",
    label: "Dresses",
    singularLabel: "Dress",
  },
  {
    value: "jumpsuit",
    label: "Jumpsuits",
    singularLabel: "Jumpsuit",
  },
  {
    value: "outerwear",
    label: "Outerwear",
    singularLabel: "Outerwear",
  },
  {
    value: "shoes",
    label: "Shoes",
    singularLabel: "Shoes",
  },
  {
    value: "bag",
    label: "Bags",
    singularLabel: "Bag",
  },
  {
    value: "accessory",
    label: "Accessories",
    singularLabel: "Accessory",
  },
  {
    value: "swimwear",
    label: "Swimwear",
    singularLabel: "Swimwear",
  },
  {
    value: "activewear",
    label: "Activewear",
    singularLabel: "Activewear",
  },
  {
    value: "sleepwear",
    label: "Sleepwear",
    singularLabel: "Sleepwear",
  },
  {
    value: "other",
    label: "Other",
    singularLabel: "Item",
  },
] as const;

export type OutfitCategory =
  (typeof OUTFIT_CATEGORIES)[number]["value"];

export function getOutfitCategoryLabel(
  value: OutfitCategory
): string {
  return (
    OUTFIT_CATEGORIES.find(
      (category) => category.value === value
    )?.label ?? "Other"
  );
}