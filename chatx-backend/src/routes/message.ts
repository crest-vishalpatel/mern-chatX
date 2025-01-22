import express from "express";
import { markAsRead, saveMessage, updateMessage } from "../controllers/message";
import verifyToken from "../middlewares/auth";

const router = express.Router();

router.put("/read/:conversation_id", verifyToken, markAsRead);
router.route("/").post(verifyToken, saveMessage).put(updateMessage);

export default router;
