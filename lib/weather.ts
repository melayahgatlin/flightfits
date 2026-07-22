export interface WeatherSummary {
  destination: string;
  condition: string;
  highCelsius: number;
  lowCelsius: number;
  rainChance: number;
}

export const weatherConfigured = Boolean(
  process.env.EXPO_PUBLIC_WEATHER_API_KEY
);
