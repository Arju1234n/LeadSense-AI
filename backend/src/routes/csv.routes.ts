import { Router } from 'express';
import { uploadSingleCSV, handleMulterError } from '../middleware/upload';
import { authenticate } from '../middleware/auth';
import { uploadLimiter } from '../middleware/rateLimiter';
import { uploadCSV, getCSVRowCount } from '../controllers/csv.controller';

const router = Router();

/**
 * @route   POST /api/csv/upload
 * @desc    Upload CSV file and get preview
 * @access  Private
 */
router.post(
  '/upload',
  authenticate,
  uploadLimiter,
  uploadSingleCSV,
  handleMulterError,
  uploadCSV
);

/**
 * @route   GET /api/csv/count/:importId
 * @desc    Get CSV row count for an import
 * @access  Private
 */
router.get('/count/:importId', authenticate, getCSVRowCount);

export default router;
