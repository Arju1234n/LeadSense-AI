import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

const DEFAULT_CORS_ORIGIN =
  'http://localhost:3000,http://localhost:3001,http://localhost:3002,https://leadsense-ai-frontend.onrender.com,https://leadsense-ai-admin.onrender.com';

// Environment variable schema - Multi-Provider AI Support
const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('5000'),

  // Database
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),

  // JWT
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),

  // AI Provider Selection
  AI_PROVIDER: z.enum(['openai', 'anthropic', 'gemini', 'bedrock']).default('bedrock'),

  // Provider API Keys (only the selected provider's key is required)
  OPENAI_API_KEY: z.string().optional().default(''),
  ANTHROPIC_API_KEY: z.string().optional().default(''),
  GOOGLE_AI_API_KEY: z.string().optional().default(''),
  BEDROCK_API_KEY: z.string().optional().default(''),
  AWS_REGION: z.string().default('us-east-1'),

  // AI Model Configuration
  AI_MODEL: z.string().default('us.anthropic.claude-3-5-sonnet-20241022-v2:0'),
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
  CORS_ORIGIN: z.string().default(DEFAULT_CORS_ORIGIN),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'), // 15 min
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),

  // Auth Bypass (development only)
  SKIP_AUTH: z.string().transform((val) => val === 'true').default('false'),
});

// Validate and parse environment variables
const parseEnv = () => {
  try {
    const parsed = envSchema.parse(process.env);

    // Validate that the selected AI provider's API key is present
    const providerKeyMap: Record<string, { key: string; envVar: string }> = {
      openai: { key: parsed.OPENAI_API_KEY, envVar: 'OPENAI_API_KEY' },
      anthropic: { key: parsed.ANTHROPIC_API_KEY, envVar: 'ANTHROPIC_API_KEY' },
      gemini: { key: parsed.GOOGLE_AI_API_KEY, envVar: 'GOOGLE_AI_API_KEY' },
      bedrock: { key: parsed.BEDROCK_API_KEY, envVar: 'BEDROCK_API_KEY' },
    };

    const selected = providerKeyMap[parsed.AI_PROVIDER];
    if (selected && !selected.key) {
      throw new Error(
        `${selected.envVar} is required when AI_PROVIDER is set to '${parsed.AI_PROVIDER}'`
      );
    }

    // Validate Bedrock API key format if using Bedrock
    if (
      parsed.AI_PROVIDER === 'bedrock' &&
      parsed.BEDROCK_API_KEY &&
      !parsed.BEDROCK_API_KEY.startsWith('ABSK') &&
      !parsed.BEDROCK_API_KEY.startsWith('sk-')
    ) {
      console.warn('⚠️  BEDROCK_API_KEY format may be incorrect. Expected Base64-encoded bearer token.');
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
