import Sidebar from "@/components/Sidebar";
import React from "react";
import { Outlet } from "react-router";

const AppLayout: React.FC = () => {
  return (
    <section className="w-full">
      <div className="mx-auto w-4/5">
        <div className="grid grid-cols-[30%_70%] border-l border-r">
          <Sidebar />
          <main className="flex h-screen flex-col">
            <Outlet />
          </main>
        </div>
      </div>
    </section>
  );
};

export default AppLayout;
