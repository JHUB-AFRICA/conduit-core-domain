"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import {
  PageHeader,
  TabNavigation,
  ProfileSection,
  ApiAccessSection,
  RegenerateModal,
} from "../../components/account";
import useAuthStore from "../../store";
import { apiClient } from "../../libs/api";

export default function DashboardPage() {
  const router = useRouter();
  const {
    isAuthenticated,
    logout,
    setApiKey: setStoreApiKey,
  } = useAuthStore();
  const [activeTab, setActiveTab] = useState("account");
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);

  // User data state (from API)
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    memberSince: "",
  });

  // API Key data
  const [apiKey, setApiKey] = useState("");
  const [apiKeyStatus, setApiKeyStatus] = useState("");
  const [apiKeyCreated, setApiKeyCreated] = useState("");
  const [apiKeys, setApiKeys] = useState([]);
  const [hasApiKey, setHasApiKey] = useState(false);

  // Usage data
  const [usageData, setUsageData] = useState({
    daily_quota: 10000,
    requests_today: 0,
    requests_remaining: 10000,
    requests_per_minute: 60,
    requests_this_minute: 0,
    total_requests: 0,
  });

  const [statusMessage, setStatusMessage] = useState("");

  // State for regenerate modal
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);

  // State for copy
  const [copied, setCopied] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/sign-in");
    }
  }, [isAuthenticated, router]);

  const formatDate = (value) =>
    value
      ? new Date(value).toLocaleDateString("en-US", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "N/A";

  // Fetch user data from API
  const fetchDashboardData = async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    try {
      // Fetch user profile — GET /api/v1/auth/me/
      const userResponse = await apiClient.get("/auth/me/");
      setUserData({
        username: userResponse.username || "",
        email: userResponse.email || "",
        memberSince: formatDate(userResponse.date_joined),
      });

      // Fetch API keys — GET /api/v1/auth/api-keys/
      const keysResponse = await apiClient.get("/auth/api-keys/");
      setApiKeys(keysResponse);

      if (keysResponse && keysResponse.length > 0) {
        const activeKey =
          keysResponse.find((k) => k.is_active) || keysResponse[0];
        setApiKey(activeKey.key || "••••••••••••••••••••");
        setApiKeyStatus(activeKey.is_active ? "Active" : "Inactive");
        setApiKeyCreated(formatDate(activeKey.created_at));
        setHasApiKey(true);

        // Store API key in Zustand so it's attached to every X-API-KEY
        // request the rest of the app makes (data portal, alerts, etc.)
        if (activeKey.key) {
          setStoreApiKey(activeKey.key);
        }

        // Fetch API usage — GET /api/v1/auth/api-usage/
        try {
          const usageResponse = await apiClient.get("/auth/api-usage/");
          setUsageData({
            daily_quota: usageResponse.daily_quota ?? 10000,
            requests_today: usageResponse.requests_today ?? 0,
            requests_remaining: usageResponse.requests_remaining ?? 10000,
            requests_per_minute: usageResponse.requests_per_minute ?? 60,
            requests_this_minute: usageResponse.requests_this_minute ?? 0,
            total_requests: usageResponse.total_requests ?? 0,
          });
        } catch (usageError) {
          console.error("Error fetching usage data:", usageError);
        }
      } else {
        setHasApiKey(false);
        setApiKey("");
        setApiKeyStatus("");
        setApiKeyCreated("");
        setStoreApiKey(null);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      if (error.message.includes("401") || error.message.includes("403")) {
        logout();
        router.push("/auth/sign-in");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const showStatus = (message) => {
    setStatusMessage(message);
    setTimeout(() => setStatusMessage(""), 5000);
  };

  // Handle API key generation — POST /api/v1/auth/api-keys/create/
  const handleGenerateKey = async () => {
    setIsGeneratingKey(true);
    try {
      const response = await apiClient.post("/auth/api-keys/create/", {
        name: "Default Key",
      });

      setApiKey(response.key || "••••••••••••••••••••");
      setApiKeyStatus("Active");
      setApiKeyCreated(formatDate(new Date().toISOString()));
      setHasApiKey(true);

      if (response.key) {
        setStoreApiKey(response.key);
      }

      const keysResponse = await apiClient.get("/auth/api-keys/");
      setApiKeys(keysResponse);

      showStatus("✓ API key generated successfully!");
    } catch (error) {
      console.error("Error generating API key:", error);
      showStatus(`✗ ${error.message || "Failed to generate API key."}`);
    } finally {
      setIsGeneratingKey(false);
    }
  };

  // Handle copy API key
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  // Handle regenerate — DELETE the old key, then POST a new one. The
  // backend has no single "rotate" endpoint, so this is two calls against
  // the real APIKeyDeleteView / APIKeyCreateView.
  const handleRegenerate = async () => {
    setIsLoading(true);
    try {
      if (apiKeys.length > 0) {
        await apiClient.delete(`/auth/api-keys/${apiKeys[0].id}/`);
      }

      const response = await apiClient.post("/auth/api-keys/create/", {
        name: "Default Key",
      });

      setApiKey(response.key || "••••••••••••••••••••");
      setApiKeyStatus("Active");
      setApiKeyCreated(formatDate(new Date().toISOString()));
      setHasApiKey(true);

      if (response.key) {
        setStoreApiKey(response.key);
      }

      setShowRegenerateModal(false);
      showStatus("✓ API key regenerated successfully!");

      const keysResponse = await apiClient.get("/auth/api-keys/");
      setApiKeys(keysResponse);
    } catch (error) {
      console.error("Error regenerating API key:", error);
      showStatus(`✗ ${error.message || "Failed to regenerate API key."}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <div className="min-h-screen border-t border-line bg-bg py-8">
        <div className="mx-auto max-w-4xl px-4">
          <PageHeader />

          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
            </div>
          )}

          {!isLoading && (
            <>
              <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

              {activeTab === "account" && (
                <ProfileSection user={userData} successMessage={statusMessage} />
              )}

              {activeTab === "api" && (
                <ApiAccessSection
                  apiKey={apiKey}
                  apiKeyStatus={apiKeyStatus}
                  apiKeyCreated={apiKeyCreated}
                  requestsToday={usageData.requests_today}
                  dailyQuota={usageData.daily_quota}
                  rateLimit={usageData.requests_per_minute}
                  requestsThisMinute={usageData.requests_this_minute}
                  totalRequests={usageData.total_requests}
                  onCopy={handleCopy}
                  onRegenerate={() => setShowRegenerateModal(true)}
                  onGenerate={handleGenerateKey}
                  copied={copied}
                  hasApiKey={hasApiKey}
                  isLoading={isGeneratingKey}
                  statusMessage={statusMessage}
                />
              )}
            </>
          )}
        </div>
      </div>

      <RegenerateModal
        isOpen={showRegenerateModal}
        onClose={() => setShowRegenerateModal(false)}
        onConfirm={handleRegenerate}
        isLoading={isLoading}
      />
    </>
  );
}
