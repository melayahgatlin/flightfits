export type ItineraryTimePeriod =
  | 'morning'
  | 'afternoon'
  | 'evening';

export type ItineraryActivity = {
  id: string;
  tripId: string;
  date: string;
  period: ItineraryTimePeriod;
  title: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  address?: string;
  notes?: string;
  cost?: number;
  reservationLink?: string;
  createdAt: string;
  updatedAt: string;
};

export type ItineraryDay = {
  id: string;
  tripId: string;
  dayNumber: number;
  date: string;
  activities: ItineraryActivity[];
};

export type TripItinerary = {
  tripId: string;
  days: ItineraryDay[];
  createdAt: string;
  updatedAt: string;
};

export type CreateActivityInput = {
  tripId: string;
  date: string;
  period: ItineraryTimePeriod;
  title: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  address?: string;
  notes?: string;
  cost?: number;
  reservationLink?: string;
};

export type UpdateActivityInput = Partial<
  Omit<
    ItineraryActivity,
    'id' | 'tripId' | 'createdAt' | 'updatedAt'
  >
>;