import React from "react";
import { useNavigate } from "react-router";
import { getTime } from "../utils/util";
import { useChat } from "@/contexts/ChatContext";
import { markAsRead } from "@/api/apiService";
import toast from "react-hot-toast";

type Props = {
  _id: string;
  conversationName: string;
  isGroup: boolean;
  userDetails: Array<{ firstName: string; lastName: string; _id: string }>;
  lastMessage: { _id: string; text: string; updatedAt: string };
  unreadCounts: Array<{
    userId: string;
    count: number;
    _id: string;
  }>;
};

const Chat: React.FC<Props> = ({
  conversationName,
  isGroup,
  lastMessage,
  _id,
  userDetails,
  unreadCounts,
}: Props) => {
  const navigate = useNavigate();

  const { socket, setSelectedChat, setChats } = useChat();

  const { firstName, lastName, _id: userId } = userDetails[0];

  const handleClick = async () => {
    try {
      socket?.emit("mark_as_read", { userId, _id });
      await markAsRead(_id);
    } catch (error) {
      toast.error("Something went wrong");
    }
    setSelectedChat({
      _id: _id,
      lastMessage: { text: "", updatedAt: "", _id: "" },
      userDetails: [{ firstName, lastName, _id: "" }],
      conversationName,
      isGroup,
      unreadCounts,
    });
    setChats((prevChats) =>
      prevChats.map((chat) => {
        if (chat._id === _id) {
          return {
            ...chat,
            unreadCounts: [{ ...chat.unreadCounts[0], count: 0 }],
          };
        } else {
          return chat;
        }
      }),
    );
    navigate(`/chats/${_id}`);
  };

  return (
    <li className="border-b p-2" onClick={handleClick}>
      <div className="flex gap-2">
        <img
          src={
            isGroup
              ? `https://ui-avatars.com/api/?name=${conversationName}`
              : `https://ui-avatars.com/api/?name=${firstName}+${lastName}`
          }
          alt=""
          className="h-12 w-12 cursor-pointer rounded-full"
        />
        <div className="flex flex-col justify-between">
          <strong>
            {isGroup
              ? conversationName
              : userDetails[0].firstName + " " + userDetails[0].lastName}
          </strong>
          <span className="block text-gray-500">
            {lastMessage && lastMessage.text}
          </span>
        </div>
        <div className="ml-auto flex flex-col items-center justify-center text-center text-xs">
          <span className="block">
            {getTime(lastMessage?.updatedAt || new Date().toISOString())}
          </span>
          {unreadCounts[0].count > 0 && (
            <span className="inline-block h-5 min-w-5 rounded-2xl bg-green-500 px-1.5 text-center align-middle font-bold leading-5 text-white">
              {unreadCounts[0].count}
            </span>
          )}
        </div>
      </div>
    </li>
  );
};

export default Chat;
