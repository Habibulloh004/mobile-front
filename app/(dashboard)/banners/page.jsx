"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";
import { BannerList } from "@/components/dashboard/banner-list";
import { bannerAPI, adminAPI } from "@/lib/api";

export default function BannersPage() {
  const { user } = useAuthStore();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [admins, setAdmins] = useState([]);

  const isSuperAdmin = user?.role === "superadmin";

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await bannerAPI.getAll();
      setBanners(response.data.data || []);
    } catch (err) {
      console.error("Error fetching banners:", err);
      setError("Failed to load banners. Please try again later.");
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
    fetchBanners();
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
          onClick={fetchBanners}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Banners</h1>
      </div>

      <BannerList
        banners={banners}
        isSuperAdmin={isSuperAdmin}
        refresh={fetchBanners}
      />
    </div>
  );
}
