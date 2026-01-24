'use client'

import { useEffect, useRef } from 'react'
import { useMonitorStore } from '@/store/useMonitorStore'
import { SensorData } from '@/types/sensor'

export const useSSE = (url: string) => {
  const { setLatestData, setStatus } = useMonitorStore()
  const eventSourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    if (eventSourceRef.current) return

    console.log('Connecting to SSE:', url)
    setStatus('connecting')
    
    const es = new EventSource(url)
    eventSourceRef.current = es

    es.onopen = () => {
      console.log('SSE Connected')
      setStatus('connected')
    }

    es.onmessage = (event) => {
      try {
        const data: SensorData = JSON.parse(event.data)
        setLatestData(data)
      } catch (error) {
        console.error('Error parsing SSE data:', error)
      }
    }

    es.onerror = (error) => {
      console.error('SSE Error:', error)
      // EventSource naturally tries to reconnect
      setStatus('reconnecting')
    }

    return () => {
      console.log('Closing SSE Connection')
      es.close()
      eventSourceRef.current = null
      setStatus('disconnected')
    }
  }, [url, setLatestData, setStatus])

  return null
}
