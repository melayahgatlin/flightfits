import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  CreateActivityInput,
  ItineraryActivity,
  TripItinerary,
  UpdateActivityInput,
} from '../types/itinerary';

import {
  createEmptyItinerary,
  sortActivities,
} from '../data/itineraryTemplates';

const ITINERARY_STORAGE_KEY = 'flightfits.itineraries';

type StoredItineraries = Record<string, TripItinerary>;

function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

async function getStoredItineraries(): Promise<StoredItineraries> {
  try {
    const storedValue = await AsyncStorage.getItem(
      ITINERARY_STORAGE_KEY
    );

    if (!storedValue) {
      return {};
    }

    const parsedValue = JSON.parse(storedValue);

    if (
      typeof parsedValue !== 'object' ||
      parsedValue === null ||
      Array.isArray(parsedValue)
    ) {
      return {};
    }

    return parsedValue as StoredItineraries;
  } catch (error) {
    console.error(
      'Unable to read stored itineraries:',
      error
    );

    return {};
  }
}

async function saveStoredItineraries(
  itineraries: StoredItineraries
): Promise<void> {
  await AsyncStorage.setItem(
    ITINERARY_STORAGE_KEY,
    JSON.stringify(itineraries)
  );
}

export async function getItinerary(
  tripId: string
): Promise<TripItinerary | null> {
  const itineraries = await getStoredItineraries();

  return itineraries[tripId] ?? null;
}

export async function getOrCreateItinerary(
  tripId: string,
  startDate: string,
  endDate: string
): Promise<TripItinerary> {
  const itineraries = await getStoredItineraries();
  const existingItinerary = itineraries[tripId];

  if (existingItinerary) {
    return existingItinerary;
  }

  const newItinerary = createEmptyItinerary(
    tripId,
    startDate,
    endDate
  );

  itineraries[tripId] = newItinerary;

  await saveStoredItineraries(itineraries);

  return newItinerary;
}

export async function saveItinerary(
  itinerary: TripItinerary
): Promise<void> {
  const itineraries = await getStoredItineraries();

  itineraries[itinerary.tripId] = {
    ...itinerary,
    updatedAt: new Date().toISOString(),
  };

  await saveStoredItineraries(itineraries);
}

export async function addActivity(
  input: CreateActivityInput
): Promise<ItineraryActivity> {
  const itineraries = await getStoredItineraries();
  const itinerary = itineraries[input.tripId];

  if (!itinerary) {
    throw new Error(
      'The itinerary must be created before adding an activity.'
    );
  }

  const matchingDay = itinerary.days.find(
    (day) => day.date === input.date
  );

  if (!matchingDay) {
    throw new Error(
      'The selected date is not part of this trip.'
    );
  }

  const now = new Date().toISOString();

  const newActivity: ItineraryActivity = {
    id: createId('activity'),
    tripId: input.tripId,
    date: input.date,
    period: input.period,
    title: input.title.trim(),
    startTime: input.startTime?.trim() || undefined,
    endTime: input.endTime?.trim() || undefined,
    location: input.location?.trim() || undefined,
    address: input.address?.trim() || undefined,
    notes: input.notes?.trim() || undefined,
    cost: input.cost,
    reservationLink:
      input.reservationLink?.trim() || undefined,
    createdAt: now,
    updatedAt: now,
  };

  const updatedDays = itinerary.days.map((day) => {
    if (day.date !== input.date) {
      return day;
    }

    return {
      ...day,
      activities: sortActivities([
        ...day.activities,
        newActivity,
      ]),
    };
  });

  itineraries[input.tripId] = {
    ...itinerary,
    days: updatedDays,
    updatedAt: now,
  };

  await saveStoredItineraries(itineraries);

  return newActivity;
}

export async function updateActivity(
  tripId: string,
  activityId: string,
  updates: UpdateActivityInput
): Promise<ItineraryActivity> {
  const itineraries = await getStoredItineraries();
  const itinerary = itineraries[tripId];

  if (!itinerary) {
    throw new Error('Itinerary not found.');
  }

  let updatedActivity: ItineraryActivity | null = null;

  const existingActivity = itinerary.days
    .flatMap((day) => day.activities)
    .find((activity) => activity.id === activityId);

  if (!existingActivity) {
    throw new Error('Activity not found.');
  }

  const targetDate =
    updates.date ?? existingActivity.date;

  const targetDay = itinerary.days.find(
    (day) => day.date === targetDate
  );

  if (!targetDay) {
    throw new Error(
      'The selected date is not part of this trip.'
    );
  }

  const now = new Date().toISOString();

  updatedActivity = {
    ...existingActivity,
    ...updates,
    title:
      updates.title !== undefined
        ? updates.title.trim()
        : existingActivity.title,
    startTime:
      updates.startTime !== undefined
        ? updates.startTime.trim() || undefined
        : existingActivity.startTime,
    endTime:
      updates.endTime !== undefined
        ? updates.endTime.trim() || undefined
        : existingActivity.endTime,
    location:
      updates.location !== undefined
        ? updates.location.trim() || undefined
        : existingActivity.location,
    address:
      updates.address !== undefined
        ? updates.address.trim() || undefined
        : existingActivity.address,
    notes:
      updates.notes !== undefined
        ? updates.notes.trim() || undefined
        : existingActivity.notes,
    reservationLink:
      updates.reservationLink !== undefined
        ? updates.reservationLink.trim() || undefined
        : existingActivity.reservationLink,
    date: targetDate,
    updatedAt: now,
  };

  const updatedDays = itinerary.days.map((day) => {
    const activitiesWithoutOriginal =
      day.activities.filter(
        (activity) => activity.id !== activityId
      );

    if (day.date !== targetDate) {
      return {
        ...day,
        activities: activitiesWithoutOriginal,
      };
    }

    return {
      ...day,
      activities: sortActivities([
        ...activitiesWithoutOriginal,
        updatedActivity as ItineraryActivity,
      ]),
    };
  });

  itineraries[tripId] = {
    ...itinerary,
    days: updatedDays,
    updatedAt: now,
  };

  await saveStoredItineraries(itineraries);

  return updatedActivity;
}

export async function deleteActivity(
  tripId: string,
  activityId: string
): Promise<void> {
  const itineraries = await getStoredItineraries();
  const itinerary = itineraries[tripId];

  if (!itinerary) {
    return;
  }

  const updatedDays = itinerary.days.map((day) => ({
    ...day,
    activities: day.activities.filter(
      (activity) => activity.id !== activityId
    ),
  }));

  itineraries[tripId] = {
    ...itinerary,
    days: updatedDays,
    updatedAt: new Date().toISOString(),
  };

  await saveStoredItineraries(itineraries);
}

export async function deleteItinerary(
  tripId: string
): Promise<void> {
  const itineraries = await getStoredItineraries();

  delete itineraries[tripId];

  await saveStoredItineraries(itineraries);
}

export async function clearAllItineraries(): Promise<void> {
  await AsyncStorage.removeItem(ITINERARY_STORAGE_KEY);
}