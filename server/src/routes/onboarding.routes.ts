import express from 'express';
import { authenticateUser } from '../middlewares/token.middleware';
import { onboarding } from '../controllers/onboarding.controller';

const router = express.Router();

router.route('/onboarding/:userId').put(authenticateUser, onboarding);

export default router;
