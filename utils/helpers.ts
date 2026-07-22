export function createId(prefix = "item"): string {
  const randomValue =
    Math.random().toString(36).slice(2, 10);

  return `${prefix}-${Date.now()}-${randomValue}`;
}

export function normalizeText(value: string): string {
  return value.trim().toLocaleLowerCase();
}

export function uniqueByName<
  T extends { name: string },
>(items: readonly T[]): T[] {
  const seen = new Set<string>();
  const uniqueItems: T[] = [];

  for (const item of items) {
    const key = normalizeText(item.name);

    if (!key || seen.has(key)) {
      continue;
    }

    seen.add(key);
    uniqueItems.push(item);
  }

  return uniqueItems;
}

export function uniqueById<
  T extends { id: string },
>(items: readonly T[]): T[] {
  const map = new Map<string, T>();

  for (const item of items) {
    map.set(item.id, item);
  }

  return Array.from(map.values());
}

export function toggleArrayValue<T>(
  values: readonly T[],
  value: T
): T[] {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

export function clamp(
  value: number,
  minimum: number,
  maximum: number
): number {
  return Math.min(Math.max(value, minimum), maximum);
}

export function sleep(
  milliseconds: number
): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

export function groupBy<T, K extends string>(
  values: readonly T[],
  getKey: (value: T) => K
): Record<K, T[]> {
  return values.reduce(
    (groups, value) => {
      const key = getKey(value);
      const existing = groups[key] ?? [];

      return {
        ...groups,
        [key]: [...existing, value],
      };
    },
    {} as Record<K, T[]>
  );
}

export function removeUndefinedValues<
  T extends Record<string, unknown>,
>(value: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(value).filter(
      ([, entryValue]) =>
        entryValue !== undefined
    )
  ) as Partial<T>;
}

export function sortByCreatedAtDescending<
  T extends { createdAt: string },
>(values: readonly T[]): T[] {
  return [...values].sort(
    (first, second) =>
      new Date(second.createdAt).getTime() -
      new Date(first.createdAt).getTime()
  );
}