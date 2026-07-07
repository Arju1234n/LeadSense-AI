import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { BedrockRuntimeClient } from '@aws-sdk/client-bedrock-runtime';
import { NodeHttpHandler } from '@smithy/node-http-handler';
import { env } from './env';
import { logger } from '../utils/logger';

export interface AIConfig {
  provider: 'openai' | 'anthropic' | 'gemini' | 'bedrock';
  model: string;
  temperature: number;
  maxTokens: number;
  batchSize: number;
  retryAttempts: number;
  retryDelayMs: number;
}

export const aiConfig: AIConfig = {
  provider: env.AI_PROVIDER,
  model: env.AI_MODEL,
  temperature: env.AI_TEMPERATURE,
  maxTokens: env.AI_MAX_TOKENS,
  batchSize: env.AI_BATCH_SIZE,
  retryAttempts: env.AI_RETRY_ATTEMPTS,
  retryDelayMs: env.AI_RETRY_DELAY_MS,
};

// Initialize AI clients based on provider
let openaiClient: OpenAI | null = null;
let anthropicClient: Anthropic | null = null;
let geminiClient: GoogleGenerativeAI | null = null;
let bedrockClient: BedrockRuntimeClient | null = null;

export const initializeAIClient = () => {
  try {
    switch (env.AI_PROVIDER) {
      case 'openai':
        if (!env.OPENAI_API_KEY) {
          throw new Error('OPENAI_API_KEY is not configured');
        }
        const isOpenRouter = env.OPENAI_API_KEY.startsWith('sk-or-v1-');
        openaiClient = new OpenAI({
          apiKey: env.OPENAI_API_KEY,
          ...(isOpenRouter && {
            baseURL: 'https://openrouter.ai/api/v1',
            defaultHeaders: {
              'HTTP-Referer': 'https://groweasy.com',
              'X-Title': 'GrowEasy Importer',
            },
          }),
        });
        logger.info(`OpenAI client initialized successfully${isOpenRouter ? ' (using OpenRouter)' : ''}`);
        break;

      case 'anthropic':
        if (!env.ANTHROPIC_API_KEY) {
          throw new Error('ANTHROPIC_API_KEY is not configured');
        }
        anthropicClient = new Anthropic({
          apiKey: env.ANTHROPIC_API_KEY,
        });
        logger.info('Anthropic client initialized successfully');
        break;

      case 'gemini':
        if (!env.GOOGLE_AI_API_KEY) {
          throw new Error('GOOGLE_AI_API_KEY is not configured');
        }
        geminiClient = new GoogleGenerativeAI(env.GOOGLE_AI_API_KEY);
        logger.info('Google Gemini client initialized successfully');
        break;

      case 'bedrock':
        if (!env.BEDROCK_API_KEY) {
          throw new Error('BEDROCK_API_KEY is not configured');
        }

        // Bedrock long-term API keys are bearer tokens.
        // - Placeholder credentials prevent the SDK credential-chain error.
        // - NodeHttpHandler forces HTTP/1.1 so headers can be safely overridden
        //   (HTTP/2 forbids multiple values for the same pseudo-header).
        // - The 'low' priority middleware runs AFTER SigV4 signing (innermost),
        //   removes the SigV4 Authorization header, and injects the Bearer token.
        bedrockClient = new BedrockRuntimeClient({
          region: env.AWS_REGION,
          credentials: {
            accessKeyId: 'placeholder',
            secretAccessKey: 'placeholder',
          },
          requestHandler: new NodeHttpHandler(),
        });

        bedrockClient.middlewareStack.add(
          (next: any) => async (args: any) => {
            // Remove any SigV4-generated authorization header (case-insensitive)
            delete args.request.headers['Authorization'];
            delete args.request.headers['authorization'];
            // Inject the Bedrock long-term API key as a Bearer token
            args.request.headers['Authorization'] = `Bearer ${env.BEDROCK_API_KEY}`;
            return next(args);
          },
          {
            step: 'finalizeRequest',
            name: 'addBearerToken',
            priority: 'low',
          }
        );

        logger.info('Amazon Bedrock client initialized successfully', {
          region: env.AWS_REGION,
          authMethod: 'bearer-token',
        });
        break;

      default:
        throw new Error(`Unsupported AI provider: ${env.AI_PROVIDER}`);
    }
  } catch (error) {
    logger.error('Failed to initialize AI client:', error);
    throw error;
  }
};

export const getAIClient = () => {
  switch (env.AI_PROVIDER) {
    case 'openai':
      if (!openaiClient) {
        throw new Error('OpenAI client not initialized');
      }
      return openaiClient;

    case 'anthropic':
      if (!anthropicClient) {
        throw new Error('Anthropic client not initialized');
      }
      return anthropicClient;

    case 'gemini':
      if (!geminiClient) {
        throw new Error('Gemini client not initialized');
      }
      return geminiClient;

    case 'bedrock':
      if (!bedrockClient) {
        throw new Error('Bedrock client not initialized');
      }
      return bedrockClient;

    default:
      throw new Error(`Unsupported AI provider: ${env.AI_PROVIDER}`);
  }
};

// Helper to get model name based on provider
export const getModelName = (): string => {
  const modelMap: Record<string, string> = {
    openai: env.AI_MODEL || 'gpt-4o-mini',
    anthropic: env.AI_MODEL || 'claude-3-5-sonnet-20241022',
    gemini: env.AI_MODEL || 'gemini-1.5-flash',
    bedrock: env.AI_MODEL || 'us.anthropic.claude-3-5-sonnet-20241022-v2:0',
  };

  return modelMap[env.AI_PROVIDER] || env.AI_MODEL;
};
