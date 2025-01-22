import mongoose, { Document, Model, Schema } from "mongoose";

export interface IConversation extends Document {
  participants: Array<mongoose.Types.ObjectId>;
  lastMessageId: mongoose.Types.ObjectId;
  conversationName: string;
  isGroup: boolean;
  unreadCounts: Array<{
    userId: string;
    count: number;
  }>;
}

const converstionSchema: Schema<IConversation> = new Schema(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    conversationName: {
      type: String,
    },
    isGroup: {
      type: Boolean,
      default: false,
    },
    unreadCounts: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        count: { type: Number, default: 0 },
      },
    ],
  },
  { timestamps: true }
);

const Conversation: Model<IConversation> = mongoose.model<IConversation>(
  "Conversation",
  converstionSchema
);

export default Conversation;
