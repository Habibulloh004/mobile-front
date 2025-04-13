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
          const { token, user } = response.data.data;

          // Add role to user object
          const userWithRole = { ...user, role: "superadmin" };

          // Save token in cookie (7 days expiry)
          Cookies.set("token", token, { expires: 7, path: "/" });

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
        // Remove token from cookie
        Cookies.remove("token", { path: "/" });

        set({ token: null, user: null });
      },

      // Clear error
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: "auth-storage", // unique name for localStorage (still useful for user data)
      partialize: (state) => ({ user: state.user }), // only persist user info in localStorage
    }
  )
);
