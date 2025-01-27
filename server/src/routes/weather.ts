import { Router, Request, Response } from 'express';
import { OpenMeteoService } from '../services/openMeteoService.ts';
import { getRandomLocation } from '../utils/location.ts';
import axios from 'axios';

const router = Router();
const weatherService = new OpenMeteoService({
  baseUrl: 'https://api.open-meteo.com',
});

async function getCityInfo(lat: number, lon: number) {
  const response = await axios.get(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
    {
      headers: {
        'User-Agent': 'WeatherApp/1.0'
      }
    }
  );
  const data = response.data;
  
  const cityName = data.address.city || 
                  data.address.town || 
                  data.address.village || 
                  data.address.county ||
                  data.address.municipality ||
                  'Unknown Location';
                  
  // Filter out postal codes from location detail
  const locationDetail = data.display_name
    .split(', ')
    .filter(part => !part.match(/^\d{4,}$/)) // Remove parts that are just postal codes
    .slice(1)  // Remove the first part (city name)
    .join(', ');
  
  const imageUrl = await getLocationImage(cityName + ' ' + data.address.country);
  
  return { cityName, locationDetail, imageUrl };
}

async function getLocationImage(location: string) {
  try {
    const searchResponse = await axios.get(
      `https://en.wikipedia.org/w/api.php?` + 
      `action=query&format=json&origin=*&list=search&srsearch=${encodeURIComponent(location)}`
    );
    
    if (searchResponse.data.query.search.length > 0) {
      const pageId = searchResponse.data.query.search[0].pageid;
      
      const imageResponse = await axios.get(
        `https://en.wikipedia.org/w/api.php?` +
        `action=query&format=json&origin=*&prop=pageimages&pithumbsize=500&pageids=${pageId}`
      );
      
      const page = imageResponse.data.query.pages[pageId];
      return page.thumbnail?.source || '';
    }
    return '';
  } catch (error) {
    console.error('Failed to fetch location image:', error);
    return '';
  }
}

router.get('/weather', async (req: Request, res: Response) => {
  try {
    const { latitude, longitude, random } = req.query;
    
    let lat: number;
    let lon: number;
    let locationInfo;
    const MAX_ATTEMPTS = 5;

    if (random === 'true') {
      // Try to find a valid location
      for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        const coords = getRandomLocation();
        try {
          locationInfo = await getCityInfo(coords.lat, coords.lon);
          lat = coords.lat;
          lon = coords.lon;
          console.log(`Found valid location on attempt ${attempt}: ${locationInfo.cityName}`);
          break;
        } catch (error) {
          if (attempt === MAX_ATTEMPTS) {
            throw new Error('Failed to find a valid location after multiple attempts');
          }
          console.log(`Attempt ${attempt} failed, trying new coordinates...`);
          continue;
        }
      }
    } else {
      if (!latitude || !longitude) {
        return res.status(400).json({ error: 'Latitude and longitude are required' });
      }
      lat = Number(latitude);
      lon = Number(longitude);
      locationInfo = await getCityInfo(lat, lon);
    }

    // Only fetch weather data after we have a valid location
    const weatherData = await weatherService.getWeatherData(lat, lon, 'auto');

    res.json({
      ...weatherData,
      ...locationInfo
    });
  } catch (error) {
    console.error('Weather route error:', error);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

export default router; 