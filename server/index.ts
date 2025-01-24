// server/index.js or wherever your server entry point is
import express, { Request, Response } from 'express';
import axios from 'axios';

const app = express();
const PORT = process.env.PORT || 3001;

app.get('/api/weather', async (req: Request, res: Response) => {
    try {
        const response = await axios.get('https://api.open-meteo.com/v1/forecast', {
            params: {
                latitude: req.query.latitude,
                longitude: req.query.longitude,
                hourly: 'temperature_2m'
            }
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch weather data' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});