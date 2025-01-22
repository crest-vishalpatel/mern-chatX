import React from "react";
import ChatHeader from "@/components/ChatHeader";
import NewMessage from "@/components/NewMessage";
import Message from "@/ui/Message";
import { useChat } from "@/contexts/ChatContext";

const Conversation: React.FC = () => {
  const {
    state: { userId, selectedChat },
    messages,
  } = useChat();

  console.log(selectedChat);

  return (
    <>
      <ChatHeader />
      <div className="relative flex h-[600px] flex-col overflow-y-auto">
        {messages &&
          messages.length > 0 &&
          messages.map((message) => (
            <Message
              key={message._id}
              text={message.text}
              createdAt={message.createdAt}
              senderId={message.senderId}
              userId={userId}
              status={message.status}
            />
          ))}
      </div>
      <div className="mt-auto">
        <NewMessage />
      </div>
    </>
  );
};

export default Conversation;
