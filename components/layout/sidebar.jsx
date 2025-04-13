import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import {
  LayoutDashboard,
  Users,
  Image,
  Bell,
  Settings,
  CreditCard,
  LogOut,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [activeItem, setActiveItem] = useState("");
  const [openSubmenu, setOpenSubmenu] = useState("");

  const isSuperAdmin = user?.role === "superadmin";

  useEffect(() => {
    // Set the active menu item based on the current path
    const path = pathname.split("/")[1] || "dashboard";
    setActiveItem(path);

    // If we're in a submenu, open that menu
    if (pathname.startsWith("/settings")) {
      setOpenSubmenu("settings");
    }
  }, [pathname]);

  const handleLogout = () => {
    logout();
    window.location.href = "/sign-in";
  };

  const toggleSubmenu = (menu) => {
    setOpenSubmenu(openSubmenu === menu ? "" : menu);
  };

  const menuItems = [
    {
      name: "Dashboard",
      icon: <LayoutDashboard size={20} />,
      path: "/dashboard",
      id: "dashboard",
    },
    isSuperAdmin && {
      name: "Admins",
      icon: <Users size={20} />,
      path: "/admins",
      id: "admins",
    },
    {
      name: "Banners",
      icon: <Image size={20} />,
      path: "/banners",
      id: "banners",
    },
    {
      name: "Notifications",
      icon: <Bell size={20} />,
      path: "/notifications",
      id: "notifications",
    },
    {
      name: "Settings",
      icon: <Settings size={20} />,
      id: "settings",
      submenu: [
        {
          name: "Profile",
          path: "/settings/profile",
          id: "profile",
        },
        {
          name: "Subscription",
          path: "/settings/subscription",
          id: "subscription",
        },
        {
          name: "Payment",
          path: "/settings/payment",
          id: "payment",
        },
      ],
    },
  ].filter(Boolean);

  return (
    <div className="h-screen w-64 border-r bg-white flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-2">Food Admin</h1>
        <p className="text-sm text-gray-500 mb-6">
          {user?.company_name || "Admin Panel"}
        </p>

        <div className="space-y-1">
          {menuItems.map((item) => (
            <div key={item.id}>
              {item.submenu ? (
                <div>
                  <button
                    onClick={() => toggleSubmenu(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-2 text-sm rounded-md ${
                      openSubmenu === item.id
                        ? "bg-gray-100"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <span className="flex items-center">
                      {item.icon}
                      <span className="ml-3">{item.name}</span>
                    </span>
                    {openSubmenu === item.id ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    )}
                  </button>

                  {openSubmenu === item.id && (
                    <div className="pl-8 mt-1 space-y-1">
                      {item.submenu.map((subitem) => (
                        <Link
                          key={subitem.id}
                          href={subitem.path}
                          className={`block px-4 py-2 text-sm rounded-md ${
                            pathname === subitem.path
                              ? "bg-gray-100 font-medium"
                              : "hover:bg-gray-100"
                          }`}
                        >
                          {subitem.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href={item.path}
                  className={`flex items-center px-4 py-2 text-sm rounded-md ${
                    activeItem === item.id
                      ? "bg-gray-100 font-medium"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {item.icon}
                  <span className="ml-3">{item.name}</span>
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto p-4 border-t">
        <button
          onClick={handleLogout}
          className="flex items-center px-4 py-2 text-sm text-red-600 rounded-md hover:bg-red-50 w-full"
        >
          <LogOut size={20} />
          <span className="ml-3">Logout</span>
        </button>
      </div>
    </div>
  );
}
