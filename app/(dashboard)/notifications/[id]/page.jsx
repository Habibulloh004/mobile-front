"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { notificationAPI, adminAPI } from "@/lib/api";
import { NotificationForm } from "@/components/forms/notification-form";

export default function EditNotificationPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [notification, setNotification] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const notificationId = params.id;
  const isSuperAdmin = user?.role === "superadmin";

  const fetchNotification = async () => {
    try {
      setLoading(true);
      const response = await notificationAPI.getById(notificationId);
      setNotification(response.data.data);

      // If not super admin, check if the notification belongs to the current admin
      if (!isSuperAdmin && response.data.data.admin_id !== user?.id) {
        setError("You do not have permission to edit this notification");
        router.push("/notifications");
      }
    } catch (err) {
      console.error("Error fetching notification:", err);
      setError(
        "Failed to load notification. It may have been deleted or you do not have permission to view it."
      );
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
    fetchNotification();
    fetchAdmins();
  }, [notificationId, isSuperAdmin, user]);

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
          onClick={() => router.push("/notifications")}
        >
          Back to Notifications
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Edit Notification</h1>
      {notification && (
        <NotificationForm
          notification={notification}
          isSuperAdmin={isSuperAdmin}
          admins={admins}
        />
      )}
    </div>
  );
}
