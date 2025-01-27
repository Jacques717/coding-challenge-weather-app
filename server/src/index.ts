import express from 'express';
import cors from 'cors';
import weatherRoutes from './routes/weather.ts';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET'],
  credentials: true
}));

app.use('/api', weatherRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 