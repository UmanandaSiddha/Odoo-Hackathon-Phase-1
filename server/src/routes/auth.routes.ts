import express from 'express';
import { register } from '../controllers/auth/user.register';
import { login } from '../controllers/auth/user.login';

const router = express.Router();

router.route('/register').post(register);
router.route('/login').post(login);

export default router;