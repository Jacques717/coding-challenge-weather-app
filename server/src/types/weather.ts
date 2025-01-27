export interface HourlyData {
  time: string[];
  temperature_2m: number[];
  weathercode: number[];
}

export interface DailyData {
  time: string[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
}

export interface WeatherResponse {
  hourly: HourlyData;
  daily: DailyData;
}

export interface WeatherServiceConfig {
  baseUrl: string;
  timezone?: string;
}

export interface WeatherService {
  getWeatherData(lat: number, lon: number, timezone: string): Promise<WeatherResponse>;
} 