import { ImportHistory, IImportHistory } from '../models/ImportHistory';
import { logger } from '../utils/logger';
import mongoose from 'mongoose';

/**
 * Create import history record
 */
export const createImportHistory = async (
  data: Partial<IImportHistory>
): Promise<IImportHistory> => {
  try {
    const importHistory = new ImportHistory(data);
    await importHistory.save();

    logger.info('Import history created', {
      id: importHistory.id,
      filename: importHistory.filename,
    });

    return importHistory;
  } catch (error) {
    logger.error('Failed to create import history:', error);
    throw error;
  }
};

/**
 * Update import history status
 */
export const updateImportHistoryStatus = async (
  id: string,
  status: 'pending' | 'processing' | 'completed' | 'failed',
  additionalData?: Partial<IImportHistory>
): Promise<IImportHistory | null> => {
  try {
    // Separate defined fields ($set) from explicitly-undefined fields ($unset)
    const setFields: any = { status };
    const unsetFields: any = {};

    if (additionalData) {
      for (const [key, value] of Object.entries(additionalData)) {
        if (value === undefined) {
          unsetFields[key] = '';
        } else {
          setFields[key] = value;
        }
      }
    }

    if (status === 'processing') {
      setFields.startedAt = new Date();
    } else if (status === 'completed' || status === 'failed') {
      setFields.completedAt = new Date();
    }

    const mongoUpdate: any = { $set: setFields };
    if (Object.keys(unsetFields).length > 0) {
      mongoUpdate.$unset = unsetFields;
    }

    const importHistory = await ImportHistory.findByIdAndUpdate(
      id,
      mongoUpdate,
      { new: true }
    );

    if (importHistory) {
      logger.info('Import history updated', {
        id: importHistory.id,
        status: importHistory.status,
      });
    }

    return importHistory;
  } catch (error) {
    logger.error('Failed to update import history:', error);
    throw error;
  }
};

/**
 * Update only successfulRows / skippedRows during active processing.
 * Does NOT touch startedAt or any other status field.
 */
export const updateImportProgress = async (
  id: string,
  successfulRows: number,
  skippedRows: number
): Promise<void> => {
  try {
    await ImportHistory.findByIdAndUpdate(id, {
      $set: { successfulRows, skippedRows },
    });
  } catch (error) {
    // Non-fatal — processing continues even if progress write fails
    logger.warn('Failed to update import progress (non-fatal):', error);
  }
};

/**
 * Get import history by ID
 */
export const getImportHistoryById = async (
  id: string
): Promise<IImportHistory | null> => {
  try {
    const importHistory = await ImportHistory.findById(id).populate(
      'userId',
      'name email'
    );
    return importHistory;
  } catch (error) {
    logger.error('Failed to get import history:', error);
    throw error;
  }
};

/**
 * Get import history by user
 */
export const getImportHistoryByUser = async (
  userId: string,
  options: {
    limit?: number;
    skip?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}
): Promise<{ data: IImportHistory[]; total: number }> => {
  try {
    const {
      limit = 10,
      skip = 0,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = options;

    const query = { userId: new mongoose.Types.ObjectId(userId) };

    const [data, total] = await Promise.all([
      ImportHistory.find(query)
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
        .limit(limit)
        .skip(skip)
        .populate('userId', 'name email'),
      ImportHistory.countDocuments(query),
    ]);

    return { data, total };
  } catch (error) {
    logger.error('Failed to get import history by user:', error);
    throw error;
  }
};

/**
 * Get all import history (admin)
 */
export const getAllImportHistory = async (options: {
  limit?: number;
  skip?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: string;
} = {}): Promise<{ data: IImportHistory[]; total: number }> => {
  try {
    const {
      limit = 10,
      skip = 0,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      status,
    } = options;

    const query: any = {};
    if (status) {
      query.status = status;
    }

    const [data, total] = await Promise.all([
      ImportHistory.find(query)
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
        .limit(limit)
        .skip(skip)
        .populate('userId', 'name email'),
      ImportHistory.countDocuments(query),
    ]);

    return { data, total };
  } catch (error) {
    logger.error('Failed to get all import history:', error);
    throw error;
  }
};

/**
 * Get import statistics
 */
export const getImportStatistics = async (
  userId?: string
): Promise<{
  totalImports: number;
  totalLeads: number;
  totalSkipped: number;
  averageProcessingTime: number;
  successRate: number;
}> => {
  try {
    const query: any = {};
    if (userId) {
      query.userId = new mongoose.Types.ObjectId(userId);
    }

    const stats = await ImportHistory.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalImports: { $sum: 1 },
          totalLeads: { $sum: '$successfulRows' },
          totalSkipped: { $sum: '$skippedRows' },
          totalProcessingTime: { $sum: '$processingTime' },
          completedImports: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
          },
        },
      },
    ]);

    if (!stats || stats.length === 0) {
      return {
        totalImports: 0,
        totalLeads: 0,
        totalSkipped: 0,
        averageProcessingTime: 0,
        successRate: 0,
      };
    }

    const result = stats[0];
    const averageProcessingTime =
      result.totalImports > 0
        ? Math.round(result.totalProcessingTime / result.totalImports)
        : 0;
    const successRate =
      result.totalImports > 0
        ? Math.round((result.completedImports / result.totalImports) * 100)
        : 0;

    return {
      totalImports: result.totalImports,
      totalLeads: result.totalLeads,
      totalSkipped: result.totalSkipped,
      averageProcessingTime,
      successRate,
    };
  } catch (error) {
    logger.error('Failed to get import statistics:', error);
    throw error;
  }
};

/**
 * Delete old import history (cleanup)
 */
export const deleteOldImportHistory = async (
  daysOld: number = 30
): Promise<number> => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await ImportHistory.deleteMany({
      createdAt: { $lt: cutoffDate },
      status: { $in: ['completed', 'failed'] },
    });

    logger.info(`Deleted ${result.deletedCount} old import history records`);

    return result.deletedCount || 0;
  } catch (error) {
    logger.error('Failed to delete old import history:', error);
    throw error;
  }
};
