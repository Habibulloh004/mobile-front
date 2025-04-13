import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash, Plus, ExternalLink } from "lucide-react";
import { bannerAPI } from "@/lib/api";
import { formatDate, getImageUrl, truncateText } from "@/lib/utils";

export function BannerList({
  banners = [],
  isSuperAdmin = false,
  refresh = () => {},
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this banner?")) {
      return;
    }

    setDeletingId(id);
    setLoading(true);

    try {
      await bannerAPI.delete(id);
      refresh();
    } catch (err) {
      console.error("Error deleting banner:", err);
      alert("Failed to delete banner. Please try again.");
    } finally {
      setDeletingId(null);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Banners</h2>
        <Button onClick={() => router.push("/banners/new")} disabled={loading}>
          <Plus className="w-4 h-4 mr-2" />
          Add Banner
        </Button>
      </div>

      {banners.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <p className="text-center text-gray-500 mb-4">No banners found</p>
            <Button
              variant="outline"
              onClick={() => router.push("/banners/new")}
              disabled={loading}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create your first banner
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {banners.map((banner) => (
            <Card
              key={banner.id}
              className="overflow-hidden flex flex-col h-full"
            >
              <div className="aspect-video w-full overflow-hidden bg-gray-100">
                {banner.image ? (
                  <img
                    src={getImageUrl(banner.image)}
                    alt={banner.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <span className="text-gray-400">No image</span>
                  </div>
                )}
              </div>
              <CardContent className="flex-1 p-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold">{banner.title}</h3>
                    {isSuperAdmin && (
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        Admin ID: {banner.admin_id}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {truncateText(banner.body, 100)}
                  </p>
                  <p className="text-xs text-gray-400">
                    Created: {formatDate(banner.created_at)}
                  </p>
                </div>
                <div className="flex justify-between mt-4">
                  <div className="space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/banners/${banner.id}`)}
                      disabled={loading}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(banner.id)}
                      disabled={loading || deletingId === banner.id}
                    >
                      {deletingId === banner.id ? (
                        <span>Deleting...</span>
                      ) : (
                        <>
                          <Trash className="w-4 h-4 mr-1" />
                          Delete
                        </>
                      )}
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      window.open(
                        `/api/uploads/images/${banner.image}`,
                        "_blank"
                      )
                    }
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
