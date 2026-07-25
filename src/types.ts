export interface WeatherData {
  city: string;
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  description: string;
  iconId: string;
}

export interface ForecastData {
  date: string;
  tempMin: number;
  tempMax: number;
  description: string;
  iconId: string;
}
