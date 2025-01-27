import { Router, Request, Response } from 'express';
import { OpenMeteoService } from '../services/openMeteoService.ts';
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
                  
  const locationDetail = data.display_name
    .split(', ')
    .slice(1)
    .join(', ');

  // Get location image
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
    
    if (random === 'true') {
      const coords = weatherService.getRandomLocation();
      lat = coords.lat;
      lon = coords.lon;
    } else {
      if (!latitude || !longitude) {
        return res.status(400).json({ error: 'Latitude and longitude are required' });
      }
      lat = Number(latitude);
      lon = Number(longitude);
    }

    // Get weather data and location info in parallel
    const [weatherData, locationInfo] = await Promise.all([
      weatherService.getWeatherData(lat, lon, 'auto'),
      getCityInfo(lat, lon)
    ]);

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