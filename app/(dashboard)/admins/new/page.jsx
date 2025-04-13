"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { AdminForm } from "@/components/forms/admin-form";

export default function NewAdminPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const isSuperAdmin = user?.role === "superadmin";

  useEffect(() => {
    // Only super admins can access this page
    if (!isSuperAdmin) {
      router.push("/dashboard");
    }
  }, [isSuperAdmin, router]);

  if (!isSuperAdmin) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="max-w-4xl mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Create New Admin</h1>
      <AdminForm />
    </div>
  );
}
