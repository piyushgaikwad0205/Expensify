import { Router } from 'express';
import { register, login } from './auth.controller.js';
import { validate } from '../common/validate.middleware.js';
import { registerDto, loginDto } from './auth.dto.js';

const router = Router();

router.post('/register', validate(registerDto), register);
router.post('/login', validate(loginDto), login);

export default router;
