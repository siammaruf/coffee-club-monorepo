import { Outlet } from "react-router";
import Sidebar from "../../components/layout/sidebar";
import { AuthGuard } from "../../hooks/auth/AuthGuard";
import { useSelector } from "react-redux";
import React from "react";

const selectCurrentUser = (state: any) => state.auth?.user;

export default function DashboardLayout() {
  const currentUser = useSelector(selectCurrentUser);

  return (
    <AuthGuard>
      <div className="flex min-h-screen">
        <div className="fixed h-screen overflow-y-auto">
          <Sidebar />
        </div>

        <div className="flex-1 ml-64 flex flex-col">
          <header className="border-b fixed top-0 right-0 left-64 bg-white z-10">
            <div className="flex h-16 items-center px-6 justify-between">
              <h1 className="text-xl font-bold">Dashboard</h1>
              {currentUser && (
                <div className="flex items-center gap-3">
                  <span className="font-medium text-gray-700">
                    Welcome back, {currentUser.first_name}!
                  </span>
                  <img
                    src={currentUser.picture || "/default-profile.png"}
                    alt="Profile"
                    className="w-9 h-9 rounded-full border object-cover"
                  />
                </div>
              )}
            </div>
          </header>
          
          <main className="p-6 pt-24 overflow-y-auto h-screen">
            <Outlet />
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}