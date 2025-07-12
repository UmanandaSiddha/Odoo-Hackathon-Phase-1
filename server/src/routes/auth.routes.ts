import express from 'express';
import { register } from '../controllers/auth/user.register';
import { login } from '../controllers/auth/user.login';
import { logout } from '../controllers/auth/user.logout';
import { getCurrentUser } from '../controllers/auth/user.me';
import { authenticateUser } from '../middlewares/token.middleware';

const router = express.Router();

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/logout/:userId').post(authenticateUser, logout);
router.route('/me').get(authenticateUser, getCurrentUser);

export default router;