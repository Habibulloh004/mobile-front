"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, UserPlus, CreditCard, BellRing } from "lucide-react";
import { formatNumber, formatCurrency, formatDate } from "@/lib/utils";
import { bannerAPI, notificationAPI, subscriptionAPI } from "@/lib/api";

export default function Page() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    banners: 0,
    notifications: 0,
    users: 0,
    subscription: null,
  });
  const [loading, setLoading] = useState(true);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);

        // Fetch banners
        const bannersResponse = await bannerAPI.getAll();
        const banners = bannersResponse.data.data || [];

        // Fetch notifications
        const notificationsResponse = await notificationAPI.getAll();
        const notifications = notificationsResponse.data.data || [];

        // Fetch recent notifications (up to 5)
        const recentNotifs = notifications.slice(0, 5);

        // Fetch subscription info if not super admin
        let subscriptionInfo = null;
        if (user?.role !== "superadmin") {
          try {
            const subscriptionResponse =
              await subscriptionAPI.getSubscriptionInfo();
            subscriptionInfo = subscriptionResponse.data.data;
          } catch (err) {
            console.error("Error fetching subscription info:", err);
          }
        }

        setStats({
          banners: banners.length,
          notifications: notifications.length,
          users: user?.role === "admin" ? user.users || 0 : 0,
          subscription: subscriptionInfo,
        });

        setRecentNotifications(recentNotifs);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          className="px-4 py-2 bg-primary text-white rounded-md"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard Overview</h1>

      {/* Stats grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Banners</CardTitle>
            <BarChart className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.banners}</div>
            <p className="text-xs text-gray-500">Active banner campaigns</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Notifications</CardTitle>
            <BellRing className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.notifications}</div>
            <p className="text-xs text-gray-500">Push notifications sent</p>
          </CardContent>
        </Card>

        {user?.role === "admin" && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <UserPlus className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(stats.users)}
              </div>
              <p className="text-xs text-gray-500">Active app users</p>
            </CardContent>
          </Card>
        )}

        {stats.subscription && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Subscription
              </CardTitle>
              <CreditCard className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.subscription.subscription_status || "N/A"}
              </div>
              <p className="text-xs text-gray-500">
                {stats.subscription.subscription_expires_at
                  ? `Expires: ${formatDate(
                      stats.subscription.subscription_expires_at
                    )}`
                  : "No active subscription"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent notifications */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Recent Notifications</h2>

        {recentNotifications.length === 0 ? (
          <div className="bg-white rounded-lg border p-6 text-center">
            <p className="text-gray-500">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentNotifications.map((notification) => (
              <Card key={notification.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <BellRing className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{notification.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {notification.body}
                      </p>
                      <div className="text-xs text-gray-400 mt-2">
                        {formatDate(notification.created_at)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
