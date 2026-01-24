"use client";

import {
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceLine,
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

const thresholds = [
  {
    label: "Excellent",
    description: "Stronger than -70 dBm",
    color: "#22c55e",
  },
  { label: "Good", description: "-70 to -85 dBm", color: "#84cc16" },
  { label: "Fair", description: "-86 to -100 dBm", color: "#eab308" },
  { label: "Poor", description: "Lower than -100 dBm", color: "#36454F" },
];

export function TrendChart() {
  const history = useMonitorStore((state) => state.history);

  // Map history to chart format
  const chartData = history.map((item) => ({
    time: format(new Date(item.timestamp), "dd-MM-yyyy | HH:mm"),
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
            margin={{ left: -20, right: 10, top: 10, bottom: 20 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="time"
              tickLine={false}
              axisLine={false}
              tickMargin={12}
              minTickGap={32}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              domain={[-110, -30]}
              ticks={[-110, -100, -90, -80, -70, -60, -50, -40, -30]}
              tickFormatter={(value) => `${value}`}
            />
            <ChartTooltip content={<ChartTooltipContent />} />

            {/* Threshold Lines */}
            <ReferenceLine
              y={-70}
              stroke="#22c55e"
              strokeDasharray="3 3"
              strokeWidth={1}
            />
            <ReferenceLine
              y={-85}
              stroke="#84cc16"
              strokeDasharray="3 3"
              strokeWidth={1}
            />
            <ReferenceLine
              y={-100}
              stroke="#eab308"
              strokeDasharray="3 3"
              strokeWidth={1}
            />

            <Line
              type="monotone"
              dataKey="rssi"
              stroke="var(--color-rssi)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>

        {/* Legend / Signal Classification */}
        <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 border-t pt-4">
          {thresholds.map((t) => (
            <div key={t.label} className="flex items-center gap-2">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: t.color }}
              />
              <span className="text-xs font-medium text-muted-foreground tracking-wider">
                {t.label}:{" "}
                <span className="text-foreground normal-case font-semibold">
                  {t.description}
                </span>
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
