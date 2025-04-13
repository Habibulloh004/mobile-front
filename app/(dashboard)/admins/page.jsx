"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { AdminList } from "@/components/dashboard/admin-list";
import { adminAPI } from "@/lib/api";

export default function AdminsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isSuperAdmin = user?.role === "superadmin";

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAll();
      setAdmins(response.data.data || []);
    } catch (err) {
      console.error("Error fetching admins:", err);
      setError("Failed to load admins. Please try again later.");
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

    fetchAdmins();
  }, [isSuperAdmin, router]);

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
          onClick={fetchAdmins}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Manage Food Business Admins</h1>
      </div>

      <AdminList admins={admins} refresh={fetchAdmins} />
    </div>
  );
}
