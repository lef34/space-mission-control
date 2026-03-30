import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import './App.css'

// Fix default marker icons in Vite + React
delete (L.Icon.Default as any).prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

type IssLocation = {
  message: string
  timestamp: number
  iss_position: {
    latitude: string
    longitude: string
  }
}

function formatTime(epochSeconds: number) {
  return new Date(epochSeconds * 1000).toLocaleString()
}

function App() {
  const [position, setPosition] = useState<[number, number]>([0, 0])
  const [timestamp, setTimestamp] = useState<number | null>(null)
  const [status, setStatus] = useState('Booting mission control…')
  const [logs, setLogs] = useState<string[]>([])

  function pushLog(item: string) {
    setLogs((current) => [
      `[${new Date().toLocaleTimeString()}] ${item}`,
      ...current.slice(0, 29),
    ])
  }

  async function fetchIssPosition() {
    try {
      pushLog('Sending ISS position request')
      const response = await fetch('http://localhost:8000/iss-location')
      if (!response.ok) {
        const body = await response.text()
        throw new Error(`API error ${response.status}: ${body}`)
      }
      const data: IssLocation = await response.json()
      const lat = Number(data.iss_position.latitude)
      const lng = Number(data.iss_position.longitude)

      if (Number.isNaN(lat) || Number.isNaN(lng)) {
        throw new Error(`Invalid coordinates from server: ${data.iss_position.latitude}, ${data.iss_position.longitude}`)
      }

      setPosition([lat, lng])
      setTimestamp(data.timestamp)
      setStatus('NOMINAL')
      pushLog(`ISS at ${lat.toFixed(4)}, ${lng.toFixed(4)} (UTC ${formatTime(data.timestamp)})`)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)
      console.error('ISS fetch failure:', message)
      setStatus(`ERROR: ${message}`)
      pushLog(`ERROR: ${message}`)
      setTimestamp(null)
      setPosition([0, 0])
    }
  }

  useEffect(() => {
    pushLog('Mission control initialized')
    fetchIssPosition()
    const interval = setInterval(fetchIssPosition, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="terminal-viewport">
      <aside className="sidebar">
        <h1>Mission Control Terminal</h1>
        <div className="status-panel">
          <div className="status-high">Live telemetry</div>
          <div>System health: <strong>{status}</strong></div>
          <div>Updated: {timestamp ? formatTime(timestamp) : 'N/A'}</div>
          <hr />
          <div><strong>Latitude:</strong> {position[0].toFixed(6)}</div>
          <div><strong>Longitude:</strong> {position[1].toFixed(6)}</div>
        </div>
        <button className="refresh-btn" onClick={fetchIssPosition}>Force sync</button>
      </aside>

      <main className="main-panel">
        <div className="map-card">
          <MapContainer center={position} zoom={3} scrollWheelZoom={false} style={{ height: '100%', borderRadius: '10px' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={position}>
              <Popup>
                ISS current position: {position[0].toFixed(4)}, {position[1].toFixed(4)}
              </Popup>
            </Marker>
          </MapContainer>
        </div>

        <section className="log-console">
          <div className="log-header">Mission log</div>
          <div className="log-body">
            {logs.length === 0 ? (
              <div className="log-line">[--:--:--] awaiting first stream...</div>
            ) : (
              logs.map((line, i) => (
                <div key={i} className="log-line">{line}</div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
