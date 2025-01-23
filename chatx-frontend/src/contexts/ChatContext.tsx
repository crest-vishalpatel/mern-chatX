import React, { useContext, useEffect, useRef, useState } from "react";
import { IConversation, Message } from "@/types";
import { getConversations, getMessages } from "@/api/apiService";
import toast from "react-hot-toast";
import { io, Socket } from "socket.io-client";

const URL =
  import.meta.env.NODE_ENV === "production"
    ? undefined
    : "http://localhost:8000";

// function chatReducer(state: ChatState, action: ActionType): ChatState {
//   switch (action.type) {
//     case "LOGIN":
//       return {
//         ...state,
//         isLoggedIn: true,
//         userId: action.payload.userId,
//       };
//     case "LOGOUT":
//       return initialState;
//     case "setChats":
//       return {
//         ...state,
//         chats: action.payload.chats,
//       };
//     case "setSelectedChat":
//       return {
//         ...state,
//         selectedChat: action.payload.chat,
//         chats: state.chats.map((chat) => {
//           if (chat._id === action.payload.chat._id) {
//             return {
//               ...chat,
//               unreadCounts: [{ ...chat.unreadCounts[0], count: 0 }],
//             };
//           }
//           return chat;
//         }),
//       };
//     case "NEW_CHAT":
//       return {
//         ...state,
//         chats: [action.payload.chat, ...state.chats],
//         selectedChat: action.payload.chat,
//       };
//     case "newMessage":
//       return {
//         ...state,
//         chats: state.chats.map((chat) => {
//           if (chat._id === action.payload.message.conversationId) {
//             return {
//               ...chat,
//               lastMessage: {
//                 text: action.payload.message.text,
//                 updatedAt: action.payload.message.createdAt,
//                 _id: action.payload.message._id,
//               },
//             };
//           }
//           return chat;
//         }),
//       };
//     default:
//       throw new Error(`Unhandled action type: ${action}`);
//   }
// }

interface IChatContext {
  userId: string | undefined;
  setUserId: React.Dispatch<React.SetStateAction<string | undefined>>;
  chats: Array<IConversation>;
  setChats: React.Dispatch<React.SetStateAction<Array<IConversation>>>;
  selectedChat: IConversation | undefined;
  setSelectedChat: React.Dispatch<
    React.SetStateAction<IConversation | undefined>
  >;
  socket: Socket | null;
  messages: Array<Message>;
  addMessage: (message: Message) => void;
}

const ChatContext = React.createContext<IChatContext | undefined>(undefined);

export const ChatContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [userId, setUserId] = useState<string>();
  const [chats, setChats] = useState<Array<IConversation>>([]);
  const [selectedChat, setSelectedChat] = useState<IConversation | undefined>();
  const [messages, setMessages] = useState<Array<Message>>([]);
  const socket = useRef<Socket | null>(null);

  const fetchConversations = async () => {
    try {
      const { conversations } = await getConversations();
      setChats(conversations);
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const fetchMessages = async (chatId: string) => {
    try {
      const { messages } = await getMessages(chatId);
      setMessages(messages);
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const addMessage = (message: Message) => {
    setMessages([...messages, message]);
    //update message status
  };

  useEffect(() => {
    if (selectedChat?._id) {
      fetchMessages(selectedChat?._id);
    }
  }, [selectedChat?._id]);

  useEffect(() => {
    if (userId) {
      fetchConversations();
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    socket.current = io(URL);

    socket.current.on("connect", () => {
      console.log("Connected to the socket server:", socket.current?.id);
      socket.current?.emit("register_user", userId);
    });

    socket.current.on("join_conversation", (conversationId) => {
      console.log("new connection");
      fetchConversations();
      socket.current?.emit("join_conversation", conversationId);
    });

    socket.current.on("update_message", (message) => {
      setMessages((msgs) =>
        msgs.map((msg) => {
          if (message._id === msg._id) {
            return message;
          }
          return msg;
        }),
      );
    });

    socket.current.on("mark_as_read", ({ conversationId }) => {
      if (selectedChat?._id === conversationId) {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.senderId === userId ? { ...msg, status: "read" } : msg,
          ),
        );
      }
    });

    socket.current.on("disconnect", () => {
      console.log("Disconnected from the socket server");
    });

    return () => {
      socket.current?.off("connect");
      socket.current?.off("join_conversation");
      socket.current?.off("update_message");
      socket.current?.off("mark_as_read");
      socket.current?.off("disconnect");
      socket.current?.disconnect();
      console.log("socket disconnected");
    };
  }, [userId]);

  useEffect(() => {
    if (!socket) return;
    socket.current?.on("new_message", (message) => {
      setChats((prevChats) =>
        prevChats.map((chat) => {
          if (chat._id === message.conversationId) {
            return {
              ...chat,
              lastMessage: {
                text: message.text,
                updatedAt: message.createdAt,
                _id: message._id,
              },
              unreadCounts: [
                {
                  ...chat.unreadCounts[0],
                  count:
                    selectedChat?._id === message.conversationId
                      ? 0
                      : chat.unreadCounts[0].count + 1,
                },
              ],
            };
          }
          return chat;
        }),
      );
      if (selectedChat?._id === message.conversationId) {
        setMessages((prev) => [...prev, message]);
        socket.current?.emit("message_read", message);
      } else {
        socket.current?.emit("message_delivered", message);
      }
    });

    return () => {
      socket.current?.off("new_message");
    };
  }, [selectedChat?._id]);

  return (
    <ChatContext.Provider
      value={{
        userId,
        setUserId,
        chats,
        setChats,
        selectedChat,
        setSelectedChat,
        socket: socket.current,
        messages,
        addMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error(`useChatContext must be used within a ChatContextProvider`);
  }
  return context as IChatContext;
};
