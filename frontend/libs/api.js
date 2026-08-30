// // src/lib/api.js
// import useAuthStore from "../store";

// const API_URL = process.env.NEXT_PUBLIC_API_URL;

// export const apiClient = {
//   async request(endpoint, options = {}) {
//     // Get authentication headers from Zustand store
//     const { getAuthHeaders } = useAuthStore.getState();
//     const authHeaders = getAuthHeaders();

//     // Make the actual request
//     const response = await fetch(`${API_URL}${endpoint}`, {
//       ...options,
//       headers: {
//         "Content-Type": "application/json",
//         ...authHeaders,
//         ...options.headers,
//       },
//     });

//     // Handle unauthorized errors
//     if (response.status === 401) {
//       const { logout } = useAuthStore.getState();
//       logout();
//       window.location.href = "/auth/sign-in";
//       throw new Error("Session expired. Please sign in again.");
//     }

//     // Parse response
//     const data = await response.json();

//     if (!response.ok) {
//       throw new Error(data.detail || data.message || "Request failed");
//     }

//     return data;
//   },

//   // Convenience methods
//   get(endpoint, options = {}) {
//     return this.request(endpoint, { ...options, method: "GET" });
//   },

//   post(endpoint, body, options = {}) {
//     return this.request(endpoint, {
//       ...options,
//       method: "POST",
//       body: JSON.stringify(body),
//     });
//   },

//   put(endpoint, body, options = {}) {
//     return this.request(endpoint, {
//       ...options,
//       method: "PUT",
//       body: JSON.stringify(body),
//     });
//   },

//   delete(endpoint, options = {}) {
//     return this.request(endpoint, { ...options, method: "DELETE" });
//   },
// };

import useAuthStore from "../store";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL && typeof window !== "undefined") {
  // Fail loudly in dev rather than silently fetching "undefined/...".
  console.error(
    "NEXT_PUBLIC_API_URL is not set. Copy .env.local.example to .env.local and restart the dev server.",
  );
}

export const apiClient = {
  async request(endpoint, options = {}) {
    // Get auth headers from Zustand store. The store may hold a JWT access
    // token (dashboard / webhook management endpoints) and/or an API key
    // (telemetry + alerts read endpoints) — both are attached, and each
    // backend view simply ignores whichever header it doesn't use.
    const { getAuthHeaders } = useAuthStore.getState();
    const authHeaders = getAuthHeaders();

    const isFormData =
      typeof FormData !== "undefined" && options.body instanceof FormData;

    const headers = {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...authHeaders,
      ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Handle unauthorized errors (expired/invalid JWT). Don't do this for
    // the login/refresh endpoints themselves, where a 401 just means "bad
    // credentials" rather than "session expired".
    const isAuthEndpoint =
      endpoint.startsWith("/auth/login") || endpoint.startsWith("/auth/refresh");

    if (response.status === 401 && !isAuthEndpoint) {
      const { logout } = useAuthStore.getState();
      logout();
      if (typeof window !== "undefined") {
        window.location.href = "/auth/sign-in";
      }
      throw new Error("Session expired. Please sign in again.");
    }

    // Some endpoints (DELETE on API keys / webhook subscriptions) return
    // 204 No Content — there is no body to parse.
    if (response.status === 204) {
      return null;
    }

    const text = await response.text();
    const data = text ? JSON.parse(text) : null;

    if (!response.ok) {
      const message =
        (data && (data.detail || data.error || data.message)) ||
        (data && typeof data === "object" && Object.values(data)[0]?.[0]) ||
        `Request failed (${response.status})`;
      throw new Error(message);
    }

    return data;
  },

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: "GET" });
  },

  post(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  put(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(body),
    });
  },

  patch(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: "DELETE" });
  },
};
