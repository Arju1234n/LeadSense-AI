import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

// Environment variable schema
const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('5000'),

  // Database
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),

  // JWT
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),

  // AI Provider
  AI_PROVIDER: z.enum(['openai', 'anthropic', 'gemini', 'bedrock']).default('openai'),
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  GOOGLE_AI_API_KEY: z.string().optional(),
  BEDROCK_API_KEY: z.string().optional(),
  AWS_REGION: z.string().default('us-east-1'),

  // AI Configuration
  AI_MODEL: z.string().default('gpt-4o-mini'),
  AI_TEMPERATURE: z.string().transform(Number).default('0'),
  AI_MAX_TOKENS: z.string().transform(Number).default('4000'),
  AI_BATCH_SIZE: z.string().transform(Number).default('10'),
  AI_RETRY_ATTEMPTS: z.string().transform(Number).default('3'),
  AI_RETRY_DELAY_MS: z.string().transform(Number).default('1000'),

  // File Upload
  MAX_FILE_SIZE: z.string().transform(Number).default('10485760'), // 10MB
  UPLOAD_DIR: z.string().default('uploads'),
  ALLOWED_FILE_TYPES: z.string().default('.csv'),

  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:3000,http://localhost:3001'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'), // 15 min
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),

  // Auth Bypass
  SKIP_AUTH: z.string().transform((val) => val === 'true').default('false'),
});

// Validate and parse environment variables
const parseEnv = () => {
  try {
    const parsed = envSchema.parse(process.env);

    // Validate AI provider API key
    if (parsed.AI_PROVIDER === 'openai' && !parsed.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is required when AI_PROVIDER is openai');
    }
    if (parsed.AI_PROVIDER === 'anthropic' && !parsed.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is required when AI_PROVIDER is anthropic');
    }
    if (parsed.AI_PROVIDER === 'gemini' && !parsed.GOOGLE_AI_API_KEY) {
      throw new Error('GOOGLE_AI_API_KEY is required when AI_PROVIDER is gemini');
    }
    if (parsed.AI_PROVIDER === 'bedrock' && !parsed.BEDROCK_API_KEY) {
      throw new Error('BEDROCK_API_KEY is required when AI_PROVIDER is bedrock');
    }

    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
      throw new Error(
        `Environment variable validation failed:\n${missingVars.join('\n')}`
      );
    }
    throw error;
  }
};

// Export validated environment config
export const env = parseEnv();

export type Environment = z.infer<typeof envSchema>;
