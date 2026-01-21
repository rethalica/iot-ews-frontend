import { create } from 'zustand'
import { SensorData, ConnectionStatus } from '@/types/sensor'

interface MonitorState {
  latestData: SensorData | null
  history: SensorData[]
  status: ConnectionStatus
  setLatestData: (data: SensorData) => void
  setHistory: (data: any[]) => void
  setStatus: (status: ConnectionStatus) => void
  clearHistory: () => void
}

export const useMonitorStore = create<MonitorState>((set) => ({
  latestData: null,
  history: [],
  status: 'disconnected',

  setLatestData: (data) => set((state) => {
    const newHistory = [...state.history, data].slice(-100)
    return {
      latestData: data,
      history: newHistory
    }
  }),

  setHistory: (data) => set((state) => {
    // Normalize backend data (camelCase) to frontend/SSE format (snake_case)
    const normalized = data.map(item => ({
      rssi_dbm: item.rssiDbm ?? item.rssi_dbm,
      signal_quality: item.signalStrength ?? item.signal_quality,
      water_level_cm: item.waterLevelCm ?? item.water_level_cm,
      timestamp: item.timestamp
    }))
    return { 
      history: normalized,
      latestData: state.latestData ? state.latestData : (normalized.length > 0 ? normalized[normalized.length - 1] : null)
    }
  }),

  setStatus: (status) => set({ status }),
  
  clearHistory: () => set({ history: [] })
}))
