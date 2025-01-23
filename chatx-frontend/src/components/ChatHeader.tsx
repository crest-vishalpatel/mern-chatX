import { getUserStatus } from "@/api/apiService";
import { useChat } from "@/contexts/ChatContext";
import React, { useEffect, useState } from "react";
import { FaEllipsisVertical } from "react-icons/fa6";
import { HiMiniMagnifyingGlass } from "react-icons/hi2";
import { useNavigate } from "react-router";
import { format, isToday, isYesterday } from "date-fns";

const ChatHeader: React.FC = () => {
  const navigate = useNavigate();
  const { socket, selectedChat } = useChat();
  const [lastSeen, setLastSeen] = useState<string>("");

  async function getUserDetails(userId: string) {
    const { user } = await getUserStatus(userId);
    if (user.status === "online") {
      setLastSeen("online");
    } else {
      const lastSeenDate = new Date(user.updatedAt);
      const formattedTime = format(lastSeenDate, "h:mm a");
      if (isToday(lastSeenDate)) {
        setLastSeen(`Last seen today at ${formattedTime}`);
      } else if (isYesterday(lastSeenDate)) {
        setLastSeen(`Last seen yesterday at ${formattedTime}`);
      } else {
        setLastSeen(
          `Last seen on ${format(lastSeenDate, "MMM d, yyyy")} at ${formattedTime}`,
        );
      }
    }
  }

  useEffect(() => {
    if (!selectedChat?._id) navigate("/chats");
  }, [selectedChat?._id]);

  useEffect(() => {
    if (!selectedChat?.isGroup && selectedChat?.userDetails[0]._id) {
      getUserDetails(selectedChat?.userDetails[0]._id);
    }
  }, [selectedChat?.isGroup, selectedChat?.userDetails[0]._id]);

  useEffect(() => {
    socket?.on("user_status_change", (data) => {
      if (
        !selectedChat?.isGroup &&
        selectedChat?.userDetails[0]._id === data.userId
      ) {
        if (data.status === "online") {
          setLastSeen("online");
        } else {
          setLastSeen(`last seen today at ${format(new Date(), "h:mm a")}`);
        }
      }
    });
    return () => {
      socket?.off("user_status_change");
    };
  }, [socket]);

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
        <div>
          <h2 className="text-xl font-medium">
            {selectedChat?.isGroup
              ? selectedChat.conversationName
              : `${selectedChat?.userDetails[0].firstName} ${selectedChat?.userDetails[0].lastName}`}
          </h2>
          <p className="text-sm">{lastSeen}</p>
        </div>
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
