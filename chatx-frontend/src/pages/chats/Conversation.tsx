import React from "react";
import ChatHeader from "@/components/ChatHeader";
import NewMessage from "@/components/NewMessage";
import Message from "@/ui/Message";
import { useChat } from "@/contexts/ChatContext";

const Conversation: React.FC = () => {
  const { userId, messages } = useChat();

  return (
    <div className="flex h-full flex-col">
      <ChatHeader />
      <div className="relative flex flex-1 flex-col overflow-y-auto px-1">
        {messages &&
          messages.length > 0 &&
          messages.map((message) => (
            <Message
              key={message._id}
              text={message.text}
              createdAt={message.createdAt}
              senderId={message.senderId}
              userId={userId!}
              status={message.status}
            />
          ))}
      </div>
      <div className="mt-auto">
        <NewMessage />
      </div>
    </div>
  );
};

export default Conversation;
