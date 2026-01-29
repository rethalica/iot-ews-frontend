"use client";

import { memo, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMonitorStore } from "@/store/useMonitorStore";
import {
  Activity,
  ArrowUp,
  ArrowDown,
  ChartNoAxesCombined,
} from "lucide-react";

export const SystemStats = memo(function SystemStats() {
  const history = useMonitorStore((state) => state.history);

  // Memoized stats with single-loop optimization (instead of 4 separate iterations)
  const stats = useMemo(() => {
    if (history.length === 0) {
      return {
        avgRssi: "--",
        maxRssi: "--",
        minRssi: "--",
        maxWater: "--",
        count: 0,
      };
    }

    // Single loop for all calculations - more efficient than reduce + 3x map
    let sum = 0;
    let maxRssi = -Infinity;
    let minRssi = Infinity;
    let maxWater = 0;

    for (const item of history) {
      sum += item.rssi_dbm;
      if (item.rssi_dbm > maxRssi) maxRssi = item.rssi_dbm;
      if (item.rssi_dbm < minRssi) minRssi = item.rssi_dbm;
      if (item.water_level_cm > maxWater) maxWater = item.water_level_cm;
    }

    return {
      avgRssi: (sum / history.length).toFixed(1),
      maxRssi,
      minRssi,
      maxWater: maxWater.toFixed(1),
      count: history.length,
    };
  }, [history]);

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

        {/* <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-100 dark:bg-cyan-900 rounded-md">
              <Database className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
            </div>
            <span className="text-sm font-medium">Peak Water Level</span>
          </div>
          <span className="font-bold">{stats.maxWater} cm</span>
        </div> */}

        <div className="pt-2 text-xs text-muted-foreground text-center">
          Based on last {stats.count} data points (6 hours)
        </div>
      </CardContent>
    </Card>
  );
});
