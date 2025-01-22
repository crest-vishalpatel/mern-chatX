import React from "react";
import Header from "./Header";
import ChatList from "./ChatList";

const Sidebar: React.FC = () => {
  return (
    <aside className="border-r">
      <Header />
      <ChatList />
    </aside>
  );
};

export default Sidebar;
