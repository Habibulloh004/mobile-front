"use client";
import { AdminLoginForm } from "@/components/forms/admin-login-form";

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Food Admin</h1>
          <p className="mt-2 text-gray-600">
            Sign in to your food business account
          </p>
        </div>

        <AdminLoginForm />
      </div>
    </div>
  );
}
