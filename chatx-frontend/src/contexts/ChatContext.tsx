import React, {
  Dispatch,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { IConversation, Message } from "@/types";
import { getConversations, getMessages } from "@/api/apiService";
import toast from "react-hot-toast";
import { io, Socket } from "socket.io-client";

const URL =
  import.meta.env.NODE_ENV === "production"
    ? undefined
    : "http://localhost:8000";

type ChatState = {
  isLoggedIn: boolean;
  userId: string;
  chats: Array<IConversation>;
  selectedChat: IConversation | undefined;
};

type ActionType =
  | { type: "LOGIN"; payload: { userId: string } }
  | { type: "LOGOUT" }
  | { type: "setChats"; payload: { chats: Array<IConversation> } }
  | { type: "setSelectedChat"; payload: { chat: IConversation } }
  | { type: "NEW_CHAT"; payload: { chat: IConversation } }
  | { type: "newMessage"; payload: { message: Message } }
  | { type: "setMessages"; payload: { messages: Array<Message> } }
  | { type: "updateMessage"; payload: { message: Message } };

const initialState: ChatState = {
  userId: "",
  isLoggedIn: false,
  chats: [],
  selectedChat: undefined,
};

function chatReducer(state: ChatState, action: ActionType): ChatState {
  switch (action.type) {
    case "LOGIN":
      return {
        ...state,
        isLoggedIn: true,
        userId: action.payload.userId,
      };
    case "LOGOUT":
      return initialState;
    case "setChats":
      return {
        ...state,
        chats: action.payload.chats,
      };
    case "setSelectedChat":
      return {
        ...state,
        selectedChat: action.payload.chat,
        chats: state.chats.map((chat) => {
          if (chat._id === action.payload.chat._id) {
            return {
              ...chat,
              unreadCounts: [{ ...chat.unreadCounts[0], count: 0 }],
            };
          }
          return chat;
        }),
      };
    case "NEW_CHAT":
      return {
        ...state,
        chats: [action.payload.chat, ...state.chats],
        selectedChat: action.payload.chat,
      };
    case "newMessage":
      return {
        ...state,
        chats: state.chats.map((chat) => {
          if (chat._id === action.payload.message.conversationId) {
            return {
              ...chat,
              lastMessage: {
                text: action.payload.message.text,
                updatedAt: action.payload.message.createdAt,
                _id: action.payload.message._id,
              },
            };
          }
          return chat;
        }),
      };
    default:
      throw new Error(`Unhandled action type: ${action}`);
  }
}

interface IChatContext {
  state: ChatState;
  dispatch: Dispatch<ActionType>;
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
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const [messages, setMessages] = useState<Array<Message>>([]);
  const socket = useRef<Socket | null>(null);

  const fetchConversations = async () => {
    try {
      const { conversations } = await getConversations();
      dispatch({ type: "setChats", payload: { chats: conversations } });
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
    if (state.selectedChat?._id) {
      fetchMessages(state.selectedChat?._id);
    }
  }, [state.selectedChat?._id]);

  useEffect(() => {
    if (state.isLoggedIn) {
      fetchConversations();
    }
  }, [state.isLoggedIn]);

  useEffect(() => {
    if (!state.userId) return;
    socket.current = io(URL);

    socket.current.on("connect", () => {
      console.log("Connected to the socket server:", socket.current?.id);
      socket.current?.emit("register_user", state.userId);
    });

    socket.current.on("join_conversation", (conversationId) => {
      console.log("new connection");
      fetchConversations();
      socket.current?.emit("join_conversation", conversationId);
    });

    socket.current.on("new_message", (message) => {
      dispatch({ type: "newMessage", payload: { message } });
      if (state.selectedChat?._id === message.conversationId) {
        setMessages((prev) => [...prev, message]);
        socket.current?.emit("message_read", message);
      } else {
        socket.current?.emit("message_delivered", message);
      }
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

    socket.current.on("disconnect", () => {
      console.log("Disconnected from the socket server");
    });

    return () => {
      socket.current?.off("connect");
      socket.current?.off("join_conversation");
      socket.current?.off("new_message");
      socket.current?.off("update_message");
      socket.current?.off("disconnect");
      socket.current?.disconnect();
      console.log("socket disconnected");
    };
  }, [state.userId]);

  return (
    <ChatContext.Provider
      value={{ state, dispatch, socket: socket.current, messages, addMessage }}
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
