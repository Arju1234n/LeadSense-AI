import { env } from './config/env';
import { logger } from './utils/logger';
import { initializeApp } from './app';

/**
 * Start the server
 */
const startServer = async () => {
  try {
    const app = await initializeApp();

    const server = app.listen(env.PORT, () => {
      logger.info(`🚀 Server started successfully`, {
        port: env.PORT,
        environment: env.NODE_ENV,
        aiProvider: env.AI_PROVIDER,
      });
    });

    // Graceful shutdown handlers
    const gracefulShutdown = async (signal: string) => {
      logger.info(`${signal} received. Starting graceful shutdown...`);

      server.close(async () => {
        logger.info('HTTP server closed');

        try {
          // Close database connection
          const { disconnectDatabase } = await import('./config/database');
          await disconnectDatabase();
          logger.info('Database connection closed');

          process.exit(0);
        } catch (error) {
          logger.error('Error during graceful shutdown:', error);
          process.exit(1);
        }
      });

      // Force shutdown after 30 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 30000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason: any) => {
      logger.error('Unhandled Promise Rejection:', reason);
      gracefulShutdown('unhandledRejection');
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error: Error) => {
      logger.error('Uncaught Exception:', error);
      gracefulShutdown('uncaughtException');
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();
