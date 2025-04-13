import { useState } from "react";
import { useAuthStore } from "@/store/auth-store";
import { Bell, User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header({ onToggleSidebar }) {
  const { user } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          className="mr-2 lg:hidden"
          onClick={onToggleSidebar}
        >
          <Menu />
        </Button>
        <div>
          <h1 className="text-lg font-medium">Dashboard</h1>
          <p className="text-sm text-gray-500">
            Welcome back, {user?.user_name || "Admin"}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </Button>

        <div className="relative">
          <Button
            variant="ghost"
            className="flex items-center"
            onClick={toggleUserMenu}
          >
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-2">
              <User size={16} />
            </div>
            <span className="hidden sm:block">
              {user?.role === "superadmin" ? "Super Admin" : user?.company_name}
            </span>
          </Button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border">
              <div className="px-4 py-2 border-b">
                <p className="text-sm font-medium">
                  {user?.user_name || user?.login}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <a
                href="/settings/profile"
                className="block px-4 py-2 text-sm hover:bg-gray-100"
              >
                Profile Settings
              </a>
              {user?.role !== "superadmin" && (
                <a
                  href="/settings/subscription"
                  className="block px-4 py-2 text-sm hover:bg-gray-100"
                >
                  Subscription
                </a>
              )}
              <a
                href="/sign-in"
                onClick={() => useAuthStore.getState().logout()}
                className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              >
                Logout
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
