import express from 'express';
import {
    getCurrentUser,
    updateUserProfile,
    updateSkills,
    updateSkillProgress,
    searchUsers,
    updateUserStatus,
    changePassword,
    deleteUserAccount
} from '../controllers/profile.controller';
import { authenticateUser } from '../middlewares/token.middleware';

const router = express.Router();

// Protected routes - require authentication
router.use(authenticateUser);

// Profile routes
router.get('/me', getCurrentUser);
router.patch('/update', updateUserProfile);
router.patch('/skills', updateSkills);
router.patch('/skills/progress', updateSkillProgress);
router.patch('/status', updateUserStatus);
router.patch('/password', changePassword);
router.delete('/delete', deleteUserAccount);

// Public routes
router.get('/search', searchUsers);

export default router;
