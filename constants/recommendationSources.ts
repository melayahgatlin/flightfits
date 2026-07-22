export const RECOMMENDATION_SOURCES = [
  {
    value: "flightfits",
    label: "FlightFits",
  },
  {
    value: "community",
    label: "FlightFits community",
  },
  {
    value: "tripadvisor",
    label: "Tripadvisor",
  },
  {
    value: "ticketmaster",
    label: "Ticketmaster",
  },
  {
    value: "predicthq",
    label: "PredictHQ",
  },
  {
    value: "google-places",
    label: "Google Places",
  },
  {
    value: "retailer",
    label: "Retailer",
  },
  {
    value: "user",
    label: "User submitted",
  },
] as const;

export type RecommendationSource =
  (typeof RECOMMENDATION_SOURCES)[number]["value"];

export function getRecommendationSourceLabel(
  value: RecommendationSource
): string {
  return (
    RECOMMENDATION_SOURCES.find(
      (source) => source.value === value
    )?.label ?? "External source"
  );
}