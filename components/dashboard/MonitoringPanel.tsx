"use client";

import { useSSE } from "@/hooks/useSSE";
import { useMonitorStore } from "@/store/useMonitorStore";
import { MonitoringCard } from "./MonitoringCard";
import { TrendChart } from "./TrendChart";
import { SystemStats } from "./SystemStats";
import { Signal, Droplets, Activity, Wifi } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export function MonitoringPanel() {
  // Initialize SSE
  useSSE(`${API_BASE_URL}/api/rssi/stream`);

  const { latestData, status, setHistory } = useMonitorStore();
  const [timeAgo, setTimeAgo] = useState<string>("Never");

  // Fetch initial history
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const sixHoursAgo = new Date(
          Date.now() - 6 * 60 * 60 * 1000
        ).toISOString();
        const response = await fetch(
          `${API_BASE_URL}/api/rssi?startDate=${sixHoursAgo}&limit=100`
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

  // Update "time ago" every second
  useEffect(() => {
    if (!latestData?.timestamp) return;

    const updateInterval = setInterval(() => {
      setTimeAgo(
        formatDistanceToNow(new Date(latestData.timestamp), { addSuffix: true })
      );
    }, 1000);

    setTimeAgo(
      formatDistanceToNow(new Date(latestData.timestamp), { addSuffix: true })
    );

    return () => clearInterval(updateInterval);
  }, [latestData?.timestamp]);

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Real-time Monitoring
        </h1>
        <Badge
          variant={status === "connected" ? "default" : "destructive"}
          className="capitalize"
        >
          {status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MonitoringCard
          title="RSSI"
          value={latestData?.rssi_dbm ?? "--"}
          unit="dBm"
          icon={Wifi}
          statusColor={
            latestData?.rssi_dbm && latestData.rssi_dbm > -70
              ? "text-green-500"
              : "text-yellow-500"
          }
        />
        <MonitoringCard
          title="Signal Quality"
          value={latestData?.signal_quality ?? "Unknown"}
          unit=""
          icon={Signal}
          statusColor="text-blue-500"
        />
        <MonitoringCard
          title="Water Level"
          value={latestData?.water_level_cm?.toFixed(1) ?? "--"}
          unit="cm"
          icon={Droplets}
          statusColor="text-cyan-500"
        />
        <MonitoringCard
          title="Last Updated"
          value={timeAgo}
          unit=""
          icon={Activity}
          statusColor="text-purple-500"
        />
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
