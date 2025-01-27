import { BaseWeatherService } from './baseWeatherService.ts';
import { WeatherResponse } from '../types/weather.ts';

export class OpenMeteoService extends BaseWeatherService {
  private retryCount = 0;
  private readonly MAX_RETRIES = 3;

  async getWeatherData(lat: number, lon: number, timezone: string): Promise<WeatherResponse> {
    try {
      return await super.getWeatherData(lat, lon, timezone);
    } catch (error) {
      if (this.retryCount < this.MAX_RETRIES) {
        this.retryCount++;
        console.log(`Retry attempt ${this.retryCount} of ${this.MAX_RETRIES}`);
        
        // Generate new random coordinates for retry
        const newCoords = this.getRandomLocation();
        return this.getWeatherData(newCoords.lat, newCoords.lon, timezone);
      }
      this.retryCount = 0;
      throw error;
    }
  }

  public getRandomLocation() {
    // Generate random latitude between -60 and 70 (most inhabited areas)
    const lat = Math.random() * 130 - 60;
    // Generate random longitude between -180 and 180
    const lon = Math.random() * 360 - 180;
    
    return {
      lat: Math.round(lat * 10000) / 10000,
      lon: Math.round(lon * 10000) / 10000
    };
  }

  protected getEndpoint(): string {
    return '/v1/forecast';
  }

  protected getAdditionalParams(timezone: string): object {
    return {
      hourly: ['temperature_2m', 'weathercode'],
      daily: ['temperature_2m_max', 'temperature_2m_min'],
      timezone,
    };
  }

  protected transformResponse(data: any): WeatherResponse {
    if (!data?.hourly || !data?.daily) {
      throw new Error('Invalid weather data format');
    }

    return {
      hourly: {
        time: data.hourly.time,
        temperature_2m: data.hourly.temperature_2m,
        weathercode: data.hourly.weathercode,
      },
      daily: {
        time: data.daily.time,
        temperature_2m_max: data.daily.temperature_2m_max,
        temperature_2m_min: data.daily.temperature_2m_min,
      },
    };
  }
} 