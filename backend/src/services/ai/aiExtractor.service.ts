import { getAIClient, aiConfig, getModelName } from '../../config/ai';
import { env } from '../../config/env';
import { logger } from '../../utils/logger';
import { retryWithBackoff } from '../../utils/retry';
import { CRMLead } from '../../types/crm';
import { InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

/**
 * Extract CRM leads from CSV rows using AI
 */
export const extractLeadsWithAI = async (
  csvRows: Record<string, any>[],
  headers: string[],
  prompt: string
): Promise<CRMLead[]> => {
  try {
    logger.info('Starting AI extraction', {
      provider: env.AI_PROVIDER,
      model: getModelName(),
      rows: csvRows.length,
    });

    const response = await retryWithBackoff(
      () => callAIProvider(prompt),
      {
        maxAttempts: aiConfig.retryAttempts,
        delayMs: aiConfig.retryDelayMs,
        backoff: 'exponential',
        onRetry: (attempt, error) => {
          logger.warn(`AI extraction retry attempt ${attempt}`, {
            error: error.message,
          });
        },
      }
    );

    // Parse AI response
    const leads = parseAIResponse(response);

    logger.info('AI extraction completed', {
      extractedLeads: leads.length,
      inputRows: csvRows.length,
    });

    return leads;
  } catch (error) {
    logger.error('AI extraction failed:', error);
    throw new Error(`AI extraction failed: ${(error as Error).message}`);
  }
};

/**
 * Call appropriate AI provider
 */
const callAIProvider = async (prompt: string): Promise<string> => {
  const startTime = Date.now();

  try {
    switch (env.AI_PROVIDER) {
      case 'openai':
        return await callOpenAI(prompt);
      case 'anthropic':
        return await callAnthropic(prompt);
      case 'gemini':
        return await callGemini(prompt);
      case 'bedrock':
        return await callBedrock(prompt);
      default:
        throw new Error(`Unsupported AI provider: ${env.AI_PROVIDER}`);
    }
  } finally {
    const duration = Date.now() - startTime;
    logger.info(`AI call completed in ${duration}ms`, {
      provider: env.AI_PROVIDER,
    });
  }
};

/**
 * Call OpenAI API
 */
const callOpenAI = async (prompt: string): Promise<string> => {
  const client = getAIClient() as any; // OpenAI client

  const response = await client.chat.completions.create({
    model: getModelName(),
    messages: [{ role: 'user', content: prompt }],
    temperature: aiConfig.temperature,
    max_tokens: aiConfig.maxTokens,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('Empty response from OpenAI');
  }

  return content;
};

/**
 * Call Anthropic API
 */
const callAnthropic = async (prompt: string): Promise<string> => {
  const client = getAIClient() as any; // Anthropic client

  const response = await client.messages.create({
    model: getModelName(),
    max_tokens: aiConfig.maxTokens,
    temperature: aiConfig.temperature,
    messages: [{ role: 'user', content: prompt }],
  });

  const content = response.content[0]?.text;
  if (!content) {
    throw new Error('Empty response from Anthropic');
  }

  return content;
};

/**
 * Call Google Gemini API
 */
const callGemini = async (prompt: string): Promise<string> => {
  const client = getAIClient() as any; // Gemini client
  const model = client.getGenerativeModel({ model: getModelName() });

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: aiConfig.temperature,
      maxOutputTokens: aiConfig.maxTokens,
    },
  });

  const response = await result.response;
  const content = response.text();

  if (!content) {
    throw new Error('Empty response from Gemini');
  }

  return content;
};

/**
 * Call Amazon Bedrock API
 */
const callBedrock = async (prompt: string): Promise<string> => {
  const client = getAIClient() as any; // Bedrock client
  const modelId = getModelName();

  // Prepare the request payload based on the model family
  let requestBody: any;

  if (modelId.includes('anthropic.claude')) {
    // Claude models on Bedrock use Anthropic's message format
    requestBody = {
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: aiConfig.maxTokens,
      temperature: aiConfig.temperature,
      messages: [{ role: 'user', content: prompt }],
    };
  } else if (modelId.includes('amazon.nova')) {
    // Amazon Nova models (nova-lite, nova-pro, nova-micro)
    requestBody = {
      messages: [{ role: 'user', content: [{ text: prompt }] }],
      inferenceConfig: {
        max_new_tokens: aiConfig.maxTokens,
        temperature: aiConfig.temperature,
      },
    };
  } else if (modelId.includes('amazon.titan')) {
    // Amazon Titan models
    requestBody = {
      inputText: prompt,
      textGenerationConfig: {
        maxTokenCount: aiConfig.maxTokens,
        temperature: aiConfig.temperature,
        topP: 0.9,
      },
    };
  } else if (modelId.includes('meta.llama')) {
    // Meta Llama models
    requestBody = {
      prompt,
      max_gen_len: aiConfig.maxTokens,
      temperature: aiConfig.temperature,
      top_p: 0.9,
    };
  } else {
    // Default format
    requestBody = {
      prompt,
      max_tokens: aiConfig.maxTokens,
      temperature: aiConfig.temperature,
    };
  }

  // Bearer token is injected by the middleware registered once at client init (see config/ai.ts)
  const command = new InvokeModelCommand({
    modelId,
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify(requestBody),
  });

  const response = await client.send(command);
  const responseBody = JSON.parse(new TextDecoder().decode(response.body));

  let content: string;

  // Extract content based on model response format
  if (modelId.includes('anthropic.claude')) {
    content = responseBody.content?.[0]?.text;
  } else if (modelId.includes('amazon.nova')) {
    // Nova response: { output: { message: { content: [{ text: "..." }] } } }
    content = responseBody.output?.message?.content?.[0]?.text;
  } else if (modelId.includes('amazon.titan')) {
    content = responseBody.results?.[0]?.outputText;
  } else if (modelId.includes('meta.llama')) {
    content = responseBody.generation;
  } else {
    content = responseBody.completion || responseBody.text || responseBody.output;
  }

  if (!content) {
    throw new Error('Empty response from Bedrock');
  }

  return content;
};

/**
 * Parse AI response to extract CRM leads
 */
const parseAIResponse = (response: string): CRMLead[] => {
  try {
    // Remove markdown code blocks if present
    let cleaned = response.trim();
    cleaned = cleaned.replace(/^```json\s*/i, '');
    cleaned = cleaned.replace(/^```\s*/i, '');
    cleaned = cleaned.replace(/```\s*$/i, '');
    cleaned = cleaned.trim();

    // Try to find JSON array in the response
    const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      cleaned = jsonMatch[0];
    }

    // Parse JSON
    const parsed = JSON.parse(cleaned);

    // Ensure it's an array
    if (!Array.isArray(parsed)) {
      // If it's an object with a results/leads/data key, extract that
      if (parsed.results) return parsed.results;
      if (parsed.leads) return parsed.leads;
      if (parsed.data) return parsed.data;
      
      // Single object response, wrap in array
      return [parsed];
    }

    return parsed;
  } catch (error) {
    logger.error('Failed to parse AI response:', {
      error: (error as Error).message,
      response: response.substring(0, 500),
    });
    throw new Error(`Failed to parse AI response: ${(error as Error).message}`);
  }
};

/**
 * Validate AI extracted leads
 */
export const validateAIExtraction = (leads: any[]): {
  valid: CRMLead[];
  invalid: any[];
} => {
  const valid: CRMLead[] = [];
  const invalid: any[] = [];

  leads.forEach((lead, index) => {
    try {
      // Basic validation
      if (!lead.name) {
        invalid.push({ index, reason: 'Missing name', data: lead });
        return;
      }

      if (!lead.email && !lead.mobile_without_country_code) {
        invalid.push({
          index,
          reason: 'Missing both email and mobile',
          data: lead,
        });
        return;
      }

      // Convert date strings to Date objects
      if (lead.created_at) {
        lead.created_at = new Date(lead.created_at);
      } else {
        lead.created_at = new Date();
      }

      if (lead.possession_time) {
        lead.possession_time = new Date(lead.possession_time);
      }

      valid.push(lead as CRMLead);
    } catch (error) {
      invalid.push({
        index,
        reason: (error as Error).message,
        data: lead,
      });
    }
  });

  logger.info('AI extraction validation completed', {
    total: leads.length,
    valid: valid.length,
    invalid: invalid.length,
  });

  return { valid, invalid };
};

/**
 * Calculate AI usage cost (approximate)
 */
export const calculateAICost = (
  provider: string,
  inputTokens: number,
  outputTokens: number
): number => {
  // Approximate costs per 1K tokens (as of 2024)
  const costs: Record<string, { input: number; output: number }> = {
    openai: { input: 0.0001, output: 0.0002 }, // gpt-4o-mini
    anthropic: { input: 0.0003, output: 0.0015 }, // claude-3-5-sonnet
    gemini: { input: 0.00005, output: 0.00015 }, // gemini-1.5-flash
    bedrock: { input: 0.0003, output: 0.0015 }, // claude on bedrock
  };

  const providerCost = costs[provider] || costs.openai;
  const inputCost = (inputTokens / 1000) * providerCost.input;
  const outputCost = (outputTokens / 1000) * providerCost.output;

  return inputCost + outputCost;
};
