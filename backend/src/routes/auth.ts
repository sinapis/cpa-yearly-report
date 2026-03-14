import { Router } from 'express';
import { login, changePassword } from '../controllers/auth';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/login', login);
// The spec says PATCH /api/profile/password
router.patch('/profile/password', authenticateToken, changePassword);

export default router;
