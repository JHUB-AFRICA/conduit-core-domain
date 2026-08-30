import { create } from "zustand";
import { persist } from "zustand/middleware";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      accessToken: null,
      refreshToken: null,
      apiKey: null, // Add API key to store
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_URL}/auth/login/`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.detail || "Login failed");
          }

          // Store tokens and user info
          set({
            accessToken: data.access,
            refreshToken: data.refresh,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          // Fetch user profile
          await get().fetchUser();

          // Fetch API key
          await get().fetchApiKey();

          return { success: true };
        } catch (error) {
          set({
            error: error.message,
            isLoading: false,
          });
          return { success: false, error: error.message };
        }
      },

      fetchUser: async () => {
        const { accessToken } = get();
        if (!accessToken) return;

        try {
          const response = await fetch(`${API_URL}/auth/me/`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

          if (!response.ok) {
            throw new Error("Failed to fetch user");
          }

          const userData = await response.json();
          set({ user: userData });
        } catch (error) {
          console.error("Error fetching user:", error);
        }
      },

      fetchApiKey: async () => {
        const { accessToken } = get();
        if (!accessToken) return;

        try {
          const response = await fetch(`${API_URL}/auth/api-keys/`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

          if (!response.ok) {
            throw new Error("Failed to fetch API keys");
          }

          const keysData = await response.json();

          // If user has an active API key, store it
          if (keysData && keysData.length > 0) {
            const activeKey = keysData.find((key) => key.is_active === true);
            if (activeKey) {
              set({ apiKey: activeKey.key });
            }
          }
        } catch (error) {
          console.error("Error fetching API key:", error);
        }
      },

      setApiKey: (key) => {
        set({ apiKey: key });
      },

      // Lets any authenticated view refresh the cached user object (e.g.
      // after re-fetching /auth/me/) without going through the full
      // login/fetchUser flow.
      setUser: (userData) => {
        set({ user: userData });
      },

      getApiKey: () => {
        return get().apiKey;
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          apiKey: null,
          isAuthenticated: false,
          error: null,
        });
        if (typeof window !== "undefined") {
          localStorage.removeItem("auth-storage");
        }
      },

      signup: async (email, username, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_URL}/auth/signup/`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, username, password }),
          });

          const data = await response.json();

          if (!response.ok) {
            if (data.email) {
              throw new Error(data.email[0]);
            }
            if (data.username) {
              throw new Error(data.username[0]);
            }
            throw new Error(data.detail || "Signup failed");
          }

          set({ isLoading: false, error: null });

          // Auto-login after signup
          const loginResult = await get().login(email, password);
          return { success: true, ...loginResult };
        } catch (error) {
          set({
            error: error.message,
            isLoading: false,
          });
          return { success: false, error: error.message };
        }
      },

      clearError: () => {
        set({ error: null });
      },

      // Get auth headers for API requests
      getAuthHeaders: () => {
        const { accessToken, apiKey } = get();
        const headers = {};

        if (accessToken) {
          headers["Authorization"] = `Bearer ${accessToken}`;
        }

        if (apiKey) {
          headers["x-api-key"] = apiKey;
        }

        return headers;
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        apiKey: state.apiKey,
      }),
    },
  ),
);

export default useAuthStore;
