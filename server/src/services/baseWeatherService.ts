import axios from 'axios';
import { WeatherService, WeatherResponse, WeatherServiceConfig } from '../types/weather.ts';

export abstract class BaseWeatherService implements WeatherService {
  constructor(protected config: WeatherServiceConfig) {}

  protected abstract transformResponse(data: any): WeatherResponse;
  protected abstract getEndpoint(): string;
  protected abstract getAdditionalParams(timezone: string): object;
  protected abstract getRandomLocation(): { lat: number, lon: number };

  protected async fetchWeatherData(url: string, params: object): Promise<any> {
    try {
      const response = await axios.get(url, { params });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.data?.error === "Unable to geocode") {
          throw new Error('GEOCODE_ERROR');
        }
        throw new Error(`Weather API error: ${error.message}`);
      }
      throw error;
    }
  }

  async getWeatherData(lat: number, lon: number, timezone: string, retryCount = 0): Promise<WeatherResponse> {
    try {
      const url = `${this.config.baseUrl}${this.getEndpoint()}`;
      const params = {
        latitude: lat,
        longitude: lon,
        ...this.getAdditionalParams(timezone),
      };

      const data = await this.fetchWeatherData(url, params);
      return this.transformResponse(data);
    } catch (error) {
      if (error instanceof Error && error.message === 'GEOCODE_ERROR' && retryCount < 3) {
        console.log(`Geocoding failed, trying new coordinates (attempt ${retryCount + 1}/3)`);
        const newCoords = this.getRandomLocation();
        return this.getWeatherData(newCoords.lat, newCoords.lon, timezone, retryCount + 1);
      }
      throw error;
    }
  }
} 