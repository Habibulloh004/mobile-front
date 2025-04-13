"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { adminAPI } from "@/lib/api";
import { AdminForm } from "@/components/forms/admin-form";

export default function EditAdminPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const adminId = params.id;
  const isSuperAdmin = user?.role === "superadmin";

  const fetchAdmin = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getById(adminId);
      setAdmin(response.data.data);
    } catch (err) {
      console.error("Error fetching admin:", err);
      setError(
        "Failed to load admin. It may have been deleted or you do not have permission to view it."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only super admins can access this page
    if (!isSuperAdmin) {
      router.push("/dashboard");
      return;
    }

    fetchAdmin();
  }, [adminId, isSuperAdmin, router]);

  if (!isSuperAdmin) {
    return null; // Will redirect in useEffect
  }

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
          onClick={() => router.push("/admins")}
        >
          Back to Admins
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Edit Admin</h1>
      {admin && <AdminForm admin={admin} />}
    </div>
  );
}
