import { BaseWeatherService } from './baseWeatherService.ts';
import { WeatherResponse } from '../types/weather.ts';

export class OpenMeteoService extends BaseWeatherService {
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000; // 1 second

  protected async fetchWeatherData(url: string, params: object): Promise<any> {
    let lastError;
    
    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        const response = await super.fetchWeatherData(url, params);
        return response;
      } catch (error) {
        lastError = error;
        console.log(`Weather API attempt ${attempt} failed, retrying...`);
        
        if (attempt < this.MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY));
        }
      }
    }
    
    throw lastError;
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

  public getRandomLocation() {
    const lat = Math.random() * 130 - 60;  // -60 to 70
    const lon = Math.random() * 360 - 180;  // -180 to 180
    return {
      lat: Math.round(lat * 10000) / 10000,
      lon: Math.round(lon * 10000) / 10000
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