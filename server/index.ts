import express from 'express';
import cors from 'cors';
import { initDatabase } from './database';
import brandsRouter from './routes/brands';
import retailersRouter from './routes/retailers';
import productsRouter from './routes/products';
import salesRouter from './routes/sales';
import forecastsRouter from './routes/forecasts';
import analyticsRouter from './routes/analytics';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.use('/api/brands', brandsRouter);
app.use('/api/retailers', retailersRouter);
app.use('/api/products', productsRouter);
app.use('/api/sales', salesRouter);
app.use('/api/forecasts', forecastsRouter);
app.use('/api/analytics', analyticsRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Beauty Sales & Forecast Tracker API' });
});

const startServer = async () => {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
