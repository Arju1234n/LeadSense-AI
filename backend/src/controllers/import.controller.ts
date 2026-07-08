import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { getImportHistoryById, updateImportHistoryStatus, updateImportProgress } from '../services/history.service';
import { parseCSVFast } from '../services/csv/csvParser.service';
import { processBatches, convertErrorsToSkippedRecords } from '../services/ai/batchProcessor.service';
import { mapCRMLeads } from '../services/crm/crmMapper.service';
import { normalizeLeads, deduplicateLeads, prepareLeadsForDB } from '../services/crm/crmNormalizer.service';
import { validateCRMLeads, filterSaveableLeads } from '../services/crm/crmValidator.service';
import { Lead } from '../models/Lead';
import { logger } from '../utils/logger';
import { env } from '../config/env';

/**
 * Process and import CSV data
 * POST /api/import/:importId
 */
export const processImport = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { importId } = req.params;
    const startTime = Date.now();

    logger.info('Starting import process', {
      importId,
      userId: req.user?.id,
    });

    // Fetch import history
    const importHistory = await getImportHistoryById(importId);

    if (!importHistory) {
      throw new AppError('Import not found', 404);
    }

    // Check authorization
    if (
      req.user?.role !== 'admin' &&
      req.user?.email !== 'demo@groweasy.com' &&
      importHistory.userId.toString() !== req.user?.id
    ) {
      throw new AppError('Unauthorized', 403);
    }

    // Block if already running or successfully completed
    if (importHistory.status === 'processing') {
      throw new AppError('Import is already being processed', 400);
    }
    if (importHistory.status === 'completed') {
      throw new AppError('Import has already been completed successfully', 400);
    }
    // Allow 'pending' and 'failed' (retry) imports to proceed

    try {
      // Update status to processing (clears any previous error on retry)
      await updateImportHistoryStatus(importId, 'processing', {
        startedAt: new Date(),
        errorMessage: undefined,
      });

      // Parse full CSV file
      logger.info('Parsing CSV file', { filepath: importHistory.filepath });
      const parseResult = await parseCSVFast(importHistory.filepath, {
        skipEmptyRows: true,
        trimValues: true,
      });

      if (!parseResult.success || parseResult.data.length === 0) {
        throw new AppError('Failed to parse CSV file', 400);
      }

      // Process batches with AI
      logger.info('Processing batches with AI', {
        totalRows: parseResult.data.length,
        batchSize: env.AI_BATCH_SIZE,
      });

      const batchResult = await processBatches(
        parseResult.data,
        parseResult.headers,
        async (successSoFar, skippedSoFar) => {
          // Write incremental progress so the frontend polling sees live updates
          await updateImportProgress(importId, successSoFar, skippedSoFar);
        }
      );

      if (batchResult.results.length === 0) {
        throw new AppError('No leads could be extracted from CSV', 400);
      }

      // Map to CRM schema
      logger.info('Mapping to CRM schema', {
        extractedLeads: batchResult.results.length,
      });
      const mappedLeads = mapCRMLeads(batchResult.results);

      // Normalize leads
      logger.info('Normalizing leads');
      const normalizedLeads = normalizeLeads(mappedLeads);

      // Deduplicate
      logger.info('Deduplicating leads');
      const { unique, duplicates } = deduplicateLeads(normalizedLeads);
      logger.info(`Removed ${duplicates.length} duplicate leads`);

      // Validate leads
      logger.info('Validating leads');
      const { valid, invalid } = validateCRMLeads(unique);

      // Filter saveable leads
      const { saveable } = filterSaveableLeads(valid);

      // Prepare for database
      const leadsForDB = prepareLeadsForDB(saveable);

      // Add import metadata
      const leadsWithMetadata = leadsForDB.map((lead) => ({
        ...lead,
        importHistoryId: importHistory._id,
        userId: importHistory.userId,
      }));

      // Bulk insert into database
      logger.info('Saving leads to database', {
        count: leadsWithMetadata.length,
      });
      const savedLeads = await Lead.insertMany(leadsWithMetadata, {
        ordered: false, // Continue on error
      });

      // Calculate skipped records
      const skippedRecords = [
        ...convertErrorsToSkippedRecords(batchResult.errors),
        ...invalid.map((item, index) => ({
          row: index + 1,
          reason: item.validation.errors.map((e) => e.message).join(', '),
          data: item.lead,
        })),
        ...duplicates.map((lead, index) => ({
          row: index + 1,
          reason: 'Duplicate lead',
          data: lead,
        })),
      ];

      // Calculate processing time
      const processingTime = Date.now() - startTime;

      // Update import history
      await updateImportHistoryStatus(importId, 'completed', {
        successfulRows: savedLeads.length,
        skippedRows: skippedRecords.length,
        skippedRecords: skippedRecords.slice(0, 100), // Store max 100 skipped
        processingTime,
        batchCount: batchResult.totalBatches,
        completedAt: new Date(),
      });

      logger.info('Import completed successfully', {
        importId,
        successfulRows: savedLeads.length,
        skippedRows: skippedRecords.length,
        processingTime,
      });

      res.status(200).json({
        success: true,
        message: 'Import completed successfully',
        data: {
          importId,
          totalRows: parseResult.data.length,
          successfulRows: savedLeads.length,
          skippedRows: skippedRecords.length,
          processingTime,
          aiProvider: env.AI_PROVIDER,
          batchCount: batchResult.totalBatches,
          skippedRecords: skippedRecords.slice(0, 10), // Return first 10
        },
      });
    } catch (error) {
      logger.error('Import failed:', error);

      // Update status to failed
      await updateImportHistoryStatus(importId, 'failed', {
        errorMessage: (error as Error).message,
        completedAt: new Date(),
      });

      throw error;
    }
  }
);

/**
 * Get import status
 * GET /api/import/:importId/status
 */
export const getImportStatus = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { importId } = req.params;

    const importHistory = await getImportHistoryById(importId);

    if (!importHistory) {
      throw new AppError('Import not found', 404);
    }

    // Check authorization
    if (
      req.user?.role !== 'admin' &&
      req.user?.email !== 'demo@groweasy.com' &&
      importHistory.userId.toString() !== req.user?.id
    ) {
      throw new AppError('Unauthorized', 403);
    }

    res.status(200).json({
      success: true,
      data: {
        importId: importHistory.id,
        status: importHistory.status,
        filename: importHistory.originalFilename,
        totalRows: importHistory.totalRows,
        successfulRows: importHistory.successfulRows,
        skippedRows: importHistory.skippedRows,
        processingTime: importHistory.processingTime,
        startedAt: importHistory.startedAt,
        completedAt: importHistory.completedAt,
        errorMessage: importHistory.errorMessage,
      },
    });
  }
);

/**
 * Get import results
 * GET /api/import/:importId/results
 */
export const getImportResults = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { importId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const importHistory = await getImportHistoryById(importId);

    if (!importHistory) {
      throw new AppError('Import not found', 404);
    }

    // Check authorization
    if (
      req.user?.role !== 'admin' &&
      req.user?.email !== 'demo@groweasy.com' &&
      importHistory.userId.toString() !== req.user?.id
    ) {
      throw new AppError('Unauthorized', 403);
    }

    // Fetch leads for this import
    const skip = (Number(page) - 1) * Number(limit);
    const [leads, total] = await Promise.all([
      Lead.find({ importHistoryId: importHistory._id })
        .limit(Number(limit))
        .skip(skip)
        .sort({ createdAt: -1 }),
      Lead.countDocuments({ importHistoryId: importHistory._id }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        importId: importHistory.id,
        import: importHistory,
        leads,
        skippedRecords: importHistory.skippedRecords,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  }
);

/**
 * Get user's import history
 * GET /api/import/history
 */
export const getUserImportHistory = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const { getImportHistoryByUser } = await import('../services/history.service');
    const { data, total } = await getImportHistoryByUser(req.user!.id, {
      limit: Number(limit),
      skip: (Number(page) - 1) * Number(limit),
      sortBy: String(sortBy),
      sortOrder: sortOrder as 'asc' | 'desc',
    });

    res.status(200).json({
      success: true,
      data,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  }
);
