import { Router } from 'express';
import {
    createAdminMessage,
    deleteAdminMessage,
    deleteSkill,
    deleteUser,
    getAllSkills,
    getAllSwaps,
    getAllUsers,
    getUserById,
    userBanAction
} from '../controllers/admin.controller';

const router = Router();

router.get('/users/all', getAllUsers);
router.route('/user/byId/:userId')
    .get(getUserById)
    .put(userBanAction)
    .delete(deleteUser);
router.route("/skills/all").get(getAllSkills);
router.route("/swaps/all").get(getAllSwaps);
router.route("/skills/byId/:skillId").delete(deleteSkill);
router.route("/message/create").post(createAdminMessage);
router.route("/message/byId/:messageId").delete(deleteAdminMessage);

export default router;