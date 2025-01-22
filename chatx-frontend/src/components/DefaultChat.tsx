import React from "react";
import { FaRegHeart } from "react-icons/fa6";

const DefaultChat: React.FC = () => {
  return (
    <div className="flex h-full flex-[60%] flex-col items-center justify-center p-5 text-center">
      <div className="mb-5 w-[550px]">
        <img src="entry-image-dark.png" className="h-full w-full" />
      </div>
      <h1 className="mb-2 text-4xl font-normal"> Chatting Web </h1>
      <p className="max-w-[500px] pb-7 text-sm font-medium">
        Send and receive messages without keeping your phone online. <br />
        Use WhatsApp on up to 4 linked devices and 1 phone at the same time.
      </p>
      <p className="flex max-w-[500px] items-center pb-2 text-sm font-medium">
        <span>Built by</span>&nbsp;
        <strong className="mr-1">Vishal Patel</strong>
        <FaRegHeart />
      </p>
    </div>
  );
};

export default DefaultChat;
