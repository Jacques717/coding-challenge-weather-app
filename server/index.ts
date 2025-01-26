// server/index.js or wherever your server entry point is
import express, { Request, Response } from 'express';
import axios from 'axios';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS
app.use(cors({
    origin: 'http://localhost:3000', // Allow requests from your Nuxt app
    methods: ['GET'], // Only allow GET requests
    credentials: true
}));

app.get('/api/weather', async (req: Request, res: Response) => {
    console.log(req.query);
    try {
        const response = await axios.get('https://api.open-meteo.com/v1/forecast', {
            params: {
                latitude: req.query.latitude,
                longitude: req.query.longitude,
                hourly: ['temperature_2m', 'weathercode'],
                daily: ['temperature_2m_max', 'temperature_2m_min'],
                timezone: 'auto'
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