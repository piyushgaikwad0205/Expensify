import { Router } from 'express';
import { getBudget, setBudget } from './budget.controller.js';
import { validate } from '../common/validate.middleware.js';
import { setBudgetDto } from './budget.dto.js';

const router = Router();

router.get('/', getBudget);
router.put('/', validate(setBudgetDto), setBudget);

export default router;
