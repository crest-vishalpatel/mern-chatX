import { useChat } from "@/contexts/ChatContext";
import Chat from "@/ui/Chat";
import React from "react";

const ChatList: React.FC = () => {
  const { chats } = useChat();

  return (
    <ul>
      {chats &&
        chats.length > 0 &&
        chats.map((chat) => {
          return <Chat key={chat._id} {...chat} />;
        })}
    </ul>
  );
};

export default ChatList;
