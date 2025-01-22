import express from "express";
import {
  create,
  getConversation,
  getConversations,
} from "../controllers/conversation";
import verifyToken from "../middlewares/auth";

const router = express.Router();

router.route("/").post(verifyToken, create).get(verifyToken, getConversations);
router.route("/:id").get(verifyToken, getConversation);

export default router;
