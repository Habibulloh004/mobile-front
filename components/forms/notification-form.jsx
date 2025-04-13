import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { notificationAPI } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";

export function NotificationForm({
  notification = null,
  isSuperAdmin = false,
  admins = [],
}) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    title: "",
    body: "",
    payload: "",
    admin_id: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  // Initialize form with existing notification data or current admin
  useEffect(() => {
    setIsMounted(true);

    if (notification) {
      setFormData({
        title: notification.title || "",
        body: notification.body || "",
        payload: notification.payload || "",
        admin_id: notification.admin_id || user?.id || 0,
      });
    } else {
      // For new notification, set admin_id to current user (if not super admin)
      setFormData((prev) => ({
        ...prev,
        admin_id: user?.id || 0,
      }));
    }

    return () => {
      setIsMounted(false);
    };
  }, [notification, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAdminChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      admin_id: parseInt(e.target.value, 10),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const notificationData = {
        ...formData,
      };

      // Add admin_id if super admin and admin is selected
      if (isSuperAdmin && formData.admin_id) {
        notificationData.admin_id = formData.admin_id;
      }

      if (notification) {
        // Update existing notification
        await notificationAPI.update(notification.id, notificationData);
      } else {
        // Create new notification
        await notificationAPI.create(notificationData);
      }

      // Redirect to notifications page
      router.push("/notifications");
      router.refresh();
    } catch (err) {
      console.error("Error saving notification:", err);
      setError(err.message || "Failed to save notification");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isMounted) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {notification ? "Edit Notification" : "Create Notification"}
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 rounded-md bg-red-50 text-red-500 text-sm">
              {error}
            </div>
          )}

          {/* Admin Selection for Super Admin */}
          {isSuperAdmin && (
            <div className="space-y-2">
              <label htmlFor="admin_id" className="text-sm font-medium">
                Select Admin
              </label>
              <select
                id="admin_id"
                name="admin_id"
                value={formData.admin_id}
                onChange={handleAdminChange}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                disabled={isLoading}
              >
                <option value="">Select an admin</option>
                {admins.map((admin) => (
                  <option key={admin.id} value={admin.id}>
                    {admin.company_name} ({admin.user_name})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Title field */}
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Title
            </label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter notification title"
              required
              disabled={isLoading}
            />
          </div>

          {/* Body field */}
          <div className="space-y-2">
            <label htmlFor="body" className="text-sm font-medium">
              Body
            </label>
            <textarea
              id="body"
              name="body"
              value={formData.body}
              onChange={handleChange}
              placeholder="Enter notification body"
              required
              className="w-full min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              disabled={isLoading}
            />
          </div>

          {/* Payload field */}
          <div className="space-y-2">
            <label htmlFor="payload" className="text-sm font-medium">
              Payload
            </label>
            <textarea
              id="payload"
              name="payload"
              value={formData.payload}
              onChange={handleChange}
              placeholder="Enter notification payload (JSON)"
              required
              className="w-full min-h-24 font-mono rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500">
              Enter a valid JSON payload with additional notification data
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/notifications")}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? "Saving..."
              : notification
              ? "Update Notification"
              : "Create Notification"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
