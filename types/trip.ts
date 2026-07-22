export type LuggageType =
  | "personal-item"
  | "carry-on"
  | "checked-bag";

export interface TripDraft {
  tripName: string;
  destination: string;
  startDate: string;
  endDate: string;
  luggageType: LuggageType;
  activities: string[];
}

export interface Trip extends TripDraft {
  id: string;
  userId: string;
  createdAt: string;
}
