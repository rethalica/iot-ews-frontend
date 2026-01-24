"use client";

import { useState } from "react";
import { useRssiHistory } from "@/hooks/useRssiHistory";
import { HistoryTable } from "@/components/history/HistoryTable";
import { columns } from "@/components/history/columns";
import { HistoryToolbar } from "@/components/history/HistoryToolbar";
import { DateRange } from "react-day-picker";
import { VisibilityState } from "@tanstack/react-table";

export default function HistoryPage() {
  const {
    data,
    loading,
    pagination,
    sorting,
    dateRange,
    setPage,
    setLimit,
    setSorting,
    setDateRange,
    exportData,
  } = useRssiHistory({ initialLimit: 10 });

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
  };

  const handleExport = (
    format: "csv" | "excel",
    selectedColumns?: string[],
  ) => {
    exportData(format, selectedColumns);
  };

  const handlePageSizeChange = (size: number) => {
    setLimit(size);
  };

  const handleSortingChange = (field: string, direction: "asc" | "desc") => {
    setSorting(field, direction);
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Historical Data
        </h1>
      </div>

      <HistoryToolbar
        dateRange={dateRange}
        setDateRange={handleDateRangeChange}
        onExport={handleExport}
        columnVisibility={columnVisibility}
        setColumnVisibility={setColumnVisibility}
      />

      <HistoryTable
        columns={columns}
        data={data}
        pagination={pagination}
        sorting={sorting}
        onPageChange={setPage}
        onSortingChange={handleSortingChange}
        loading={loading}
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={setColumnVisibility}
        pageSize={pagination.limit}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
}
