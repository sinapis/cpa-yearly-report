import { Router } from 'express';
import { getReportTypes, createReportType, updateReportType, deleteReportType,
  getStatusTypes, createStatusType, updateStatusType, deleteStatusType,
  getSettings, updateSettings } from '../controllers/admin';
import { authenticateToken, requireRole } from '../middleware/auth';
import usersRoutes from './users';

const router = Router();

// Protect ALL admin routes
router.use(authenticateToken, requireRole(['admin']));

// Users are conceptually under admin
router.use('/users', usersRoutes);

router.get('/report-types', getReportTypes);
router.post('/report-types', createReportType);
router.put('/report-types/:id', updateReportType);
router.delete('/report-types/:id', deleteReportType);

router.get('/status-types', getStatusTypes);
router.post('/status-types', createStatusType);
router.put('/status-types/:id', updateStatusType);
router.delete('/status-types/:id', deleteStatusType);

router.get('/settings', getSettings);
router.patch('/settings', updateSettings);

export default router;
