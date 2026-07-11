/**
 * ==============================================================================
 * Database Configuration - MongoDB Connection Manager
 * ==============================================================================
 * Production-grade MongoDB connection with:
 * - Automatic reconnection
 * - Connection pooling
 * - Health monitoring
 * - Graceful shutdown
 * - Default admin seeding
 * ==============================================================================
 */

import mongoose, { ConnectOptions } from 'mongoose';
import { logger } from '../utils/logger';
import { env } from './env';

// Connection state tracking
let isConnected = false;
let connectionAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAY_MS = 5000;

/**
 * MongoDB Connection Options
 * Optimized for production performance and reliability
 */
const getMongooseOptions = (): ConnectOptions => ({
  // Connection Pool Configuration
  maxPoolSize: env.NODE_ENV === 'production' ? 50 : 10,
  minPoolSize: env.NODE_ENV === 'production' ? 10 : 5,
  
  // Timeout Configuration
  socketTimeoutMS: 45000,
  serverSelectionTimeoutMS: 10000,
  connectTimeoutMS: 10000,
  
  // Network Configuration
  family: 4, // Force IPv4 to avoid IPv6 issues
  
  // Automatic Index Management
  autoIndex: env.NODE_ENV !== 'production', // Disable in production for performance
  
  // Write Concern
  retryWrites: true,
});

/**
 * Connect to MongoDB with retry logic
 */
export const connectDatabase = async (): Promise<void> => {
  try {
    // Prevent multiple connections
    if (isConnected && mongoose.connection.readyState === 1) {
      logger.info('MongoDB already connected');
      return;
    }

    const mongoUri = env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    // Mask sensitive info in logs
    const maskedUri = mongoUri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
    logger.info('Connecting to MongoDB...', { uri: maskedUri });

    const options = getMongooseOptions();
    await mongoose.connect(mongoUri, options);

    isConnected = true;
    connectionAttempts = 0;

    logger.info('✅ MongoDB connected successfully', {
      host: mongoose.connection.host,
      database: mongoose.connection.name,
      poolSize: options.maxPoolSize,
      environment: env.NODE_ENV,
    });

    // Setup connection event listeners
    setupConnectionListeners();

    // Seed default data
    await seedDefaultData();

  } catch (error) {
    isConnected = false;
    connectionAttempts++;
    
    logger.error('❌ Failed to connect to MongoDB:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      attempt: connectionAttempts,
      maxAttempts: MAX_RECONNECT_ATTEMPTS,
    });

    // Retry connection if not exceeded max attempts
    if (connectionAttempts < MAX_RECONNECT_ATTEMPTS) {
      logger.info(`Retrying connection in ${RECONNECT_DELAY_MS / 1000}s...`);
      await new Promise(resolve => setTimeout(resolve, RECONNECT_DELAY_MS));
      return connectDatabase();
    }

    throw new Error(`Failed to connect to MongoDB after ${connectionAttempts} attempts`);
  }
};

/**
 * Setup MongoDB connection event listeners
 */
const setupConnectionListeners = () => {
  // Connection Error
  mongoose.connection.on('error', (error) => {
    isConnected = false;
    logger.error('MongoDB connection error:', {
      error: error.message,
      code: (error as any).code,
    });
  });

  // Disconnected
  mongoose.connection.on('disconnected', () => {
    isConnected = false;
    logger.warn('⚠️  MongoDB disconnected');
    
    // Attempt reconnection in development
    if (env.NODE_ENV === 'development') {
      logger.info('Attempting to reconnect...');
      setTimeout(() => {
        if (!isConnected) {
          connectDatabase().catch(err => {
            logger.error('Reconnection failed:', err);
          });
        }
      }, RECONNECT_DELAY_MS);
    }
  });

  // Reconnected
  mongoose.connection.on('reconnected', () => {
    isConnected = true;
    connectionAttempts = 0;
    logger.info('✅ MongoDB reconnected successfully');
  });

  // Connection Timeout
  mongoose.connection.on('timeout', () => {
    logger.warn('MongoDB connection timeout');
  });

  // Connection Close
  mongoose.connection.on('close', () => {
    isConnected = false;
    logger.info('MongoDB connection closed');
  });
};

/**
 * Seed default data for development and testing
 */
const seedDefaultData = async (): Promise<void> => {
  try {
    const { User } = await import('../models/User');
    
    const existingAdmin = await User.findOne({ email: 'admin@groweasy.com' });
    
    if (!existingAdmin) {
      const defaultAdmin = await User.create({
        name: 'Demo Admin',
        email: 'admin@groweasy.com',
        password: 'password123', // Will be hashed by pre-save hook
        role: 'admin',
        isActive: true,
      });
      
      logger.info('🌱 Default admin user seeded', {
        email: defaultAdmin.email,
        password: 'password123',
        warning: '⚠️  Change password in production!',
      });
    }

    // Seed default user if none exists
    const existingUser = await User.findOne({ email: 'user@groweasy.com' });
    if (!existingUser) {
      const defaultUser = await User.create({
        name: 'Demo User',
        email: 'user@groweasy.com',
        password: 'password123',
        role: 'user',
        isActive: true,
      });
      
      logger.info('🌱 Default user seeded', {
        email: defaultUser.email,
        password: 'password123',
      });
    }
    
  } catch (error) {
    logger.error('Failed to seed default data:', error);
    // Don't throw - seeding failure shouldn't prevent app startup
  }
};

/**
 * Disconnect from MongoDB
 */
export const disconnectDatabase = async (): Promise<void> => {
  try {
    if (!isConnected) {
      logger.info('MongoDB already disconnected');
      return;
    }

    await mongoose.connection.close();
    isConnected = false;
    
    logger.info('MongoDB connection closed gracefully');
  } catch (error) {
    logger.error('Error closing MongoDB connection:', error);
    throw error;
  }
};

/**
 * Get database connection status
 */
export const getDatabaseStatus = () => ({
  connected: isConnected,
  readyState: mongoose.connection.readyState,
  readyStateText: getReadyStateText(mongoose.connection.readyState),
  host: mongoose.connection.host,
  database: mongoose.connection.name,
  collections: mongoose.connection.collections ? Object.keys(mongoose.connection.collections).length : 0,
});

/**
 * Convert mongoose ready state to human-readable text
 */
const getReadyStateText = (state: number): string => {
  const states: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
    99: 'uninitialized',
  };
  return states[state] || 'unknown';
};

/**
 * Database health check
 */
export const checkDatabaseHealth = async (): Promise<{
  healthy: boolean;
  latency: number;
  status: string;
}> => {
  const startTime = Date.now();
  
  try {
    if (!isConnected || mongoose.connection.readyState !== 1) {
      return {
        healthy: false,
        latency: Date.now() - startTime,
        status: 'disconnected',
      };
    }

    // Ping the database
    if (mongoose.connection.db) {
      await mongoose.connection.db.admin().ping();
    } else {
      throw new Error('Database connection not initialized');
    }
    
    return {
      healthy: true,
      latency: Date.now() - startTime,
      status: 'connected',
    };
  } catch (error) {
    logger.error('Database health check failed:', error);
    return {
      healthy: false,
      latency: Date.now() - startTime,
      status: 'error',
    };
  }
};

/**
 * Setup graceful shutdown handlers
 */
export const setupGracefulShutdown = (): void => {
  const shutdownHandler = async (signal: string) => {
    logger.info(`${signal} received. Closing MongoDB connection...`);
    
    try {
      await disconnectDatabase();
      logger.info('MongoDB connection closed. Exiting process...');
      process.exit(0);
    } catch (error) {
      logger.error('Error during graceful shutdown:', error);
      process.exit(1);
    }
  };

  // Handle process termination signals
  process.on('SIGINT', () => shutdownHandler('SIGINT'));
  process.on('SIGTERM', () => shutdownHandler('SIGTERM'));
  
  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    shutdownHandler('UNCAUGHT_EXCEPTION');
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection:', { reason, promise });
  });
};

/**
 * Clear database (use with caution - primarily for testing)
 */
export const clearDatabase = async (): Promise<void> => {
  if (env.NODE_ENV === 'production') {
    throw new Error('Cannot clear database in production!');
  }

  try {
    const collections = mongoose.connection.collections;
    
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
    
    logger.info('Database cleared successfully');
  } catch (error) {
    logger.error('Failed to clear database:', error);
    throw error;
  }
};
