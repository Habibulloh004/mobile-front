import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash, Plus, Users, Store, Mail, AtSign } from "lucide-react";
import { adminAPI } from "@/lib/api";
import { formatDate, formatNumber } from "@/lib/utils";

export function AdminList({ admins = [], refresh = () => {} }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this admin? This action cannot be undone."
      )
    ) {
      return;
    }

    setDeletingId(id);
    setLoading(true);

    try {
      await adminAPI.delete(id);
      refresh();
    } catch (err) {
      console.error("Error deleting admin:", err);
      alert("Failed to delete admin. Please try again.");
    } finally {
      setDeletingId(null);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Food Business Admins</h2>
        <Button onClick={() => router.push("/admins/new")} disabled={loading}>
          <Plus className="w-4 h-4 mr-2" />
          Add Admin
        </Button>
      </div>

      {admins.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <p className="text-center text-gray-500 mb-4">No admins found</p>
            <Button
              variant="outline"
              onClick={() => router.push("/admins/new")}
              disabled={loading}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create your first admin
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {admins.map((admin) => (
            <Card key={admin.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Store className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {admin.company_name}
                        </h3>
                        <div className="flex items-center text-sm text-gray-600">
                          <AtSign className="h-3 w-3 mr-1" />
                          <span>{admin.user_name}</span>
                        </div>
                      </div>
                      <div className="flex flex-col sm:items-end text-sm">
                        <div className="flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          <span>{admin.email}</span>
                        </div>
                        <div className="flex items-center text-green-600">
                          <Users className="h-3 w-3 mr-1" />
                          <span>{formatNumber(admin.users)} users</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs text-gray-500 my-2">
                      <div>
                        <span className="font-medium">System ID:</span>{" "}
                        {admin.system_id}
                      </div>
                      <div>
                        <span className="font-medium">Created:</span>{" "}
                        {formatDate(admin.created_at)}
                      </div>
                      <div>
                        <span className="font-medium">Updated:</span>{" "}
                        {formatDate(admin.updated_at)}
                      </div>
                    </div>

                    <div className="flex flex-wrap justify-end gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/admins/${admin.id}`)}
                        disabled={loading}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(admin.id)}
                        disabled={loading || deletingId === admin.id}
                      >
                        {deletingId === admin.id ? (
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
