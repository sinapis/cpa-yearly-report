import { Router } from 'express';
import authRoutes from './auth';
import tasksRoutes from './tasks';
import adminRoutes from './admin';
import { getReportTypes, getStatusTypes } from '../controllers/admin';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);

// Spec requirement: tasks APIs at /api/tasks
apiRouter.use('/tasks', tasksRoutes);

// Spec requirement: Admin APIs at /api/admin/*
apiRouter.use('/admin', adminRoutes);

// Non-admin can also read report types and status types for dropdowns
apiRouter.get('/report-types', getReportTypes);
apiRouter.get('/status-types', getStatusTypes);

export default apiRouter;
