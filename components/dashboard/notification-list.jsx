import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash, Plus, Bell } from "lucide-react";
import { notificationAPI } from "@/lib/api";
import { formatDate, truncateText } from "@/lib/utils";

export function NotificationList({
  notifications = [],
  isSuperAdmin = false,
  refresh = () => {},
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this notification?")) {
      return;
    }

    setDeletingId(id);
    setLoading(true);

    try {
      await notificationAPI.delete(id);
      refresh();
    } catch (err) {
      console.error("Error deleting notification:", err);
      alert("Failed to delete notification. Please try again.");
    } finally {
      setDeletingId(null);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Notifications</h2>
        <Button
          onClick={() => router.push("/notifications/new")}
          disabled={loading}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Notification
        </Button>
      </div>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <p className="text-center text-gray-500 mb-4">
              No notifications found
            </p>
            <Button
              variant="outline"
              onClick={() => router.push("/notifications/new")}
              disabled={loading}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create your first notification
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card key={notification.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bell className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">{notification.title}</h3>
                      {isSuperAdmin && (
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          Admin ID: {notification.admin_id}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {notification.body}
                    </p>
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-gray-400">
                        Created: {formatDate(notification.created_at)}
                      </p>
                      <div className="space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            router.push(`/notifications/${notification.id}`)
                          }
                          disabled={loading}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(notification.id)}
                          disabled={loading || deletingId === notification.id}
                        >
                          {deletingId === notification.id ? (
                            <span>Deleting...</span>
                          ) : (
                            <>
                              <Trash className="w-4 h-4 mr-1" />
                              Delete
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
