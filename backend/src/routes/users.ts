import { Router } from 'express';
import { getUsers, createUser, updateUser, deleteUser } from '../controllers/users';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// Only admin can manage users
router.use(authenticateToken, requireRole(['admin']));

router.get('/', getUsers);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
