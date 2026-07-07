import { Router } from 'express';
import { login, register } from '../controllers/auth.controller';

const router = Router();

/**
 * @route   POST /api/auth/login
 * @desc    Login admin user and return JWT
 * @access  Public
 */
router.post('/login', login);

/**
 * @route   POST /api/auth/register
 * @desc    Register admin user
 * @access  Public (Demo/Seed purposes)
 */
router.post('/register', register);

export default router;
