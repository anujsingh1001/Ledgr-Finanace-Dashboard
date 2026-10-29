import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as controller from '../controllers/analytics.controller.js';
const router = Router();
router.use(requireAuth);
router.get('/summary', controller.getSummary);
router.get('/monthly', controller.getMonthly);
router.get('/categories', controller.getCategories);
export default router;
