"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  WebhookCard,
  CreateWebhookModal,
  SecretRevealModal,
  DeliveriesModal,
} from "../../components/webhooks";
import { apiClient } from "../../libs/api";
import useAuthStore from "../../store";

export default function WebhooksPage() {
  const router = useRouter();
  const { isAuthenticated, apiKey } = useAuthStore();

  const [webhooks, setWebhooks] = useState([]);
  const [stations, setStations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSecret, setNewSecret] = useState(null);
  const [deliveriesFor, setDeliveriesFor] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/sign-in");
    }
  }, [isAuthenticated, router]);

  const fetchWebhooks = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    setError(null);
    try {
      // Webhook management is JWT-authenticated (Authorization: Bearer),
      // not X-API-KEY — apiClient attaches both automatically.
      const response = await apiClient.get("/alerts/webhooks/");
      setWebhooks(response || []);
    } catch (err) {
      console.error("Error fetching webhooks:", err);
      setError(err.message || "Failed to load webhook subscriptions.");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchWebhooks();
  }, [fetchWebhooks]);

  useEffect(() => {
    // Station list is only used to populate the "station" filter in the
    // create-webhook form — needs an API key, unlike the rest of this page.
    if (!isAuthenticated || !apiKey) return;
    apiClient
      .get("/stations/")
      .then(setStations)
      .catch(() => {});
  }, [isAuthenticated, apiKey]);

  const handleCreate = async (payload) => {
    const created = await apiClient.post("/alerts/webhooks/", payload);
    setWebhooks((prev) => [created, ...prev]);
    setShowCreateModal(false);
    if (created.secret) {
      setNewSecret(created.secret);
    }
  };

  const handleDelete = async (id) => {
    await apiClient.delete(`/alerts/webhooks/${id}/`);
    setWebhooks((prev) => prev.filter((w) => w.id !== id));
  };

  const handleTest = async (id) => {
    return apiClient.post(`/alerts/webhooks/${id}/test/`, {});
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen border-t border-line bg-bg py-8">
      <div className="mx-auto max-w-4xl px-4">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="mb-3 inline-block rounded-sm bg-accent-soft px-3 py-1.5 font-mono text-[0.72rem] font-semibold uppercase tracking-wider text-accent">
              Webhooks
            </span>
            <h1 className="font-display text-2xl font-semibold text-ink">
              Webhook subscriptions
            </h1>
            <p className="mt-2 max-w-xl text-sm text-ink-soft">
              Get an HTTP callback the moment an alert fires or resolves,
              instead of polling{" "}
              <Link href="/alerts" className="font-medium text-accent hover:text-ink">
                /alerts/
              </Link>
              . See the{" "}
              <Link
                href="/documentation#webhooks-list-create"
                className="font-medium text-accent hover:text-ink"
              >
                webhooks reference
              </Link>{" "}
              for the full payload shape.
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="shrink-0 rounded-md bg-ink px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2a2c1f]"
          >
            + New webhook
          </button>
        </div>

        {isLoading && (
          <div className="flex justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-accent"></div>
          </div>
        )}

        {!isLoading && error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-600">
            {error}
          </div>
        )}

        {!isLoading && !error && webhooks.length === 0 && (
          <div className="rounded-lg border border-line bg-bg-soft p-12 text-center">
            <p className="mb-4 text-ink-soft">
              You don&apos;t have any webhook subscriptions yet.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="rounded-md bg-ink px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2a2c1f]"
            >
              Create your first webhook
            </button>
          </div>
        )}

        {!isLoading && !error && webhooks.length > 0 && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {webhooks.map((webhook) => (
              <WebhookCard
                key={webhook.id}
                webhook={webhook}
                onDelete={handleDelete}
                onTest={handleTest}
                onViewDeliveries={setDeliveriesFor}
              />
            ))}
          </div>
        )}
      </div>

      <CreateWebhookModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreate}
        stations={stations}
      />

      <SecretRevealModal secret={newSecret} onClose={() => setNewSecret(null)} />

      <DeliveriesModal webhook={deliveriesFor} onClose={() => setDeliveriesFor(null)} />
    </div>
  );
}
