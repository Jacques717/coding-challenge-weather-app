import { BaseWeatherService } from './baseWeatherService.ts';
import { WeatherResponse } from '../types/weather.ts';

export class OpenMeteoService extends BaseWeatherService {
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