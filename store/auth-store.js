import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authAPI } from "@/lib/api";
import Cookies from "js-cookie";

// Create auth store
export const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isLoading: false,
      error: null,

      // Super Admin Login
      superAdminLogin: async (login, password) => {
        try {
          set({ isLoading: true, error: null });
          const response = await authAPI.superAdminLogin(login, password);
          console.log(response, "super admin login api");

          const { token, user } = response.data.data;

          // Add role to user object
          const userWithRole = { ...user, role: "superadmin" };

          // Save token in cookie (7 days expiry)
          Cookies.set("token", token, { expires: 7, path: "/" });
          Cookies.set("role", "superadmin", { expires: 7, path: "/" });

          set({
            token,
            user: userWithRole,
            isLoading: false,
          });

          return response.data;
        } catch (error) {
          const errorMessage =
            error.response?.data?.message || "Failed to login";
          set({ error: errorMessage, isLoading: false });
          throw new Error(errorMessage);
        }
      },

      // Admin Login
      adminLogin: async (user_name, system_id, email) => {
        try {
          set({ isLoading: true, error: null });
          const response = await authAPI.adminLogin(
            user_name,
            system_id,
            email
          );
          const { token, user } = response.data.data;

          // Add role to user object
          const userWithRole = { ...user, role: "admin" };

          // Save token in cookie (7 days expiry)
          Cookies.set("token", token, { expires: 7, path: "/" });
          Cookies.set("role", "admin", { expires: 7, path: "/" });

          set({
            token,
            user: userWithRole,
            isLoading: false,
          });

          return response.data;
        } catch (error) {
          const errorMessage =
            error.response?.data?.message || "Failed to login";
          set({ error: errorMessage, isLoading: false });
          throw new Error(errorMessage);
        }
      },

      // Logout
      logout: () => {
        Cookies.remove("token", { path: "/" });
        Cookies.remove("role", { path: "/" });
        set({ token: null, user: null });
      },

      // Clear error
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: "auth-storage", // unique name for localStorage (still useful for user data)
    }
  )
);
