import { useState } from "react";
import { useRouter } from "next/navigation";

import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export function AdminLoginForm() {
  const [formData, setFormData] = useState({
    user_name: "",
    system_id: "",
    email: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { adminLogin } = useAuthStore();

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
      await adminLogin(formData.user_name, formData.system_id, formData.email);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Food Business Login</CardTitle>
        <CardDescription>Sign in to your food business account</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 rounded-md bg-red-50 text-red-500 text-sm">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <label htmlFor="user_name" className="text-sm font-medium">
              Username
            </label>
            <Input
              id="user_name"
              name="user_name"
              type="text"
              placeholder="Enter your username"
              required
              value={formData.user_name}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="system_id" className="text-sm font-medium">
              System ID
            </label>
            <Input
              id="system_id"
              name="system_id"
              type="text"
              placeholder="Enter your system ID"
              required
              value={formData.system_id}
              onChange={handleChange}
              disabled={isLoading}
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
              placeholder="Enter your email address"
              required
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/sign-in")}
            disabled={isLoading}
          >
            Super Admin Login
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
