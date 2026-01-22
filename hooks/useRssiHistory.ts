"use client"

import { useState, useEffect, useCallback } from "react"
import { DateRange } from "react-day-picker"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'

interface RssiLog {
  id: number
  rssiDbm: number
  signalStrength: string
  waterLevelCm: number
  timestamp: string
}

interface Pagination {
  total: number
  limit: number
  offset: number
  page: number
  totalPages: number
}

interface UseRssiHistoryParams {
  initialLimit?: number
}

export function useRssiHistory({ initialLimit = 10 }: UseRssiHistoryParams = {}) {
  const [data, setData] = useState<RssiLog[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    limit: initialLimit,
    offset: 0,
    page: 1,
    totalPages: 0,
  })

  const [sorting, setSorting] = useState<{ field: string; direction: "asc" | "desc" }>({
    field: "timestamp",
    direction: "desc",
  })

  const [dateRange, setDateRange] = useState<DateRange | undefined>()

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      
      // Use page-based pagination as per backend docs
      params.append("limit", pagination.limit.toString())
      params.append("page", pagination.page.toString())
      
      // Sorting params
      params.append("order_by", sorting.field)
      params.append("order_direction", sorting.direction)

      // Date range filter
      if (dateRange?.from) {
        params.append("startDate", dateRange.from.toISOString())
      }
      if (dateRange?.to) {
        params.append("endDate", dateRange.to.toISOString())
      }

      console.log("Fetching with params:", params.toString())

      const response = await fetch(`${API_BASE_URL}/api/rssi?${params.toString()}`)
      if (!response.ok) {
        throw new Error("Failed to fetch RSSI history")
      }

      const result = await response.json()
      console.log("API Response:", result)
      
      setData(result.data || [])
      setPagination((prev) => ({
        ...prev,
        total: result.pagination?.total || 0,
        totalPages: result.pagination?.totalPages || 0,
        offset: result.pagination?.offset || 0,
      }))
    } catch (err: any) {
      console.error("Fetch error:", err)
      setError(err.message || "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.limit, sorting.field, sorting.direction, dateRange])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const setPage = (page: number) => {
    setPagination((prev) => ({ ...prev, page }))
  }

  const setLimit = (limit: number) => {
    setPagination((prev) => ({ ...prev, limit, page: 1 }))
  }

  const handleSort = (field: string, direction: "asc" | "desc") => {
    setSorting({ field, direction })
    // Reset to first page when sorting changes to avoid empty states or confusing results
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const exportData = async (format: "csv" | "excel", selectedColumns?: string[]) => {
    const params = new URLSearchParams()
    params.append("format", format)
    
    if (dateRange?.from) {
      params.append("startDate", dateRange.from.toISOString())
    }
    if (dateRange?.to) {
      params.append("endDate", dateRange.to.toISOString())
    }
    
    if (selectedColumns && selectedColumns.length > 0) {
      params.append("columns", selectedColumns.join(","))
    }
    
    window.open(`${API_BASE_URL}/api/rssi/export?${params.toString()}`, "_blank")
  }

  return {
    data,
    loading,
    error,
    pagination,
    sorting,
    dateRange,
    setPage,
    setLimit,
    setSorting: handleSort,
    setDateRange,
    refresh: fetchData,
    exportData,
  }
}
