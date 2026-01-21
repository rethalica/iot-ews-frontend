"use client";

import {
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useMonitorStore } from "@/store/useMonitorStore";
import { format } from "date-fns";

const chartConfig = {
  rssi: {
    label: "RSSI (dBm)",
    theme: {
      light: "#000000",
      dark: "#ffffff",
    },
  },
} satisfies ChartConfig;

export function TrendChart() {
  const history = useMonitorStore((state) => state.history);

  // Map history to chart format
  const chartData = history.map((item) => ({
    time: format(new Date(item.timestamp), "HH:mm:ss"),
    rssi: item.rssi_dbm,
  }));

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>RSSI Trend</CardTitle>
        <CardDescription>Signal strength (last 100 points)</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
          <LineChart
            data={chartData}
            margin={{ left: -20, right: 10, top: 10, bottom: 0 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="time"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              domain={["auto", "auto"]}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              type="monotone"
              dataKey="rssi"
              stroke="var(--color-rssi)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
