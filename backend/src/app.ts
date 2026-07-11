import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { env } from './config/env';
import { connectDatabase, checkDatabaseHealth } from './config/database';
import { initializeAIClient } from './config/ai';
import { logger } from './utils/logger';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';

// Import routes
import routes from './routes';

const app: Application = express();

/**
 * Initialize Application
 */
export const initializeApp = async (): Promise<Application> => {
  try {
    // Connect to database
    await connectDatabase();

    // Initialize AI client
    initializeAIClient();

    // Security middleware
    app.use(
      helmet({
        crossOriginResourcePolicy: { policy: 'cross-origin' },
      })
    );

    // CORS configuration
    const corsOrigins = env.CORS_ORIGIN.split(',').map((origin) => origin.trim());
    app.use(
      cors({
        origin: corsOrigins.includes('*') ? true : corsOrigins,
        credentials: true,
      })
    );

    // Compression middleware
    app.use(compression());

    // Body parser middleware
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logger
    app.use(requestLogger);

    // Rate limiting
    app.use('/api/', apiLimiter);

    // Health check routes
    const healthHandler = async (req: express.Request, res: express.Response) => {
      const dbHealth = await checkDatabaseHealth();

      res.status(dbHealth.healthy ? 200 : 503).json({
        status: dbHealth.healthy ? 'ok' : 'degraded',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: env.NODE_ENV,
        database: {
          connected: dbHealth.healthy,
          latency: dbHealth.latency,
          status: dbHealth.status,
        },
      });
    };

    app.get('/health', healthHandler);
    app.get('/api/health', healthHandler);

    // API routes
    app.use('/api', routes);

    // Not found handler
    app.use(notFoundHandler);

    // Error handler (must be last)
    app.use(errorHandler);

    logger.info('Application initialized successfully');

    return app;
  } catch (error) {
    logger.error('Failed to initialize application:', error);
    throw error;
  }
};

export default app;
