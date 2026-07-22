const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function parseDateOnly(value: string): Date | null {
  if (!DATE_ONLY_PATTERN.test(value)) {
    return null;
  }

  const [yearText, monthText, dayText] = value.split("-");

  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day)
  ) {
    return null;
  }

  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

export function toDateOnlyString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function isValidDateOnly(value: string): boolean {
  return parseDateOnly(value) !== null;
}

export function calculateTripLength(
  startDate: string,
  endDate: string
): number {
  const start = parseDateOnly(startDate);
  const end = parseDateOnly(endDate);

  if (!start || !end || end < start) {
    return 0;
  }

  const millisecondsPerDay = 86_400_000;

  return (
    Math.floor(
      (end.getTime() - start.getTime()) /
        millisecondsPerDay
    ) + 1
  );
}

export function formatDisplayDate(
  value: string,
  includeYear = true
): string {
  const date = parseDateOnly(value);

  if (!date) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    ...(includeYear ? { year: "numeric" } : {}),
  }).format(date);
}

export function formatDateRange(
  startDate: string,
  endDate: string
): string {
  if (startDate === endDate) {
    return formatDisplayDate(startDate);
  }

  const start = parseDateOnly(startDate);
  const end = parseDateOnly(endDate);

  if (!start || !end) {
    return `${startDate} – ${endDate}`;
  }

  const sameYear =
    start.getFullYear() === end.getFullYear();

  const startLabel = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
  }).format(start);

  const endLabel = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(end);

  return `${startLabel} – ${endLabel}`;
}

export function enumerateTripDates(
  startDate: string,
  endDate: string
): string[] {
  const start = parseDateOnly(startDate);
  const end = parseDateOnly(endDate);

  if (!start || !end || end < start) {
    return [];
  }

  const dates: string[] = [];
  const current = new Date(start);

  while (current <= end) {
    dates.push(toDateOnlyString(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

export function combineDateAndTime(
  date: string,
  time?: string
): string | null {
  const parsedDate = parseDateOnly(date);

  if (!parsedDate) {
    return null;
  }

  const normalizedTime =
    time && /^\d{2}:\d{2}$/.test(time)
      ? time
      : "00:00";

  const [hourText, minuteText] =
    normalizedTime.split(":");

  parsedDate.setHours(
    Number(hourText),
    Number(minuteText),
    0,
    0
  );

  return parsedDate.toISOString();
}

export function isDateWithinRange(
  value: string,
  startDate: string,
  endDate: string
): boolean {
  const date = parseDateOnly(value);
  const start = parseDateOnly(startDate);
  const end = parseDateOnly(endDate);

  if (!date || !start || !end) {
    return false;
  }

  return date >= start && date <= end;
}