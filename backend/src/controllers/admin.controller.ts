import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import {
  getAllImportHistory,
  getImportStatistics,
} from '../services/history.service';
import { Lead } from '../models/Lead';
import { User } from '../models/User';
import { ImportHistory } from '../models/ImportHistory';
import { logger } from '../utils/logger';

/**
 * Get admin statistics
 * GET /api/admin/stats
 */
export const getAdminStats = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    logger.info('Fetching admin statistics');

    const [importStats, totalUsers, totalLeads, pendingImports] = await Promise.all([
      getImportStatistics(),
      User.countDocuments({ isActive: true }),
      Lead.countDocuments(),
      ImportHistory.countDocuments({ status: 'pending' }),
    ]);

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [recentImports, recentLeads] = await Promise.all([
      getAllImportHistory({
        limit: 5,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      }),
      Lead.countDocuments({
        createdAt: { $gte: sevenDaysAgo },
      }),
    ]);

    const aiCostEstimates = totalLeads * 0.0015;

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalImports: importStats.totalImports,
        totalLeads,
        successRate: importStats.successRate,
        activeUsers: totalUsers,
        pendingImports,
        processingTimeAvg: importStats.averageProcessingTime,
        aiCostEstimates,
        overview: {
          totalUsers,
          totalLeads,
          totalImports: importStats.totalImports,
          totalSkipped: importStats.totalSkipped,
          successRate: importStats.successRate,
          averageProcessingTime: importStats.averageProcessingTime,
        },
        recentActivity: {
          recentImports: recentImports.data,
          recentLeadsCount: recentLeads,
        },
      },
    });
  }
);

/**
 * Get all imports (admin)
 * GET /api/admin/imports
 */
export const getAllImports = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      status,
    } = req.query;

    const { data, total } = await getAllImportHistory({
      limit: Number(limit),
      skip: (Number(page) - 1) * Number(limit),
      sortBy: String(sortBy),
      sortOrder: sortOrder as 'asc' | 'desc',
      status: status as string | undefined,
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

/**
 * Search and filter leads (admin)
 * GET /api/admin/leads
 */
export const searchLeads = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const {
      page = 1,
      limit = 50,
      search,
      status,
      dataSource,
      country,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    // Build query
    const query: any = {};

    // Text search
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by status
    if (status) {
      query.crm_status = status;
    }

    // Filter by data source
    if (dataSource) {
      query.data_source = dataSource;
    }

    // Filter by country
    if (country) {
      query.country = { $regex: country, $options: 'i' };
    }

    // Filter by date range
    if (startDate || endDate) {
      query.created_at = {};
      if (startDate) {
        query.created_at.$gte = new Date(startDate as string);
      }
      if (endDate) {
        query.created_at.$lte = new Date(endDate as string);
      }
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [leads, total] = await Promise.all([
      Lead.find(query)
        .limit(Number(limit))
        .skip(skip)
        .sort({ [String(sortBy)]: sortOrder === 'asc' ? 1 : -1 })
        .populate('userId', 'name email')
        .populate('importHistoryId', 'filename createdAt'),
      Lead.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: leads,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
      filters: {
        search,
        status,
        dataSource,
        country,
        startDate,
        endDate,
      },
    });
  }
);

/**
 * Get lead by ID (admin)
 * GET /api/admin/leads/:id
 */
export const getLeadById = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const lead = await Lead.findById(id)
      .populate('userId', 'name email')
      .populate('importHistoryId', 'filename originalFilename createdAt');

    if (!lead) {
      throw new AppError('Lead not found', 404);
    }

    res.status(200).json({
      success: true,
      data: lead,
    });
  }
);

/**
 * Export leads to CSV (admin)
 * GET /api/admin/leads/export
 */
export const exportLeads = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { status, dataSource, country, startDate, endDate } = req.query;

    // Build query (same as searchLeads)
    const query: any = {};

    if (status) query.crm_status = status;
    if (dataSource) query.data_source = dataSource;
    if (country) query.country = { $regex: country, $options: 'i' };

    if (startDate || endDate) {
      query.created_at = {};
      if (startDate) query.created_at.$gte = new Date(startDate as string);
      if (endDate) query.created_at.$lte = new Date(endDate as string);
    }

    // Fetch all matching leads (limit to 10000 for safety)
    const leads = await Lead.find(query).limit(10000).lean();

    // Convert to CSV format
    const Papa = await import('papaparse');
    const csv = Papa.unparse(leads);

    // Set response headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="leads-export-${Date.now()}.csv"`
    );

    res.status(200).send(csv);
  }
);

/**
 * Delete lead (admin)
 * DELETE /api/admin/leads/:id
 */
export const deleteLead = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const lead = await Lead.findByIdAndDelete(id);

    if (!lead) {
      throw new AppError('Lead not found', 404);
    }

    logger.info('Lead deleted by admin', {
      leadId: id,
      adminId: req.user?.id,
    });

    res.status(200).json({
      success: true,
      message: 'Lead deleted successfully',
    });
  }
);

/**
 * Get user statistics (admin)
 * GET /api/admin/users/:userId/stats
 */
export const getUserStats = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { userId } = req.params;

    const [user, stats] = await Promise.all([
      User.findById(userId).select('-password'),
      getImportStatistics(userId),
    ]);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.status(200).json({
      success: true,
      data: {
        user,
        statistics: stats,
      },
    });
  }
);

/**
 * Get all platform users
 * GET /api/admin/users
 */
export const getAllUsers = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    logger.info('Fetching all platform users');
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: users,
    });
  }
);
