import { Router } from 'express';
import csvRoutes from './csv.routes';
import importRoutes from './import.routes';
import adminRoutes from './admin.routes';
import authRoutes from './auth.routes';

const router = Router();

/**
 * API Routes
 */
router.use('/auth', authRoutes);
router.use('/csv', csvRoutes);
router.use('/import', importRoutes);
router.use('/admin', adminRoutes);

/**
 * API Info Route
 */
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'GrowEasy CSV Importer API',
    version: '1.0.0',
    endpoints: {
      csv: {
        upload: 'POST /api/csv/upload',
        count: 'GET /api/csv/count/:importId',
      },
      import: {
        process: 'POST /api/import/:importId',
        status: 'GET /api/import/:importId/status',
        results: 'GET /api/import/:importId/results',
        history: 'GET /api/import/history',
      },
      admin: {
        stats: 'GET /api/admin/stats',
        imports: 'GET /api/admin/imports',
        leads: 'GET /api/admin/leads',
        export: 'GET /api/admin/leads/export',
        leadById: 'GET /api/admin/leads/:id',
        deleteLead: 'DELETE /api/admin/leads/:id',
        userStats: 'GET /api/admin/users/:userId/stats',
      },
    },
  });
});

export default router;
