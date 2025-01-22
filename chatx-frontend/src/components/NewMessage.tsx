import React, { useState } from "react";
import { IoSend } from "react-icons/io5";
import { sendMessage } from "../api/apiService";
import toast from "react-hot-toast";
import { useChat } from "@/contexts/ChatContext";
import { useParams } from "react-router";

const NewMessage: React.FC = () => {
  const { socket, dispatch, addMessage } = useChat();
  const { chatId } = useParams();

  const [newMessage, setNewMessage] = useState<string>("");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(event.target.value);
  };

  const handleSend = async (
    event: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>,
  ) => {
    if ("key" in event && event.key !== "Enter") return;

    if (!newMessage) return;

    try {
      const { message } = await sendMessage({
        text: newMessage,
        conversationId: chatId!,
      });
      setNewMessage("");
      dispatch({ type: "newMessage", payload: { message: message } });
      socket?.emit("send_message", message);
      addMessage(message);
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="flex gap-2 bg-neutral-50 px-2 py-2">
      {/* <div>Attachment</div> */}
      <div className="flex-1">
        <input
          type="text"
          className="h-12 w-full rounded-full border px-4 py-2 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
          placeholder="Message"
          value={newMessage}
          onChange={handleChange}
          onKeyDown={handleSend}
        />
      </div>
      <div>
        <button
          onClick={handleSend}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500 px-3 py-2"
        >
          <IoSend color="white" />
        </button>
      </div>
    </div>
  );
};

export default NewMessage;
