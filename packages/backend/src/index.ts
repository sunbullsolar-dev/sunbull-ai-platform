import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import config from './config';
import logger from './utils/logger';
import { errorHandler, asyncHandler, notFoundHandler } from './middleware/errorHandler';
import { tenantMiddleware } from './middleware/tenant';
import { optionalAuth } from './middleware/auth';
import routes from './routes';
import { query as _bootstrapQuery } from './config/database';

const app: Application = express();

app.use(helmet());
app.use(compression());

const morganFormat = config.server.nodeEnv === 'production' ? 'combined' : 'dev';
app.use(morgan(morganFormat, {
  stream: {
    write: (message) => logger.info(message.trim()),
  },
}));

app.use(cors({
  origin: config.cors.origin,
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => config.server.nodeEnv === 'development',
});

app.use(limiter);

app.use(optionalAuth);
app.use(tenantMiddleware);

app.get('/health', asyncHandler(async (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'API is healthy',
    timestamp: new Date().toISOString(),
  });
}));

app.use(`/api/${config.server.apiVersion}`, routes);

app.use(notFoundHandler);
app.use(errorHandler);

(async () => {
  try {
    await _bootstrapQuery(`ALTER TABLE leads ADD COLUMN IF NOT EXISTS monthly_bill FLOAT`);
    await _bootstrapQuery(`ALTER TABLE leads ADD COLUMN IF NOT EXISTS bill_unit VARCHAR(10)`);
    await _bootstrapQuery(`ALTER TABLE leads ADD COLUMN IF NOT EXISTS home_ownership VARCHAR(20)`);
    await _bootstrapQuery(`ALTER TABLE leads ADD COLUMN IF NOT EXISTS home_type VARCHAR(30)`);
    await _bootstrapQuery(`ALTER TABLE leads ADD COLUMN IF NOT EXISTS credit_range VARCHAR(20)`);
    await _bootstrapQuery(`ALTER TABLE leads ADD COLUMN IF NOT EXISTS timeline VARCHAR(30)`);
    await _bootstrapQuery(`ALTER TABLE leads ADD COLUMN IF NOT EXISTS roof_shading VARCHAR(20)`);
    await _bootstrapQuery(`ALTER TABLE leads ADD COLUMN IF NOT EXISTS roof_age VARCHAR(20)`);
    await _bootstrapQuery(`ALTER TABLE leads ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION`);
    await _bootstrapQuery(`ALTER TABLE leads ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION`);
    await _bootstrapQuery(`ALTER TABLE leads ADD COLUMN IF NOT EXISTS formatted_address TEXT`);
    await _bootstrapQuery(`ALTER TABLE leads ADD COLUMN IF NOT EXISTS zip_code VARCHAR(10)`);
    await _bootstrapQuery(`ALTER TABLE leads ADD COLUMN IF NOT EXISTS state VARCHAR(2)`);
    await _bootstrapQuery(`ALTER TABLE leads ADD COLUMN IF NOT EXISTS ip_address VARCHAR(64)`);
    await _bootstrapQuery(`ALTER TABLE leads ADD COLUMN IF NOT EXISTS user_agent TEXT`);
    await _bootstrapQuery(`ALTER TABLE leads ADD COLUMN IF NOT EXISTS lead_source VARCHAR(50)`);
    logger.info('Schema bootstrap complete');
  } catch (e: any) {
    logger.warn('Schema bootstrap failed (continuing)', { msg: e?.message });
  }
})();

const PORT = config.server.port;
const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT} in ${config.server.nodeEnv} mode`);
});

const gracefulShutdown = () => {
  logger.info('Graceful shutdown initiated');
  
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });

  setTimeout(() => {
    logger.error('Forced shutdown');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', { error });
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection', { reason });
});

export default app;
