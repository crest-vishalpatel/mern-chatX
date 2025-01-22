import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { logger } from "./utils/util";

import userRoutes from "./routes/user";
import conversationRoutes from "./routes/conversation";
import messageRoutes from "./routes/message";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/users", userRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/message", messageRoutes);

export { app };
