import express from 'express';
import cors from 'cors';
import { initDatabase } from './database';
import brandsRouter from './routes/brands';
import collaborationsRouter from './routes/collaborations';
import tagsRouter from './routes/tags';
import industriesRouter from './routes/industries';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.use('/api/brands', brandsRouter);
app.use('/api/collaborations', collaborationsRouter);
app.use('/api/tags', tagsRouter);
app.use('/api/industries', industriesRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'CollabIQ API - Brand Partnership Tracker' });
});

const startServer = async () => {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`CollabIQ server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
