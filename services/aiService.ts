import type { PackingItem } from "@/types/packing";
import type { TripDraft } from "@/types/trip";

/*
  Never place a private AI API key directly in a mobile app.
  Later, this function should call your own FastAPI backend.
*/
export async function generateAIPackingList(
  _trip: TripDraft
): Promise<PackingItem[]> {
  throw new Error(
    "AI is not connected yet. Use generatePackingList from packingService for the MVP."
  );
}
