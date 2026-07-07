import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { parseCSVFast } from '../services/csv/csvParser.service';
import { validateCSV, checkCRMCompatibility } from '../services/csv/csvValidator.service';
import { generateEnhancedPreview } from '../services/csv/preview.service';
import { createImportHistory } from '../services/history.service';
import { logger } from '../utils/logger';
import { env } from '../config/env';

/**
 * Upload CSV file and return preview
 * POST /api/csv/upload
 */
export const uploadCSV = asyncHandler(async (req: AuthRequest, res: Response) => {
  // Check if file was uploaded
  if (!req.file) {
    throw new AppError('No file uploaded', 400);
  }

  const { filename, originalname, path: filepath, size } = req.file;

  logger.info('CSV file uploaded', {
    filename,
    originalname,
    size,
    userId: req.user?.id,
  });

  try {
    // Parse CSV file
    const parseResult = await parseCSVFast(filepath, {
      skipEmptyRows: true,
      trimValues: true,
      maxRows: 100, // Preview only first 100 rows
    });

    // Validate CSV
    const validation = validateCSV(parseResult);

    if (!validation.isValid) {
      throw new AppError(
        `CSV validation failed: ${validation.errors.join(', ')}`,
        400
      );
    }

    // Check CRM compatibility
    const compatibility = checkCRMCompatibility(parseResult.headers);

    // Generate preview
    const preview = generateEnhancedPreview(parseResult, 10);

    // Create import history record
    const importHistory = await createImportHistory({
      userId: req.user?.id as any,
      filename,
      originalFilename: originalname,
      filepath,
      filesize: size,
      status: 'pending',
      totalRows: parseResult.totalRows,
      aiProvider: env.AI_PROVIDER,
      aiModel: env.AI_MODEL,
    });

    res.status(200).json({
      success: true,
      message: 'CSV uploaded and validated successfully',
      data: {
        importId: importHistory.id,
        filename: originalname,
        filesize: size,
        totalRows: parseResult.totalRows,
        headers: parseResult.headers,
        preview: preview.rows,
        validation: {
          isValid: validation.isValid,
          warnings: validation.warnings,
        },
        compatibility: {
          compatible: compatibility.compatible,
          suggestions: compatibility.suggestions,
        },
        columnStats: preview.columnStats,
      },
    });
  } catch (error) {
    logger.error('CSV upload processing failed:', error);
    throw error;
  }
});

/**
 * Get CSV row count
 * GET /api/csv/count/:importId
 */
export const getCSVRowCount = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { importId } = req.params;

    // Fetch import history to get filepath
    const { getImportHistoryById } = await import('../services/history.service');
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
        totalRows: importHistory.totalRows,
        filename: importHistory.originalFilename,
      },
    });
  }
);
