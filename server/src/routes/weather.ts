import { Router, Request, Response } from 'express';
import { OpenMeteoService } from '../services/openMeteoService.ts';

const router = Router();
const weatherService = new OpenMeteoService({
  baseUrl: 'https://api.open-meteo.com',
});

router.get('/weather', async (req: Request, res: Response) => {
  try {
    const { latitude, longitude, timezone } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const data = await weatherService.getWeatherData(
      Number(latitude),
      Number(longitude),
      String(timezone || 'auto')
    );

    res.json(data);
  } catch (error) {
    console.error('Weather route error:', error);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

export default router; 