import { Router } from 'express';
import { dashboard, profile } from '../controllers/protectedController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authMiddleware);
router.get('/profile', profile);
router.get('/dashboard', dashboard);

export { router as protectedRouter };