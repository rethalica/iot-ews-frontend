"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMonitorStore } from "@/store/useMonitorStore";
import {
  Activity,
  ArrowUp,
  ArrowDown,
  Database,
  ChartNoAxesCombined,
} from "lucide-react";

export function SystemStats() {
  const history = useMonitorStore((state) => state.history);

  const stats = {
    avgRssi:
      history.length > 0
        ? (
            history.reduce((acc, curr) => acc + curr.rssi_dbm, 0) /
            history.length
          ).toFixed(1)
        : "--",
    maxRssi:
      history.length > 0 ? Math.max(...history.map((i) => i.rssi_dbm)) : "--",
    minRssi:
      history.length > 0 ? Math.min(...history.map((i) => i.rssi_dbm)) : "--",
    maxWater:
      history.length > 0
        ? Math.max(...history.map((i) => i.water_level_cm)).toFixed(1)
        : "--",
    count: history.length,
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <ChartNoAxesCombined className="h-5 w-5 text-blue-600" />
          System Statistics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-md">
              <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-sm font-medium">Average RSSI</span>
          </div>
          <span className="font-bold">{stats.avgRssi} dBm</span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-md">
              <ArrowUp className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-sm font-medium">Peak RSSI</span>
          </div>
          <span className="font-bold text-green-600 dark:text-green-400">
            {stats.maxRssi} dBm
          </span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-md">
              <ArrowDown className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
            <span className="text-sm font-medium">Lowest RSSI</span>
          </div>
          <span className="font-bold text-red-600 dark:text-red-400">
            {stats.minRssi} dBm
          </span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-100 dark:bg-cyan-900 rounded-md">
              <Database className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
            </div>
            <span className="text-sm font-medium">Peak Water Level</span>
          </div>
          <span className="font-bold">{stats.maxWater} cm</span>
        </div>

        <div className="pt-2 text-xs text-muted-foreground text-center">
          Based on last {stats.count} data points (6 hours)
        </div>
      </CardContent>
    </Card>
  );
}
