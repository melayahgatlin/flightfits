import type { LuggageType } from "@/types/trip";

export interface LuggageOption {
  label: string;
  shortLabel: string;
  description: string;
  value: LuggageType;
  emoji: string;
  approximateCapacityLiters: number;
}

export const LUGGAGE_OPTIONS: readonly LuggageOption[] = [
  {
    label: "Personal item only",
    shortLabel: "Personal item",
    description:
      "A backpack, tote, or small bag that fits beneath the seat.",
    value: "personal-item",
    emoji: "🎒",
    approximateCapacityLiters: 25,
  },
  {
    label: "Carry-on suitcase",
    shortLabel: "Carry-on",
    description:
      "A standard cabin suitcase plus normal airline size restrictions.",
    value: "carry-on",
    emoji: "🧳",
    approximateCapacityLiters: 40,
  },
  {
    label: "Checked suitcase",
    shortLabel: "Checked bag",
    description:
      "A full-size suitcase checked before boarding.",
    value: "checked-bag",
    emoji: "🛄",
    approximateCapacityLiters: 75,
  },
] as const;

export function getLuggageOption(
  value: LuggageType
): LuggageOption {
  return (
    LUGGAGE_OPTIONS.find((option) => option.value === value) ??
    LUGGAGE_OPTIONS[1]
  );
}