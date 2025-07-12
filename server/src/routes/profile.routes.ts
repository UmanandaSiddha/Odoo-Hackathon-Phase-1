import express from 'express';
import {
    getCurrentUser,
    updateUserProfile,
    searchUsers,
    updateUserStatus,
    changePassword,
    deleteUserAccount
} from '../controllers/profile.controller';
import { authenticateUser } from '../middlewares/token.middleware';

const router = express.Router();


router.get('/getUser', authenticateUser, getCurrentUser);               // GET current user
router.patch('/update', authenticateUser, updateUserProfile);          // PATCH profile update
router.patch('/update/status', authenticateUser, updateUserStatus);    // PATCH isOnline / lastLogin
router.patch('/update/password', authenticateUser, changePassword);    // PATCH change password
router.delete('/delete', authenticateUser, deleteUserAccount);         // DELETE account


router.get('/skill/:userId', authenticateUser, searchUsers);                                // GET user search by skill, naprofile, etc.

export default router;
