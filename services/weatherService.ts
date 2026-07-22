import type { WeatherSummary } from "@/lib/weather";

export async function getWeatherSummary(
  destination: string
): Promise<WeatherSummary> {
  // Starter mock. Replace this with a real weather API later.
  return {
    destination,
    condition: "Weather API not connected",
    highCelsius: 24,
    lowCelsius: 16,
    rainChance: 0,
  };
}
