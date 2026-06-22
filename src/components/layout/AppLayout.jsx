import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="ml-16 lg:ml-56 min-h-screen">
        <div className="max-w-5xl mx-auto p-5 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}