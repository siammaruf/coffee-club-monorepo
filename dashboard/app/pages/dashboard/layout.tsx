import { Link, Outlet } from "react-router";
import Sidebar from "../../components/layout/sidebar";
import { AuthGuard } from "../../hooks/auth/AuthGuard";
import { useSelector } from "react-redux";
import React from "react";
import { SidebarProvider, useSidebar } from "../../hooks/useSidebar";
import { Menu, User, LogOut, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { LogoutButton } from "../../hooks/auth/LogoutButton";

const selectCurrentUser = (state: any) => state.auth?.user;

function DashboardContent() {
  const currentUser = useSelector(selectCurrentUser);
  const { isOpen, toggle, close } = useSidebar();

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Backdrop — tablet/mobile only */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={close}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed h-screen overflow-y-auto z-40 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col">
        <header className="fixed top-0 right-0 lg:left-64 left-0 bg-white/80 backdrop-blur-md border-b z-10">
          <div className="flex h-14 items-center px-6 justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={toggle}
                className="lg:hidden p-1.5 -ml-1.5 rounded-lg hover:bg-accent transition-colors"
                aria-label="Toggle sidebar"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="text-lg font-semibold tracking-tight">Dashboard</h1>
            </div>
            {currentUser && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-accent transition-colors focus:outline-none">
                    <span className="text-sm text-muted-foreground hidden sm:inline">
                      {currentUser.first_name} {currentUser.last_name}
                    </span>
                    <img
                      src={currentUser.picture || "/default-profile.png"}
                      alt="Profile"
                      className="w-8 h-8 rounded-full ring-2 ring-border object-cover"
                    />
                    <ChevronDown className="w-4 h-4 text-muted-foreground hidden sm:block" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {currentUser.first_name} {currentUser.last_name}
                      </p>
                      {currentUser.email && (
                        <p className="text-xs leading-none text-muted-foreground">
                          {currentUser.email}
                        </p>
                      )}
                      <p className="text-xs leading-none text-muted-foreground capitalize">
                        {currentUser.role}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/profile" className="flex items-center gap-2 cursor-pointer">
                      <User className="w-4 h-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <LogoutButton className="flex items-center gap-2 w-full text-red-600 hover:text-red-700 cursor-pointer">
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </LogoutButton>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </header>

        <main className="p-6 pt-20 overflow-y-auto h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout() {
  return (
    <AuthGuard>
      <SidebarProvider>
        <DashboardContent />
      </SidebarProvider>
    </AuthGuard>
  );
}
