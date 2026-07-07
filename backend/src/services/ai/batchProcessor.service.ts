import { logger } from '../../utils/logger';
import { aiConfig } from '../../config/ai';
import { extractLeadsWithAI, validateAIExtraction } from './aiExtractor.service';
import { buildBatchExtractionPrompt } from './promptBuilder.service';
import { CRMLead, SkippedRecord } from '../../types/crm';
import { BatchProcessingResult, BatchProcessingError } from '../../types/csv';

/**
 * Process CSV rows in batches using AI
 */
export const processBatches = async (
  csvRows: Record<string, any>[],
  headers: string[]
): Promise<BatchProcessingResult<CRMLead>> => {
  const batchSize = aiConfig.batchSize;
  const totalBatches = Math.ceil(csvRows.length / batchSize);

  logger.info('Starting batch processing', {
    totalRows: csvRows.length,
    batchSize,
    totalBatches,
  });

  const results: CRMLead[] = [];
  const errors: BatchProcessingError[] = [];
  let processedBatches = 0;
  let failedBatches = 0;

  // Process each batch
  for (let i = 0; i < totalBatches; i++) {
    const batchNumber = i + 1;
    const start = i * batchSize;
    const end = Math.min(start + batchSize, csvRows.length);
    const batchRows = csvRows.slice(start, end);

    logger.info(`Processing batch ${batchNumber}/${totalBatches}`, {
      rows: batchRows.length,
    });

    try {
      // Build prompt for this batch
      const prompt = buildBatchExtractionPrompt(
        batchRows,
        headers,
        batchNumber,
        totalBatches
      );

      // Extract leads using AI
      const extractedLeads = await extractLeadsWithAI(batchRows, headers, prompt);

      // Validate extracted leads
      const { valid, invalid } = validateAIExtraction(extractedLeads);

      results.push(...valid);

      if (invalid.length > 0) {
        logger.warn(`Batch ${batchNumber} had ${invalid.length} invalid leads`, {
          invalid: invalid.slice(0, 3), // Log first 3
        });

        errors.push({
          batchNumber,
          error: `${invalid.length} invalid leads`,
          data: invalid,
        });
      }

      processedBatches++;

      logger.info(`Batch ${batchNumber} completed`, {
        extracted: valid.length,
        invalid: invalid.length,
      });
    } catch (error) {
      failedBatches++;
      logger.error(`Batch ${batchNumber} failed:`, error);

      errors.push({
        batchNumber,
        error: (error as Error).message,
        data: batchRows,
      });
    }

    // Add a small delay between batches to avoid rate limiting
    if (i < totalBatches - 1) {
      await sleep(500);
    }
  }

  const result: BatchProcessingResult<CRMLead> = {
    success: failedBatches === 0,
    totalBatches,
    processedBatches,
    failedBatches,
    results,
    errors,
  };

  logger.info('Batch processing completed', {
    totalBatches,
    processedBatches,
    failedBatches,
    totalLeads: results.length,
  });

  return result;
};

/**
 * Retry failed batches
 */
export const retryFailedBatches = async (
  errors: BatchProcessingError[],
  headers: string[]
): Promise<BatchProcessingResult<CRMLead>> => {
  logger.info('Retrying failed batches', {
    failedBatches: errors.length,
  });

  const results: CRMLead[] = [];
  const newErrors: BatchProcessingError[] = [];
  let processedBatches = 0;

  for (const error of errors) {
    try {
      const batchRows = error.data as Record<string, any>[];
      const prompt = buildBatchExtractionPrompt(
        batchRows,
        headers,
        error.batchNumber,
        errors.length
      );

      const extractedLeads = await extractLeadsWithAI(batchRows, headers, prompt);
      const { valid } = validateAIExtraction(extractedLeads);

      results.push(...valid);
      processedBatches++;

      logger.info(`Retry batch ${error.batchNumber} succeeded`, {
        extracted: valid.length,
      });
    } catch (retryError) {
      logger.error(`Retry batch ${error.batchNumber} failed:`, retryError);
      newErrors.push(error);
    }
  }

  return {
    success: newErrors.length === 0,
    totalBatches: errors.length,
    processedBatches,
    failedBatches: newErrors.length,
    results,
    errors: newErrors,
  };
};

/**
 * Convert batch errors to skipped records
 */
export const convertErrorsToSkippedRecords = (
  errors: BatchProcessingError[]
): SkippedRecord[] => {
  const skippedRecords: SkippedRecord[] = [];

  errors.forEach((error) => {
    if (Array.isArray(error.data)) {
      error.data.forEach((row: any, index: number) => {
        skippedRecords.push({
          row: (error.batchNumber - 1) * aiConfig.batchSize + index + 1,
          reason: error.error,
          data: row,
        });
      });
    }
  });

  return skippedRecords;
};

/**
 * Sleep utility
 */
const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
