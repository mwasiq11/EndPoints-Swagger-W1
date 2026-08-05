import { Router } from 'express';
import { info } from '../controllers/publicController.js';

const router = Router();

router.get('/info', info);

export { router as publicRouter };