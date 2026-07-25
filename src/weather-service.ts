import { WeatherData, ForecastData } from './types';

const BASE_URL = 'https://api.openweathermap.org/data/2.5';

export class WeatherService {
  private apiKey: string;
  private unit: 'metric' | 'imperial';

  constructor(apiKey: string, unit: 'metric' | 'imperial' = 'metric') {
    this.apiKey = apiKey;
    this.unit = unit;
  }

  setUnit(unit: 'metric' | 'imperial') {
    this.unit = unit;
  }

  getUnit() {
    return this.unit;
  }

  async getWeatherByCity(city: string): Promise<WeatherData> {
    const res = await fetch(`${BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${this.apiKey}&units=${this.unit}`);
    if (!res.ok) {
      if (res.status === 401) throw new Error("ERR_401: INVALID API KEY");
      if (res.status === 404) throw new Error("ERR_404: LOCATION NOT FOUND IN DATABASE");
      throw new Error(`ERR_${res.status}: SIGNAL LOST`);
    }
    const data = await res.json();
    return this.mapWeatherData(data);
  }

  async getWeatherByCoords(lat: number, lon: number): Promise<WeatherData> {
    const res = await fetch(`${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=${this.unit}`);
    if (!res.ok) {
      if (res.status === 401) throw new Error("ERR_401: INVALID API KEY");
      throw new Error(`ERR_${res.status}: SIGNAL LOST`);
    }
    const data = await res.json();
    return this.mapWeatherData(data);
  }

  async getForecastByCity(city: string): Promise<ForecastData[]> {
    const res = await fetch(`${BASE_URL}/forecast?q=${encodeURIComponent(city)}&appid=${this.apiKey}&units=${this.unit}`);
    if (!res.ok) {
      throw new Error(`ERR_${res.status}: FAILED TO RETRIEVE FORECAST`);
    }
    const data = await res.json();
    return this.mapForecastData(data);
  }

  async getForecastByCoords(lat: number, lon: number): Promise<ForecastData[]> {
    const res = await fetch(`${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=${this.unit}`);
    if (!res.ok) {
      throw new Error(`ERR_${res.status}: FAILED TO RETRIEVE FORECAST`);
    }
    const data = await res.json();
    return this.mapForecastData(data);
  }

  private mapWeatherData(data: any): WeatherData {
    return {
      city: data.name,
      temp: data.main.temp,
      feelsLike: data.main.feels_like,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      description: data.weather[0].description.toUpperCase(),
      iconId: data.weather[0].icon
    };
  }

  private mapForecastData(data: any): ForecastData[] {
    // OpenWeatherMap 5-day forecast returns 3-hour chunks (40 items).
    // We'll extract one per day (e.g., around 12:00 PM).
    const dailyForecasts: ForecastData[] = [];
    const seenDates = new Set<string>();

    for (const item of data.list) {
      const dateObj = new Date(item.dt * 1000);
      const dateStr = dateObj.toLocaleDateString();
      
      // Grab the forecast if we haven't seen this date and it's near noon, or if we just want the first of each day.
      if (!seenDates.has(dateStr) && dateObj.getHours() >= 11 && dateObj.getHours() <= 14) {
        seenDates.add(dateStr);
        dailyForecasts.push({
          date: dateStr,
          tempMin: item.main.temp_min,
          tempMax: item.main.temp_max,
          description: item.weather[0].description.toUpperCase(),
          iconId: item.weather[0].icon
        });
      }
    }

    // Sometimes we might miss one depending on the timezone, fallback to just take max 5 distinct days
    if (dailyForecasts.length < 5) {
      const distinctDays = Array.from(new Set(data.list.map((item: any) => new Date(item.dt * 1000).toLocaleDateString()))) as string[];
      
      return distinctDays.slice(0, 5).map(day => {
         const dayItems = data.list.filter((item: any) => new Date(item.dt * 1000).toLocaleDateString() === day);
         const firstItem = dayItems[Math.floor(dayItems.length / 2)]; // pick middle of the day
         return {
            date: day,
            tempMin: Math.min(...dayItems.map((i: any) => i.main.temp_min)),
            tempMax: Math.max(...dayItems.map((i: any) => i.main.temp_max)),
            description: firstItem.weather[0].description.toUpperCase(),
            iconId: firstItem.weather[0].icon
         }
      })
    }

    return dailyForecasts.slice(0, 5);
  }
}
