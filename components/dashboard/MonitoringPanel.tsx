"use client";

import dynamic from "next/dynamic";
import { useSSE } from "@/hooks/useSSE";
import { useMonitorStore } from "@/store/useMonitorStore";
import { MonitoringCard } from "./MonitoringCard";
import { SystemStats } from "./SystemStats";
import { Signal, Droplets, Wifi } from "lucide-react";
import { TimeAgo } from "./TimeAgo";
import { Badge } from "@/components/ui/badge";
import { useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

// Dynamic import for TrendChart - Recharts is ~300KB, lazy load it
const TrendChart = dynamic(
  () => import("./TrendChart").then((mod) => mod.TrendChart),
  {
    loading: () => (
      <Card className="h-full">
        <CardHeader>
          <div className="h-6 w-32 bg-muted animate-pulse rounded" />
          <div className="h-4 w-48 bg-muted animate-pulse rounded mt-1" />
        </CardHeader>
        <CardContent>
          <div className="min-h-62.5 w-full bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    ),
    ssr: false,
  },
);

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

export function MonitoringPanel() {
  // Initialize SSE
  useSSE(`${API_BASE_URL}/api/rssi/stream`);

  const { latestData, status, setHistory } = useMonitorStore();

  // Fetch initial history
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const sixHoursAgo = new Date(
          Date.now() - 6 * 60 * 60 * 1000,
        ).toISOString();
        const response = await fetch(
          `${API_BASE_URL}/api/rssi?startDate=${sixHoursAgo}&limit=100`,
        );
        const result = await response.json();
        if (result.data) {
          // Backend returns in desc order (recent first), we need asc for chart
          setHistory(result.data.reverse());
        }
      } catch (error) {
        console.error("Failed to fetch history:", error);
      }
    };
    fetchHistory();
  }, [setHistory]);

  const getRSSIColor = (rssi: number | undefined) => {
    if (rssi === undefined) return "text-muted-foreground";
    if (rssi >= -70) return "text-green-500";
    if (rssi >= -85) return "text-lime-500";
    if (rssi >= -100) return "text-yellow-500";
    if (rssi > -110) return "text-orange-500";
    return "text-red-500";
  };

  const getSignalQualityLabel = (rssi: number | undefined) => {
    if (rssi === undefined) return "Unknown";
    if (rssi >= -70) return "Excellent";
    if (rssi >= -85) return "Good";
    if (rssi >= -100) return "Fair";
    if (rssi > -110) return "Poor";
    return "No Signal";
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Network Overview
        </h1>
        <Badge
          variant={
            status === "connected"
              ? "default"
              : status === "disconnected"
                ? "destructive"
                : "secondary"
          }
          className="flex items-center gap-2 px-3 py-1 capitalize transition-all duration-300"
        >
          <span className="relative flex h-2 w-2">
            {status === "connected" && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
            )}
            <span
              className={`relative inline-flex h-2 w-2 rounded-full ${
                status === "connected"
                  ? "bg-green-500"
                  : status === "disconnected"
                    ? "bg-red-500"
                    : "bg-yellow-500 animate-pulse"
              }`}
            ></span>
          </span>
          {status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MonitoringCard
          title="RSSI"
          value={latestData?.rssi_dbm ?? "--"}
          unit="dBm"
          icon={Wifi}
          statusColor={getRSSIColor(latestData?.rssi_dbm)}
        />
        <MonitoringCard
          title="Signal Quality"
          value={getSignalQualityLabel(latestData?.rssi_dbm)}
          unit=""
          icon={Signal}
          statusColor={getRSSIColor(latestData?.rssi_dbm)}
        />
        <MonitoringCard
          title="Water Level"
          value={latestData?.water_level_cm?.toFixed(1) ?? "--"}
          unit="cm"
          icon={Droplets}
          statusColor="text-cyan-500"
        />
        <TimeAgo timestamp={latestData?.timestamp} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TrendChart />
        </div>
        <div className="lg:col-span-1">
          <SystemStats />
        </div>
      </div>
    </div>
  );
}
