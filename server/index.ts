import express from 'express';
import cors from 'cors';
import { initDatabase } from './database';
import productsRouter from './routes/products';
import budgetsRouter from './routes/budgets';
import purchaseOrdersRouter from './routes/purchase-orders';
import analyticsRouter from './routes/analytics';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.use('/api/products', productsRouter);
app.use('/api/budgets', budgetsRouter);
app.use('/api/purchase-orders', purchaseOrdersRouter);
app.use('/api/analytics', analyticsRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Beauty Merchandise Planner API' });
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
