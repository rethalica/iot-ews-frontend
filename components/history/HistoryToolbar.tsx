"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Download, X, Settings2 } from "lucide-react";
import { DateRange } from "react-day-picker";
import { VisibilityState } from "@tanstack/react-table";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { columnLabels } from "./columns";

interface HistoryToolbarProps {
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  onExport: (format: "csv" | "excel", columns?: string[]) => void;
  columnVisibility: VisibilityState;
  setColumnVisibility: React.Dispatch<React.SetStateAction<VisibilityState>>;
}

const allColumns = [
  "id",
  "rssiDbm",
  "signalStrength",
  "waterLevelCm",
  "timestamp",
];

export function HistoryToolbar({
  dateRange,
  setDateRange,
  onExport,
  columnVisibility,
  setColumnVisibility,
}: HistoryToolbarProps) {
  const [exportColumnsOpen, setExportColumnsOpen] = React.useState(false);
  const [selectedExportColumns, setSelectedExportColumns] =
    React.useState<string[]>(allColumns);

  const handleExport = (format: "csv" | "excel") => {
    onExport(format, selectedExportColumns);
    setExportColumnsOpen(false);
  };

  const toggleExportColumn = (column: string, checked: boolean) => {
    setSelectedExportColumns((prev) =>
      checked ? [...prev, column] : prev.filter((c) => c !== column),
    );
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Left side: Date Range */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Date Range Picker */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant="outline"
              className={cn(
                "w-[300px] justify-start text-left font-normal",
                !dateRange && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "LLL dd, y")} -{" "}
                    {format(dateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(dateRange.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>

        {dateRange && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDateRange(undefined)}
            title="Clear date filter"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Right side: Column Visibility + Export */}
      <div className="flex items-center gap-2">
        {/* Column Visibility Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Settings2 className="mr-2 h-4 w-4" />
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {allColumns.map((column) => (
              <DropdownMenuCheckboxItem
                key={column}
                checked={columnVisibility[column] !== false}
                onCheckedChange={(checked) =>
                  setColumnVisibility((prev) => ({
                    ...prev,
                    [column]: checked,
                  }))
                }
              >
                {columnLabels[column] || column}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Export Dropdown */}
        <Popover open={exportColumnsOpen} onOpenChange={setExportColumnsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-64">
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">
                  Select columns to export
                </h4>
                <div className="space-y-3">
                  {allColumns.map((column) => (
                    <div key={column} className="flex items-center space-x-2">
                      <Checkbox
                        id={`export-${column}`}
                        checked={selectedExportColumns.includes(column)}
                        onCheckedChange={(checked) =>
                          toggleExportColumn(column, checked as boolean)
                        }
                      />
                      <label
                        htmlFor={`export-${column}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {columnLabels[column] || column}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-2 border-t">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleExport("csv")}
                  disabled={selectedExportColumns.length === 0}
                >
                  CSV
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleExport("excel")}
                  disabled={selectedExportColumns.length === 0}
                >
                  Excel
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
