import 'express-async-errors';
import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import tripRoutes from './routes/tripRoutes';

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/Trips_plan';

// Allow frontend on any local port during development
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim());

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      if (/^http:\/\/localhost:\d+$/.test(origin)) return callback(null, true);
      return callback(null, false);
    },
    credentials: true,
  })
);
app.use(express.json());

// Routes
app.use('/api/trips', tripRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'Backend', timestamp: new Date().toISOString() });
});

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[ERROR]', err.message);
  const status = (err as any).status || 500;
  res.status(status).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
});

async function start() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('[DB] MongoDB connected:', MONGODB_URI);
  } catch (err) {
    console.warn('[DB] MongoDB connection failed. Running without persistence:', (err as Error).message);
  }

  const server = app.listen(PORT, () => {
    console.log(`[SERVER] Backend running on http://localhost:${PORT}`);
    console.log(`[SERVER] Health: http://localhost:${PORT}/health`);
  });

  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`[SERVER] Port ${PORT} is already in use.`);
      console.error('[SERVER] Run: npm run free-port');
      console.error('[SERVER] Or stop the old process: netstat -ano | findstr :5000  then  taskkill /PID <pid> /F');
      process.exit(1);
    }
    throw err;
  });

  const shutdown = () => {
    server.close(() => {
      mongoose.disconnect().finally(() => process.exit(0));
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

start();
