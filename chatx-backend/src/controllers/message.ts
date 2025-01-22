import { Request, Response } from "express";
import Message from "../models/Message";
import { logger } from "../utils/util";
import Conversation from "../models/Conversation";
import mongoose from "mongoose";

const saveMessage = async (req: Request, res: Response) => {
  try {
    const message = new Message({ ...req.body, senderId: req.userId });
    const result = await message.save();
    await Conversation.updateOne(
      { _id: new mongoose.Types.ObjectId(req.body.conversationId as string) },
      { $inc: { "unreadCounts.$[elem].count": 1 } },
      {
        arrayFilters: [{ "elem.userId": { $ne: req.userId } }],
      }
    );
    res.status(201).json({ message: result });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

const updateMessage = async (req: Request, res: Response) => {
  try {
    const result = await Message.findByIdAndUpdate(
      req.body._id,
      {
        status: req.body.status,
      },
      { returnDocument: "after" }
    );
    res.status(200).json({ result });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

const markAsRead = async (req: Request, res: Response) => {
  try {
    const chatId = req.params.conversation_id as string;
    await Conversation.updateOne(
      { _id: chatId, "unreadCounts.userId": req.userId },
      { $set: { "unreadCounts.$.count": 0 } }
    );
    const result = await Message.updateMany(
      {
        conversationId: chatId,
        senderId: { $ne: req.userId },
        status: { $ne: "read" },
      },
      { status: "read", $push: { readBy: req.userId } }
    );
    res.status(200).json({ result });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

export { saveMessage, updateMessage, markAsRead };
