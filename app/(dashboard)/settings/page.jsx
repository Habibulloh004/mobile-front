"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserCircle, CreditCard, Settings } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const settings = [
    {
      title: "Profile Settings",
      description: "Manage your account information",
      icon: <UserCircle className="h-8 w-8 text-primary" />,
      href: "/settings/profile",
      available: true, // Available for all users
    },
    {
      title: "Subscription",
      description: "View and manage your subscription plan",
      icon: <Settings className="h-8 w-8 text-primary" />,
      href: "/settings/subscription",
      available: user?.role === "admin", // Only for regular admins
    },
    {
      title: "Payment",
      description: "Make payments and view payment history",
      icon: <CreditCard className="h-8 w-8 text-primary" />,
      href: "/settings/payment",
      available: user?.role === "admin", // Only for regular admins
    },
  ];

  return (
    <div className="max-w-4xl mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {settings
          .filter((setting) => setting.available)
          .map((setting, index) => (
            <Card
              key={index}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => router.push(setting.href)}
            >
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4">{setting.icon}</div>
                  <h2 className="text-lg font-medium mb-2">{setting.title}</h2>
                  <p className="text-sm text-gray-500 mb-4">
                    {setting.description}
                  </p>
                  <Button variant="outline" size="sm">
                    Manage
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
}
