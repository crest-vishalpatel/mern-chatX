import React from "react";
import clsx from "clsx";
import { IoCheckmarkDoneSharp, IoCheckmarkSharp } from "react-icons/io5";

interface Props {
  senderId: string;
  text: string;
  createdAt: string;
  userId: string;
  status: "sent" | "delivered" | "read";
}

const Message: React.FC<Props> = ({
  senderId,
  text,
  createdAt,
  userId,
  status,
}: Props) => {
  const isSender = senderId === userId ? true : false;
  const date = new Date(createdAt);
  const hours = date.getHours();
  const minutes = date.getMinutes();

  const formattedTime = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  return (
    <div
      className={clsx(
        "relative mb-3 flex w-fit max-w-[95%] whitespace-pre-line rounded-full pb-[8px] pl-[9px] pr-[7px] pt-[6px] text-sm leading-5",
        isSender ? "self-end bg-gray-100" : "self-start bg-lime-200",
      )}
    >
      <span>{text}</span>
      <span className="inline-block h-1 w-16 bg-transparent"></span>
      <span className="absolute bottom-1 right-2 flex items-center text-xs font-medium text-gray-500">
        <span className="mr-1">{formattedTime}</span>
        {isSender &&
          ((status === "sent" && <IoCheckmarkSharp />) ||
            (status === "delivered" && <IoCheckmarkDoneSharp />) ||
            (status === "read" && (
              <IoCheckmarkDoneSharp className="text-blue-700" />
            )))}
        {/*  */}
      </span>
    </div>
  );
};

export default Message;
