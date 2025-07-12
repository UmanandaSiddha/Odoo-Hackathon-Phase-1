import express from 'express';
import {
    getCurrentUser,
    updateUserProfile,
    searchUsers,
    updateUserStatus,
    changePassword,
    deleteUserAccount
} from '../controllers/profile.controller';
// import { verifyAuth } from '@/middleware/verifyAuth';

const router = express.Router();


router.get('/getUser', getCurrentUser);               // GET current user
router.patch('/update', updateUserProfile);          // PATCH profile update
router.patch('/update/status', updateUserStatus);    // PATCH isOnline / lastLogin
router.patch('/update/password', changePassword);    // PATCH change password
router.delete('/delete', deleteUserAccount);         // DELETE account


router.get('/', searchUsers);                                // GET user search by skill, naprofile, etc.

export default router;
