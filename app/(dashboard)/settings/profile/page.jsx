"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";
import { adminAPI } from "@/lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    user_name: "",
    email: "",
    company_name: "",
    sms_email: "",
    sms_password: "",
    payment_username: "",
    payment_password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        setIsLoading(true);

        let profile;
        if (user.role === "superadmin") {
          const response = await adminAPI.getSuperAdminProfile();
          profile = response.data.data;
        } else {
          const response = await adminAPI.getProfile();
          profile = response.data.data;
        }

        setFormData({
          user_name: profile.user_name || "",
          email: profile.email || "",
          company_name: profile.company_name || "",
          sms_email: profile.sms_email || "",
          sms_password: "", // Don't populate password for security
          payment_username: profile.payment_username || "",
          payment_password: "", // Don't populate password for security
        });
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const dataToUpdate = { ...formData };

      // Only include password fields if they are filled
      if (!dataToUpdate.sms_password) delete dataToUpdate.sms_password;
      if (!dataToUpdate.payment_password) delete dataToUpdate.payment_password;

      if (user.role === "admin") {
        await adminAPI.update(user.id, dataToUpdate);
      } else {
        // For super admin, handle differently if needed
        await adminAPI.update(user.id, dataToUpdate);
      }

      setSuccess("Profile updated successfully");
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(
        err.response?.data?.message ||
          "Failed to update profile. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Your Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 rounded-md bg-red-50 text-red-500 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 rounded-md bg-green-50 text-green-600 text-sm">
                {success}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="user_name" className="text-sm font-medium">
                  Username
                </label>
                <Input
                  id="user_name"
                  name="user_name"
                  value={formData.user_name}
                  onChange={handleChange}
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isSaving}
                />
              </div>

              {user?.role === "admin" && (
                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="company_name" className="text-sm font-medium">
                    Company Name
                  </label>
                  <Input
                    id="company_name"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleChange}
                    disabled={isSaving}
                  />
                </div>
              )}

              {user?.role === "admin" && (
                <>
                  <div className="space-y-2">
                    <label htmlFor="sms_email" className="text-sm font-medium">
                      SMS Email
                    </label>
                    <Input
                      id="sms_email"
                      name="sms_email"
                      type="email"
                      value={formData.sms_email}
                      onChange={handleChange}
                      disabled={isSaving}
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="sms_password"
                      className="text-sm font-medium"
                    >
                      SMS Password (leave blank to keep current)
                    </label>
                    <Input
                      id="sms_password"
                      name="sms_password"
                      type="password"
                      value={formData.sms_password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      disabled={isSaving}
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="payment_username"
                      className="text-sm font-medium"
                    >
                      Payment Username
                    </label>
                    <Input
                      id="payment_username"
                      name="payment_username"
                      value={formData.payment_username}
                      onChange={handleChange}
                      disabled={isSaving}
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="payment_password"
                      className="text-sm font-medium"
                    >
                      Payment Password (leave blank to keep current)
                    </label>
                    <Input
                      id="payment_password"
                      name="payment_password"
                      type="password"
                      value={formData.payment_password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      disabled={isSaving}
                    />
                  </div>
                </>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Update Profile"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
