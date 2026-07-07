import { logger } from './logger';

export interface RetryOptions {
  maxAttempts: number;
  delayMs: number;
  backoff?: 'linear' | 'exponential';
  onRetry?: (attempt: number, error: Error) => void;
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions
): Promise<T> {
  const {
    maxAttempts,
    delayMs,
    backoff = 'exponential',
    onRetry,
  } = options;

  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxAttempts) {
        logger.error(`Max retry attempts (${maxAttempts}) reached`, {
          error: lastError.message,
        });
        throw lastError;
      }

      // Calculate delay based on backoff strategy
      const delay =
        backoff === 'exponential'
          ? delayMs * Math.pow(2, attempt - 1)
          : delayMs * attempt;

      logger.warn(`Attempt ${attempt} failed, retrying in ${delay}ms`, {
        error: lastError.message,
      });

      // Call onRetry callback if provided
      if (onRetry) {
        onRetry(attempt, lastError);
      }

      // Wait before retrying
      await sleep(delay);
    }
  }

  throw lastError;
}

/**
 * Sleep utility
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Retry with custom condition
 */
export async function retryWithCondition<T>(
  fn: () => Promise<T>,
  shouldRetry: (error: Error) => boolean,
  options: RetryOptions
): Promise<T> {
  const { maxAttempts, delayMs, backoff = 'exponential', onRetry } = options;

  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Check if we should retry this error
      if (!shouldRetry(lastError)) {
        logger.error('Error is not retryable', { error: lastError.message });
        throw lastError;
      }

      if (attempt === maxAttempts) {
        logger.error(`Max retry attempts (${maxAttempts}) reached`, {
          error: lastError.message,
        });
        throw lastError;
      }

      const delay =
        backoff === 'exponential'
          ? delayMs * Math.pow(2, attempt - 1)
          : delayMs * attempt;

      logger.warn(`Attempt ${attempt} failed, retrying in ${delay}ms`, {
        error: lastError.message,
      });

      if (onRetry) {
        onRetry(attempt, lastError);
      }

      await sleep(delay);
    }
  }

  throw lastError;
}

/**
 * Batch retry - retry failed items from a batch
 */
export async function batchRetry<T, R>(
  items: T[],
  processFn: (item: T) => Promise<R>,
  options: RetryOptions
): Promise<{ results: R[]; failed: T[] }> {
  const results: R[] = [];
  const failed: T[] = [];

  for (const item of items) {
    try {
      const result = await retryWithBackoff(
        () => processFn(item),
        options
      );
      results.push(result);
    } catch (error) {
      logger.error('Item failed after all retries', { error, item });
      failed.push(item);
    }
  }

  return { results, failed };
}
