"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";
import { NotificationList } from "@/components/dashboard/notification-list";
import { notificationAPI, adminAPI } from "@/lib/api";

export default function NotificationsPage() {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [admins, setAdmins] = useState([]);

  const isSuperAdmin = user?.role === "superadmin";

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationAPI.getAll();
      setNotifications(response.data.data || []);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError("Failed to load notifications. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAdmins = async () => {
    if (!isSuperAdmin) return;

    try {
      const response = await adminAPI.getAll();
      setAdmins(response.data.data || []);
    } catch (err) {
      console.error("Error fetching admins:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchAdmins();
  }, [isSuperAdmin]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center py-12">
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
          onClick={fetchNotifications}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Notifications</h1>
      </div>

      <NotificationList
        notifications={notifications}
        isSuperAdmin={isSuperAdmin}
        refresh={fetchNotifications}
      />
    </div>
  );
}
