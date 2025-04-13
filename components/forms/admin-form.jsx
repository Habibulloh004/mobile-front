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
import { adminAPI } from "@/lib/api";

export function AdminForm({ admin = null }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    user_name: "",
    email: "",
    company_name: "",
    system_id: "",
    system_token: "",
    sms_token: "",
    sms_email: "",
    sms_password: "",
    sms_message: "",
    payment_username: "",
    payment_password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  // Initialize form with existing admin data
  useEffect(() => {
    setIsMounted(true);

    if (admin) {
      setFormData({
        user_name: admin.user_name || "",
        email: admin.email || "",
        company_name: admin.company_name || "",
        system_id: admin.system_id || "",
        system_token: admin.system_token || "",
        sms_token: admin.sms_token || "",
        sms_email: admin.sms_email || "",
        sms_password: "", // Don't populate password fields for security
        sms_message: admin.sms_message || "",
        payment_username: admin.payment_username || "",
        payment_password: "", // Don't populate password fields for security
      });
    }

    return () => {
      setIsMounted(false);
    };
  }, [admin]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (admin) {
        // Update existing admin
        const dataToUpdate = { ...formData };

        // Only include password fields if they are filled
        if (!dataToUpdate.sms_password) delete dataToUpdate.sms_password;
        if (!dataToUpdate.payment_password)
          delete dataToUpdate.payment_password;

        await adminAPI.update(admin.id, dataToUpdate);
      } else {
        // Create new admin
        await adminAPI.create(formData);
      }

      // Redirect to admins page
      router.push("/admins");
      router.refresh();
    } catch (err) {
      console.error("Error saving admin:", err);
      setError(err.response?.data?.message || "Failed to save admin");
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
        <CardTitle>{admin ? "Edit Admin" : "Create Admin"}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 rounded-md bg-red-50 text-red-500 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Basic Information */}
            <div className="space-y-2">
              <label htmlFor="user_name" className="text-sm font-medium">
                Username *
              </label>
              <Input
                id="user_name"
                name="user_name"
                value={formData.user_name}
                onChange={handleChange}
                placeholder="Enter username"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email *
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email address"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label htmlFor="company_name" className="text-sm font-medium">
                Company Name *
              </label>
              <Input
                id="company_name"
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                placeholder="Enter company name"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="system_id" className="text-sm font-medium">
                System ID *
              </label>
              <Input
                id="system_id"
                name="system_id"
                value={formData.system_id}
                onChange={handleChange}
                placeholder="Enter system ID"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="system_token" className="text-sm font-medium">
                System Token {admin && "(Leave blank to keep current)"}
              </label>
              <Input
                id="system_token"
                name="system_token"
                value={formData.system_token}
                onChange={handleChange}
                placeholder="Enter system token"
                disabled={isLoading}
              />
            </div>
          </div>

          <hr className="my-4" />

          {/* SMS Configuration */}
          <h3 className="font-medium">SMS Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="sms_token" className="text-sm font-medium">
                SMS Token {admin && "(Leave blank to keep current)"}
              </label>
              <Input
                id="sms_token"
                name="sms_token"
                value={formData.sms_token}
                onChange={handleChange}
                placeholder="Enter SMS token"
                disabled={isLoading}
              />
            </div>

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
                placeholder="Enter SMS email"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="sms_password" className="text-sm font-medium">
                SMS Password {admin && "(Leave blank to keep current)"}
              </label>
              <Input
                id="sms_password"
                name="sms_password"
                type="password"
                value={formData.sms_password}
                onChange={handleChange}
                placeholder="Enter SMS password"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label htmlFor="sms_message" className="text-sm font-medium">
                SMS Message Template
              </label>
              <textarea
                id="sms_message"
                name="sms_message"
                value={formData.sms_message}
                onChange={handleChange}
                placeholder="Enter SMS message template"
                className="w-full min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                disabled={isLoading}
              />
            </div>
          </div>

          <hr className="my-4" />

          {/* Payment Configuration */}
          <h3 className="font-medium">Payment Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="payment_username" className="text-sm font-medium">
                Payment Username
              </label>
              <Input
                id="payment_username"
                name="payment_username"
                value={formData.payment_username}
                onChange={handleChange}
                placeholder="Enter payment username"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="payment_password" className="text-sm font-medium">
                Payment Password {admin && "(Leave blank to keep current)"}
              </label>
              <Input
                id="payment_password"
                name="payment_password"
                type="password"
                value={formData.payment_password}
                onChange={handleChange}
                placeholder="Enter payment password"
                disabled={isLoading}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admins")}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : admin ? "Update Admin" : "Create Admin"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
