import axios from "axios";

// Define the base URL for API requests
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

// Create an axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to attach the auth token
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage when in browser environment
    if (typeof window !== "undefined") {
      // Try to get token from Zustand store first via localStorage
      let token = null;

      try {
        const authStore = JSON.parse(localStorage.getItem("auth-storage"));
        if (authStore?.state?.token) {
          token = authStore.state.token;
        }
      } catch (e) {
        console.error("Error getting token from storage:", e);
      }

      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors (token expired)
    if (error.response && error.response.status === 401) {
      // If we're in a browser environment, clear auth state and redirect to login
      if (typeof window !== "undefined") {
        // Clear auth storage
        localStorage.removeItem("auth-storage");
        // window.location.href = "/sign-in";
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  superAdminLogin: (login, password) =>
    api.post("/auth/superadmin/login", { login, password }),

  adminLogin: (user_name, system_id, email) =>
    api.post("/auth/admin/login", { user_name, system_id, email }),

  changePassword: (old_password, new_password) =>
    api.post("/superadmin/change-password", { old_password, new_password }),
};

// Admin API
export const adminAPI = {
  getProfile: () => api.get("/admin/profile"),
  getSuperAdminProfile: () => api.get("/superadmin/profile"),
  getAll: () => api.get("/admins"),
  getById: (id) => api.get(`/admins/${id}`),
  create: (admin) => api.post("/admins", admin),
  update: (id, admin) => api.put(`/admins/${id}`, admin),
  delete: (id) => api.delete(`/admins/${id}`),
};

// Banner API
export const bannerAPI = {
  getAll: () => api.get("/banners"),
  getById: (id) => api.get(`/banners/${id}`),
  create: (banner) => api.post("/banners", banner),
  update: (id, banner) => api.put(`/banners/${id}`, banner),
  delete: (id) => api.delete(`/banners/${id}`),
  getAllByAdminId: (adminId) => api.get(`/public/banners/admin/${adminId}`),
};

// Notification API
export const notificationAPI = {
  getAll: () => api.get("/notifications"),
  getById: (id) => api.get(`/notifications/${id}`),
  create: (notification) => api.post("/notifications", notification),
  update: (id, notification) => api.put(`/notifications/${id}`, notification),
  delete: (id) => api.delete(`/notifications/${id}`),
  getAllByAdminId: (adminId, skip = 0, step = 10) =>
    api.get(`/public/notifications/admin/${adminId}?skip=${skip}&step=${step}`),
};

// FCM Token API
export const fcmTokenAPI = {
  getAll: () => api.get("/fcm-tokens"),
  create: (fcmToken) => api.post("/fcm-tokens", { fcm_token: fcmToken }),
  delete: (id) => api.delete(`/fcm-tokens/${id}`),
  deleteByToken: (token) => api.post("/fcm-tokens/delete-by-token", { token }),
};

// Image API
export const imageAPI = {
  upload: (formData) => {
    return api.post("/images", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};

// Subscription API
export const subscriptionAPI = {
  getAllTiers: () => api.get("/public/subscription-tiers"),
  getSubscriptionInfo: () => api.get("/payments/subscription"),
  recordPayment: (payment) => api.post("/payments", payment),
  getAllPayments: () => api.get("/payments"),
  getPaymentById: (id) => api.get(`/superadmin/payments/${id}`),
  getPendingPayments: () => api.get("/superadmin/payments/pending"),
  verifyPayment: (id, status, notes, periodStart, periodEnd) =>
    api.post(`/superadmin/payments/${id}/verify`, {
      status,
      notes,
      period_start: periodStart,
      period_end: periodEnd,
    }),
};

export default api;
