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
import { imageAPI, bannerAPI } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { getImageUrl } from "@/lib/utils";

export function BannerForm({
  banner = null,
  isSuperAdmin = false,
  admins = [],
}) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    title: "",
    body: "",
    image: "",
    admin_id: 0,
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  // Initialize form with existing banner data or current admin
  useEffect(() => {
    setIsMounted(true);

    if (banner) {
      setFormData({
        title: banner.title || "",
        body: banner.body || "",
        image: banner.image || "",
        admin_id: banner.admin_id || user?.id || 0,
      });

      if (banner.image) {
        setImagePreview(getImageUrl(banner.image));
      }
    } else {
      // For new banner, set admin_id to current user (if not super admin)
      setFormData((prev) => ({
        ...prev,
        admin_id: user?.id || 0,
      }));
    }

    return () => {
      setIsMounted(false);
    };
  }, [banner, user]);

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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);

    // Create URL for preview
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  const uploadImage = async () => {
    if (!selectedFile) return formData.image;

    const formDataObj = new FormData();
    formDataObj.append("image", selectedFile);

    try {
      const response = await imageAPI.upload(formDataObj);
      return response.data.data.filename;
    } catch (err) {
      throw new Error("Failed to upload image");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      let imageUrl = formData.image;

      // Upload image if a new file is selected
      if (selectedFile) {
        imageUrl = await uploadImage();
      }

      const bannerData = {
        ...formData,
        image: imageUrl,
      };

      // Add admin_id if super admin and admin is selected
      if (isSuperAdmin && formData.admin_id) {
        bannerData.admin_id = formData.admin_id;
      }

      if (banner) {
        // Update existing banner
        await bannerAPI.update(banner.id, bannerData);
      } else {
        // Create new banner
        await bannerAPI.create(bannerData);
      }

      // Redirect to banners page
      router.push("/banners");
      router.refresh();
    } catch (err) {
      console.error("Error saving banner:", err);
      setError(err.message || "Failed to save banner");
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
        <CardTitle>{banner ? "Edit Banner" : "Create Banner"}</CardTitle>
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
              placeholder="Enter banner title"
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
              placeholder="Enter banner description"
              required
              className="w-full min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              disabled={isLoading}
            />
          </div>

          {/* Image field */}
          <div className="space-y-2">
            <label htmlFor="image" className="text-sm font-medium">
              Banner Image
            </label>
            <Input
              id="image"
              name="image"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full"
              disabled={isLoading}
            />
            {imagePreview && (
              <div className="mt-2">
                <p className="text-sm mb-2">Preview:</p>
                <img
                  src={imagePreview}
                  alt="Banner preview"
                  className="max-w-full h-auto max-h-48 rounded-md border"
                />
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/banners")}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? "Saving..."
              : banner
              ? "Update Banner"
              : "Create Banner"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
