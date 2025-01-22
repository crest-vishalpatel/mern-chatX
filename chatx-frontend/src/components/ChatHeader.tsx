import { useChat } from "@/contexts/ChatContext";
import React, { useEffect } from "react";
import { FaEllipsisVertical } from "react-icons/fa6";
import { HiMiniMagnifyingGlass } from "react-icons/hi2";
import { useNavigate } from "react-router";

const ChatHeader: React.FC = () => {
  const navigate = useNavigate();

  const {
    state: { selectedChat },
  } = useChat();

  useEffect(() => {
    if (!selectedChat?._id) navigate("/chats");
  }, [selectedChat?._id]);

  return (
    <header className="flex justify-between border-b p-2">
      <div className="flex items-center gap-2">
        <img
          src={
            selectedChat?.isGroup
              ? `https://ui-avatars.com/api/?name=${selectedChat.conversationName}`
              : `https://ui-avatars.com/api/?name=${selectedChat?.userDetails[0].firstName}+${selectedChat?.userDetails[0].lastName}`
          }
          alt=""
          className="block h-12 w-12 cursor-pointer rounded-full"
        />
        <h2 className="text-xl font-medium">
          {selectedChat?.isGroup
            ? selectedChat.conversationName
            : `${selectedChat?.userDetails[0].firstName} ${selectedChat?.userDetails[0].lastName}`}
        </h2>
      </div>
      <div className="flex justify-end gap-8">
        <button>
          <HiMiniMagnifyingGlass size={20} />
        </button>
        <button>
          <FaEllipsisVertical size={20} />
        </button>
      </div>
    </header>
  );
};

export default ChatHeader;
