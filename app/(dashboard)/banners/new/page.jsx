"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";
import { adminAPI } from "@/lib/api";
import { BannerForm } from "@/components/forms/banner-form";

export default function NewBannerPage() {
  const { user } = useAuthStore();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  const isSuperAdmin = user?.role === "superadmin";

  const fetchAdmins = async () => {
    if (!isSuperAdmin) {
      setLoading(false);
      return;
    }

    try {
      const response = await adminAPI.getAll();
      setAdmins(response.data.data || []);
    } catch (err) {
      console.error("Error fetching admins:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, [isSuperAdmin]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Create New Banner</h1>
      <BannerForm isSuperAdmin={isSuperAdmin} admins={admins} />
    </div>
  );
}
