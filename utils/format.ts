export function capitalize(value: string): string {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  return (
    trimmed.charAt(0).toUpperCase() +
    trimmed.slice(1)
  );
}

export function titleCase(value: string): string {
  return value
    .trim()
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map(capitalize)
    .join(" ");
}

export function formatLuggageType(
  value: string
): string {
  return titleCase(value);
}

export function formatCurrency(
  value: number,
  currency = "USD",
  locale = "en-US"
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits:
        Number.isInteger(value) ? 0 : 2,
    }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
}

export function formatCompactNumber(
  value: number
): string {
  try {
    return new Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  } catch {
    return String(value);
  }
}

export function formatPercentage(
  value: number,
  fractionDigits = 0
): string {
  const normalized =
    value > 1 ? value / 100 : value;

  return new Intl.NumberFormat("en-US", {
    style: "percent",
    maximumFractionDigits: fractionDigits,
  }).format(normalized);
}

export function truncate(
  value: string,
  maximumLength: number
): string {
  if (value.length <= maximumLength) {
    return value;
  }

  return `${value.slice(
    0,
    Math.max(0, maximumLength - 1)
  )}…`;
}

export function pluralize(
  count: number,
  singular: string,
  plural = `${singular}s`
): string {
  return count === 1 ? singular : plural;
}