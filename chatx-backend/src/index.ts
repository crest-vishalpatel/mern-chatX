import "dotenv/config";
import { createServer } from "node:http";
import mongoose from "mongoose";
import { app } from "./app";
import { Server } from "socket.io";
import { format, transports } from "winston";
import { logger } from "./utils/util";
import Conversation from "./models/Conversation";
import Message from "./models/Message";

const userSocketMap: Record<string, string> = {};

logger.add(
  new transports.Console({
    format: format.combine(format.colorize(), format.splat(), format.simple()),
  })
);

mongoose.connect(process.env.MONGODB_URI as string, {
  dbName: "chat-db",
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

io.on("connection", (socket) => {
  logger.info(socket.id);

  socket.on("register_user", async (userId: string) => {
    userSocketMap[userId] = socket.id;
    logger.info(`User ${userId} mapped to socket ${socket.id}`);
    socket.broadcast.emit("user_status_change", { userId, status: "online" });
    const conversations = await Conversation.find({
      participants: userId,
    })
      .select("_id")
      .lean();
    conversations.forEach((conversation) =>
      socket.join(conversation._id.toString())
    );
  });

  socket.on("join_conversation", (conversationId: string) => {
    socket.join(conversationId);
    logger.info(`User joined conversation: ${conversationId}`);
  });

  socket.on("send_message", (message) => {
    logger.info(
      `new Message ${message.text}, chatId: ${message.conversationId}`
    );
    io.except(userSocketMap[message.senderId])
      .to(message.conversationId)
      .emit("new_message", message);
  });

  socket.on("message_delivered", (message) => {
    logger.info("message delivered");
    io.to(userSocketMap[message.senderId]).emit("update_message", {
      ...message,
      status: "delivered",
    });
    Message.findByIdAndUpdate(message._id, { status: "delivered" });
  });

  socket.on("message_read", (message) => {
    logger.info("message read");
    io.to(userSocketMap[message.senderId]).emit("update_message", {
      ...message,
      status: "read",
    });
    Message.findByIdAndUpdate(message._id, { status: "read" });
  });

  socket.on("mark_as_read", (data) => {
    io.to(userSocketMap[data.userId]).emit("mark_as_read", {
      conversationId: data._id,
    });
  });

  socket.on(
    "create_conversation",
    ({
      receiverId,
      conversationId,
    }: {
      receiverId: string[];
      conversationId: string;
    }) => {
      logger.info(`creating chat ${conversationId}`);
      socket.join(conversationId);
      receiverId.forEach((id) =>
        io.to(userSocketMap[id]).emit("join_conversation", conversationId)
      );
    }
  );

  socket.on("disconnect", () => {
    const userId = Object.keys(userSocketMap).find(
      (key) => userSocketMap[key] === socket.id
    );
    if (userId) {
      delete userSocketMap[userId];
      logger.info(`User ${userId} disconnected and removed from map`);
      socket.broadcast.emit("user_status_change", {
        userId,
        status: "offline",
      });
    }
  });
});

httpServer.listen(process.env.PORT, () =>
  logger.info(`server started on port:${process.env.PORT}`)
);
