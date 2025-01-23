import { Request, Response } from "express";
import Conversation from "../models/Conversation";
import Message from "../models/Message";
import mongoose from "mongoose";

const create = async (req: Request, res: Response) => {
  try {
    const conversation = new Conversation({
      participants: [...req.body.participants, req.userId],
      isGroup: req.body.isGroup,
      conversationName: req.body.groupName,
      unreadCounts: [...req.body.participants, req.userId].map(
        (userId: string) => ({ userId, count: 0 })
      ),
    });
    const result = await conversation.save();
    if (!req.body.isGroup) {
      const chat = await Conversation.findById(result.id)
        .populate("participants", "firstName lastName")
        .lean()
        .exec();
      if (chat) {
        chat.participants = chat?.participants.filter(
          (user) => user._id.toString() !== req.userId
        );
      }
      res.status(201).json({ result: chat });
    } else {
      res.status(201).json({ result });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const getConversations = async (req: Request, res: Response) => {
  const userId = new mongoose.Types.ObjectId(req.userId as string);
  try {
    const conversations = await Conversation.aggregate([
      {
        $match: {
          participants: userId,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "participants",
          foreignField: "_id",
          pipeline: [
            {
              $match: {
                _id: {
                  $ne: userId,
                },
              },
            },
            {
              $project: {
                firstName: 1,
                lastName: 1,
              },
            },
          ],
          as: "userDetails",
        },
      },
      {
        $lookup: {
          from: "messages",
          localField: "_id",
          foreignField: "conversationId",
          pipeline: [
            {
              $sort: {
                updatedAt: -1,
              },
            },
            {
              $limit: 1,
            },
            {
              $project: {
                text: 1,
                updatedAt: 1,
              },
            },
          ],
          as: "lastMessage",
        },
      },
      {
        $unwind: {
          path: "$lastMessage",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $project: {
          _id: 1,
          isGroup: 1,
          conversationName: 1,
          lastMessage: 1,
          userDetails: {
            firstName: 1,
            lastName: 1,
            _id: 1,
          },
          unreadCounts: {
            $filter: {
              input: "$unreadCounts",
              as: "item",
              cond: {
                $eq: ["$$item.userId", new mongoose.Types.ObjectId(req.userId)],
              },
            },
          },
        },
      },
    ]);
    res.status(200).json({ conversations });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

const getConversation = async (req: Request, res: Response) => {
  try {
    const conversationId = req.params.id;
    const messages = await Message.find({ conversationId })
      .sort({ timestamp: -1 })
      .limit(50)
      .lean();
    res.status(200).json({ messages });
    return;
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

export { create, getConversations, getConversation };
