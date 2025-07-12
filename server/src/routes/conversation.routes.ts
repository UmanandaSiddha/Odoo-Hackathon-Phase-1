import express from "express";
import { getConversations } from "../controllers/conversation.controller";
import { authenticateUser } from "../middlewares/token.middleware";

const router = express.Router();

router.route("/all/:userId").get(authenticateUser, getConversations);

export default router;