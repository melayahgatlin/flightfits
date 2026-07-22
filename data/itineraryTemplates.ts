import {
  ItineraryActivity,
  ItineraryDay,
  TripItinerary,
} from '../types/itinerary';

function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

function normalizeDate(dateString: string): Date {
  return new Date(`${dateString}T12:00:00`);
}

function formatDateForStorage(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function generateItineraryDays(
  tripId: string,
  startDate: string,
  endDate: string
): ItineraryDay[] {
  const start = normalizeDate(startDate);
  const end = normalizeDate(endDate);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    end < start
  ) {
    return [];
  }

  const days: ItineraryDay[] = [];
  const currentDate = new Date(start);
  let dayNumber = 1;

  while (currentDate <= end) {
    days.push({
      id: createId('day'),
      tripId,
      dayNumber,
      date: formatDateForStorage(currentDate),
      activities: [],
    });

    currentDate.setDate(currentDate.getDate() + 1);
    dayNumber += 1;
  }

  return days;
}

export function createEmptyItinerary(
  tripId: string,
  startDate: string,
  endDate: string
): TripItinerary {
  const now = new Date().toISOString();

  return {
    tripId,
    days: generateItineraryDays(
      tripId,
      startDate,
      endDate
    ),
    createdAt: now,
    updatedAt: now,
  };
}

export function sortActivities(
  activities: ItineraryActivity[]
): ItineraryActivity[] {
  const periodOrder = {
    morning: 0,
    afternoon: 1,
    evening: 2,
  };

  return [...activities].sort((first, second) => {
    const periodDifference =
      periodOrder[first.period] -
      periodOrder[second.period];

    if (periodDifference !== 0) {
      return periodDifference;
    }

    if (first.startTime && second.startTime) {
      return first.startTime.localeCompare(second.startTime);
    }

    if (first.startTime) {
      return -1;
    }

    if (second.startTime) {
      return 1;
    }

    return first.createdAt.localeCompare(second.createdAt);
  });
}