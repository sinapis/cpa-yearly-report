import { Router } from 'express';
import { getTasks, getTaskById, createTask, updateTask } from '../controllers/tasks';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', getTasks);
router.get('/:id', getTaskById);
router.patch('/:id', updateTask);

// Managers and Admins can create tasks
router.post('/', requireRole(['admin', 'manager']), createTask);

export default router;
