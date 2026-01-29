"use client";

import { memo, useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { MonitoringCard } from "./MonitoringCard";
import { TimerReset } from "lucide-react";

interface TimeAgoProps {
  timestamp: string | Date | undefined;
}

/**
 * Memoized TimeAgo component that updates every second.
 * Extracted from MonitoringPanel to prevent 1-second re-renders
 * from affecting the entire dashboard.
 */
export const TimeAgo = memo(function TimeAgo({ timestamp }: TimeAgoProps) {
  // Compute initial state from props to avoid useEffect setState on mount
  const getTimeAgoValue = (ts: string | Date | undefined): string => {
    if (!ts) return "Never";
    const date = new Date(ts);
    const finalDate = date > new Date() ? new Date() : date;
    return formatDistanceToNow(finalDate, { addSuffix: true });
  };

  const [timeAgo, setTimeAgo] = useState<string>(() =>
    getTimeAgoValue(timestamp),
  );

  useEffect(() => {
    if (!timestamp) {
      // No interval needed for "Never" state
      return;
    }

    const updateTimeAgo = () => {
      setTimeAgo(getTimeAgoValue(timestamp));
    };

    // Update every second
    const updateInterval = setInterval(updateTimeAgo, 1000);

    return () => clearInterval(updateInterval);
  }, [timestamp]);

  return (
    <MonitoringCard
      title="Last Updated"
      value={timeAgo}
      unit=""
      icon={TimerReset}
      statusColor="text-purple-500"
    />
  );
});
