export interface SensorData {
  rssi_dbm: number
  signal_quality: string
  water_level_cm: number
  timestamp: string | Date
}

export type ConnectionStatus = 'connected' | 'disconnected' | 'connecting' | 'reconnecting'
