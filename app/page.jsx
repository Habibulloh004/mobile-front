"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";

export default function HomePage() {
  const router = useRouter();
  const { token, user } = useAuthStore();

  useEffect(() => {
    if (token && user) {
      // If already authenticated, redirect to dashboard
      router.push("/dashboard");
    } else {
      // Otherwise, redirect to login
      router.push("/sign-in");
    }
  }, [token, user, router]);

  // Show loading indicator while redirecting
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
    </div>
  );
}
