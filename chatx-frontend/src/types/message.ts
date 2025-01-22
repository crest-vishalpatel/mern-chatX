export interface IMessage {
  text: string;
  conversationId: string;
}

export interface IConversation {
  _id: string;
  conversationName: string;
  isGroup: boolean;
  lastMessage: {
    text: string;
    updatedAt: string;
    _id: string;
  };
  userDetails: Array<{
    firstName: string;
    lastName: string;
    _id: string;
  }>;
  unreadCounts: Array<{
    userId: string;
    count: number;
    _id: string;
  }>;
}

export interface Message {
  senderId: string;
  text: string;
  createdAt: string;
  userId: string;
  conversationId: string;
  _id: string;
  status: "sent" | "delivered" | "read";
}
