import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  processImport,
  getImportStatus,
  getImportResults,
  getUserImportHistory,
} from '../controllers/import.controller';

const router = Router();

/**
 * @route   POST /api/import/:importId
 * @desc    Process and import CSV data
 * @access  Private
 */
router.post('/:importId', authenticate, processImport);

/**
 * @route   GET /api/import/:importId/status
 * @desc    Get import status
 * @access  Private
 */
router.get('/:importId/status', authenticate, getImportStatus);

/**
 * @route   GET /api/import/:importId/results
 * @desc    Get import results (leads and skipped records)
 * @access  Private
 */
router.get('/:importId/results', authenticate, getImportResults);

/**
 * @route   GET /api/import/history
 * @desc    Get user's import history
 * @access  Private
 */
router.get('/history', authenticate, getUserImportHistory);

export default router;
