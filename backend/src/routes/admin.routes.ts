import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  getAdminStats,
  getAllImports,
  searchLeads,
  getLeadById,
  exportLeads,
  deleteLead,
  getUserStats,
  getAllUsers,
} from '../controllers/admin.controller';

const router = Router();

// All admin routes require authentication and admin/user role
router.use(authenticate, authorize('admin', 'user'));

/**
 * @route   GET /api/admin/users
 * @desc    Get all users list
 * @access  Admin
 */
router.get('/users', getAllUsers);

/**
 * @route   GET /api/admin/stats
 * @desc    Get admin dashboard statistics
 * @access  Admin
 */
router.get('/stats', getAdminStats);

/**
 * @route   GET /api/admin/imports
 * @desc    Get all imports with pagination and filtering
 * @access  Admin
 */
router.get('/imports', getAllImports);

/**
 * @route   GET /api/admin/leads
 * @desc    Search and filter leads
 * @access  Admin
 */
router.get('/leads', searchLeads);

/**
 * @route   GET /api/admin/leads/export
 * @desc    Export leads to CSV
 * @access  Admin
 */
router.get('/leads/export', exportLeads);

/**
 * @route   GET /api/admin/leads/:id
 * @desc    Get lead by ID
 * @access  Admin
 */
router.get('/leads/:id', getLeadById);

/**
 * @route   DELETE /api/admin/leads/:id
 * @desc    Delete lead
 * @access  Admin
 */
router.delete('/leads/:id', deleteLead);

/**
 * @route   GET /api/admin/users/:userId/stats
 * @desc    Get user statistics
 * @access  Admin
 */
router.get('/users/:userId/stats', getUserStats);

export default router;
