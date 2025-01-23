import { Request, Response } from "express";
import User from "../models/user";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { logger } from "../utils/util";
import mongoose from "mongoose";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  maxAge: 86400000,
};

const register = async (req: Request, res: Response) => {
  try {
    const isExistingUser = await User.findOne({ email: req.body.email });
    if (isExistingUser) {
      res.status(400).json({ message: "User already exists" });
      return;
    }
    const user = new User(req.body);
    await user.save();
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET_KEY as string,
      { expiresIn: "1d" }
    );
    res
      .status(201)
      .cookie("auth_token", token, cookieOptions)
      .json({ userId: user.id });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }
    const isMatch = await bcrypt.compare(password, user?.password as string);
    if (!isMatch) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }
    await User.findOneAndUpdate({ email }, { status: "online" });
    const auth_token = user.generateAuthToken();
    res
      .status(200)
      .cookie("auth_token", auth_token, cookieOptions)
      .json({ userId: user.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.aggregate([
      {
        $match: { _id: { $ne: new mongoose.Types.ObjectId(req.userId) } },
      },
      {
        $lookup: {
          from: "conversations",
          localField: "_id",
          foreignField: "participants",
          as: "userConversations",
        },
      },
      {
        $match: {
          $or: [
            { userConversations: { $size: 0 } },
            {
              userConversations: {
                $not: {
                  $elemMatch: {
                    participants: new mongoose.Types.ObjectId(req.userId),
                  },
                },
              },
            },
          ],
        },
      },
      {
        $project: {
          _id: 1,
          firstName: 1,
          lastName: 1,
        },
      },
    ]);
    res.status(200).json({ users });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

const logout = async (req: Request, res: Response) => {
  try {
    await User.findByIdAndUpdate(req.userId, { status: "offline" });
    res.cookie("auth_token", "", { expires: new Date(0) }).send();
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find(
      { _id: { $ne: req.userId } },
      "firstName lastName"
    );
    res.status(200).json({ users });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

const getStatus = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.query.userId as string);
    res.status(200).json({ user });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

export { register, login, getUsers, logout, getAllUsers, getStatus };
