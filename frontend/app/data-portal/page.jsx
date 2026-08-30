"use client";

import { useState, useEffect } from "react";
import {
  PageHeader,
  TabNavigation,
  StationsTab,
  ExportTab,
} from "../../components/data-portal";
import { apiClient } from "../../libs/api";
import useAuthStore from "../../store";

export default function DataPortalPage() {
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [activeTab, setActiveTab] = useState("stations");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [needsAuth, setNeedsAuth] = useState(false);
  const { apiKey, isAuthenticated } = useAuthStore();

  useEffect(() => {
    const fetchStations = async () => {
      if (!isAuthenticated) {
        setNeedsAuth(true);
        setIsLoading(false);
        return;
      }

      if (!apiKey) {
        setError(
          "No API key found. Please generate an API key in your dashboard.",
        );
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      setNeedsAuth(false);

      try {
        // /stations/current/ only returns live readings (it has no status
        // or elevation field), and /stations/current/ already filters to
        // status=active stations only — so every station in this response
        // is, by definition, Active. Pull /stations/ too so we can show
        // real elevation and status text instead of guessing from a
        // system_health field the API doesn't actually return.
        const [currentResponse, stationList] = await Promise.all([
          apiClient.get("/stations/current/"),
          apiClient.get("/stations/"),
        ]);

        const bySlug = {};
        (stationList || []).forEach((s) => {
          bySlug[s.slug] = s;
        });

        const transformedStations = currentResponse.map((item, index) => {
          const data = item.data || {};
          const weather = data.weather_readings || {};
          const meta = bySlug[item.station_slug] || {};

          return {
            id: item.station_slug || index,
            slug: item.station_slug || "",
            name: item.station_name || "Unknown Station",
            siteName: meta.site_name || item.station_name || "Unknown Station",
            location:
              item.station_slug?.replace(/-/g, " ") || "Unknown Location",
            coordinates: `${item.coordinates?.latitude || 0}, ${item.coordinates?.longitude || 0}`,
            latitude: item.coordinates?.latitude ?? null,
            longitude: item.coordinates?.longitude ?? null,
            elevation: meta.elevation_m ? `${meta.elevation_m} m` : "N/A",
            elevationMeters: meta.elevation_m ?? null,
            sensorId: meta.sensor_id ?? null,
            status: meta.status
              ? meta.status.charAt(0).toUpperCase() + meta.status.slice(1)
              : "Active",
            lastUpdated: data.time
              ? new Date(data.time).toLocaleString()
              : "N/A",
            current: {
              temperature: weather.temperature?.sht || 0,
              humidity: weather.humidity_pct || 0,
              pressure: weather.pressure_bmx || 0,
              windSpeed: weather.wind?.speed || 0,
              windDirection: weather.wind?.direction || 0,
              rainfall: weather.rain?.gauge_1_today || 0,
              heatIndex: weather.indices?.heat_index || 0,
              wetBulb: weather.indices?.wet_bulb || 0,
              wbgt: weather.indices?.wbgt || 0,
            },
            rawData: item,
          };
        });

        setStations(transformedStations);

        if (transformedStations.length > 0) {
          setSelectedStation(transformedStations[0]);
        }
      } catch (err) {
        console.error("Error fetching stations:", err);
        setError(err.message || "Failed to fetch stations");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStations();
  }, [apiKey, isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen border-t border-line bg-bg py-8">
        <div className="mx-auto max-w-6xl px-4">
          <PageHeader />
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
          </div>
        </div>
      </div>
    );
  }

  if (needsAuth) {
    return (
      <div className="min-h-screen border-t border-line bg-bg py-8">
        <div className="mx-auto max-w-6xl px-4">
          <PageHeader />
          <div className="rounded-lg border border-line bg-bg-soft p-6 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mx-auto mb-3 text-ink-soft"
            >
              <circle cx="12" cy="16" r="1" />
              <rect x="3" y="10" width="18" height="12" rx="2" />
              <path d="M7 10V7a5 5 0 0 1 10 0v3" />
            </svg>
            <h3 className="text-lg font-semibold text-ink">
              Sign Up or Log In Required
            </h3>
            <p className="text-ink-soft">
              You need to sign up or log in to access weather data.
            </p>
            <div className="mt-4">
              <a
                href="/auth/sign-up"
                className="inline-block rounded-md bg-ink px-4 py-2 text-sm text-white hover:bg-[#2a2c1f]"
              >
                Sign Up / Log In
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen border-t border-line bg-bg py-8">
        <div className="mx-auto max-w-6xl px-4">
          <PageHeader />
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
            <div className="text-4xl mb-3">⚠️</div>
            <h3 className="text-lg font-semibold text-red-700">
              Failed to Load Stations
            </h3>
            <p className="text-red-600">{error}</p>
            {!apiKey && (
              <div className="mt-4">
                <a
                  href="/dashboard"
                  className="inline-block rounded-md bg-ink px-4 py-2 text-sm text-white hover:bg-[#2a2c1f]"
                >
                  Go to Dashboard to Generate API Key
                </a>
              </div>
            )}
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-md border border-line px-4 py-2 text-sm text-ink hover:bg-bg-soft"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen border-t border-line bg-bg py-8">
      <div className="mx-auto max-w-6xl px-4">
        <PageHeader />
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === "stations" && (
          <StationsTab
            stations={stations}
            onSelectStation={(station) => {
              setSelectedStation(station);
              setActiveTab("export");
            }}
          />
        )}

        {activeTab === "export" && selectedStation && (
          <ExportTab
            stations={stations}
            selectedStation={selectedStation}
            setSelectedStation={setSelectedStation}
          />
        )}
      </div>
    </div>
  );
}

const metadata = {
  title: "Weather Data Portal — JKUAT Live Weather API",
  description:
    "Simple weather data portal for researchers and students. View and download weather data from IoT stations across the country",
};
