import axios from 'axios';
import { WeatherService, WeatherResponse, WeatherServiceConfig } from '../types/weather.ts';

export abstract class BaseWeatherService implements WeatherService {
  constructor(protected config: WeatherServiceConfig) {}

  protected abstract transformResponse(data: any): WeatherResponse;
  protected abstract getEndpoint(): string;
  protected abstract getAdditionalParams(timezone: string): object;

  protected async fetchWeatherData(url: string, params: object): Promise<any> {
    try {
      const response = await axios.get(url, { params });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Weather API error: ${error.message}`);
      }
      throw error;
    }
  }

  async getWeatherData(lat: number, lon: number, timezone: string): Promise<WeatherResponse> {
    const url = `${this.config.baseUrl}${this.getEndpoint()}`;
    const params = {
      latitude: lat,
      longitude: lon,
      ...this.getAdditionalParams(timezone),
    };

    const data = await this.fetchWeatherData(url, params);
    return this.transformResponse(data);
  }
} 