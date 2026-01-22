"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

export type RssiLog = {
  id: number;
  rssiDbm: number;
  signalStrength: string;
  waterLevelCm: number;
  timestamp: string;
};

interface SortableHeaderProps {
  column: any;
  title: string;
}

const SortableHeader = ({ column, title }: SortableHeaderProps) => {
  const sorted = column.getIsSorted();

  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(sorted === "asc")}
      className="hover:bg-transparent px-0 font-bold"
    >
      {title}
      {sorted === "asc" ? (
        <ArrowUp className="ml-2 h-4 w-4" />
      ) : sorted === "desc" ? (
        <ArrowDown className="ml-2 h-4 w-4" />
      ) : (
        <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
      )}
    </Button>
  );
};

export const columns: ColumnDef<RssiLog>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => <SortableHeader column={column} title="ID" />,
    enableSorting: true,
  },
  {
    accessorKey: "rssiDbm",
    header: ({ column }) => (
      <SortableHeader column={column} title="RSSI (dBm)" />
    ),
    enableSorting: true,
    cell: ({ row }) => {
      const val = row.getValue("rssiDbm") as number;
      let color = "text-gray-500";
      if (val >= -50) color = "text-green-600";
      else if (val >= -70) color = "text-blue-600";
      else if (val >= -80) color = "text-yellow-600";
      else color = "text-red-600";

      return <span className={`font-medium ${color}`}>{val} dBm</span>;
    },
  },
  {
    accessorKey: "signalStrength",
    header: ({ column }) => (
      <SortableHeader column={column} title="Signal Strength" />
    ),
    enableSorting: true,
    cell: ({ row }) => {
      const val = row.getValue("signalStrength") as string;
      let color = "text-gray-500";
      if (val === "Excellent") color = "text-green-600";
      if (val === "Good") color = "text-blue-600";
      if (val === "Fair") color = "text-yellow-600";
      if (val === "Poor") color = "text-red-600";

      return <span className={`font-medium ${color}`}>{val}</span>;
    },
  },
  {
    accessorKey: "waterLevelCm",
    header: ({ column }) => (
      <SortableHeader column={column} title="Water Level (cm)" />
    ),
    enableSorting: true,
    cell: ({ row }) => {
      const val = row.getValue("waterLevelCm") as number;
      return <span>{val?.toFixed(1)} cm</span>;
    },
  },
  {
    accessorKey: "timestamp",
    header: ({ column }) => (
      <SortableHeader column={column} title="Timestamp" />
    ),
    enableSorting: true,
    cell: ({ row }) => {
      const date = new Date(row.getValue("timestamp"));
      return <div>{format(date, "PPpp")}</div>;
    },
  },
];

export const columnLabels: Record<string, string> = {
  id: "ID",
  rssiDbm: "RSSI (dBm)",
  signalStrength: "Signal Strength",
  waterLevelCm: "Water Level (cm)",
  timestamp: "Timestamp",
};
