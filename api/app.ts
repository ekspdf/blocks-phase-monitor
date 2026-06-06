import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import sectorRoutes from './routes/sectors.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app: express.Application = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/sectors', sectorRoutes);

app.use(
  '/api/health',
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.status(200).json({
      success: true,
      message: 'ok',
    });
  },
);

app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  res.status(500).json({
    success: false,
    error: 'Server internal error',
  });
});

app.use((req: express.Request, res: express.Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found',
  });
});

export default app;
