import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { IUser } from "../shared/types";

interface UserType extends IUser {
  generateAuthToken(): string;
}

const userSchema: Schema<UserType & Document> = new mongoose.Schema<
  UserType & Document
>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["online", "offline", "away"],
      default: "offline",
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.methods.generateAuthToken = function (): string {
  return jwt.sign({ userId: this._id }, process.env.JWT_SECRET_KEY as string, {
    expiresIn: "1d",
  });
};

const User: Model<UserType & Document> = mongoose.model("User", userSchema);

export default User;
