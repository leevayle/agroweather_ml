import { useState } from 'react'

const hourlyData = [
  { hour: 'Now', temp: 24, precip: 0, icon: '🌤️', wind: 12 },
  { hour: '2pm', temp: 25, precip: 0, icon: '☀️', wind: 11 },
  { hour: '4pm', temp: 26, precip: 0, icon: '🌤️', wind: 14 },
  { hour: '6pm', temp: 23, precip: 5, icon: '⛅', wind: 10 },
  { hour: '8pm', temp: 19, precip: 10, icon: '🌦️', wind: 8 },
  { hour: '10pm', temp: 16, precip: 5, icon: '🌙', wind: 6 },
  { hour: '12am', temp: 14, precip: 0, icon: '🌙', wind: 5 },
  { hour: '2am', temp: 12, precip: 0, icon: '🌙', wind: 4 },
  { hour: '4am', temp: 11, precip: 0, icon: '🌙', wind: 4 },
  { hour: '6am', temp: 13, precip: 0, icon: '🌤️', wind: 6 },
]

const forecast = [
  { day: 'Today', high: 26, low: 11, icon: '🌤️', precip: 10, desc: 'Mostly sunny' },
  { day: 'Wed', high: 22, low: 14, icon: '🌧️', precip: 80, desc: 'Heavy rain' },
  { day: 'Thu', high: 19, low: 12, icon: '🌦️', precip: 60, desc: 'Showers' },
  { day: 'Fri', high: 24, low: 10, icon: '🌤️', precip: 5, desc: 'Mostly clear' },
  { day: 'Sat', high: 28, low: 12, icon: '☀️', precip: 0, desc: 'Sunny' },
  { day: 'Sun', high: 27, low: 13, icon: '☀️', precip: 0, desc: 'Sunny' },
  { day: 'Mon', high: 21, low: 11, icon: '⛅', precip: 20, desc: 'Partly cloudy' },
]

const stationDetails = [
  { name: 'Field A — North', temp: 24, humidity: 68, wind: 12, uv: 6, pressure: 1013, soil: 62, dew: 16 },
  { name: 'Field B — Corn', temp: 23, humidity: 71, wind: 9, uv: 5, pressure: 1012, soil: 71, dew: 17 },
  { name: 'Greenhouse', temp: 28, humidity: 84, wind: 0, uv: 3, pressure: 1013, soil: 78, dew: 24 },
]

function MiniBarChart({ value, max = 100, color }: { value: number; max?: number; color: string }) {
  const pct = Math.round((value / max) * 100)
  return (
    <div className="h-8 flex items-end">
      <div
        className="w-3 rounded-t transition-all"
        style={{ height: `${Math.max(pct, 8)}%`, backgroundColor: color, opacity: value === 0 ? 0.2 : 1 }}
      />
    </div>
  )
}

export default function Weather() {
  const [activeStation, setActiveStation] = useState(0)
  const station = stationDetails[activeStation]

  const temps = hourlyData.map(h => h.temp)
  const minTemp = Math.min(...temps)
  const maxTemp = Math.max(...temps)
  const range = maxTemp - minTemp

  return (
    <div className="pb-24 md:pb-8 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Weather</h1>
        <p className="text-sm text-[var(--muted-foreground)]">Ames, Iowa · Sep 22, 2026</p>
      </div>

      {/* Current Hero */}
      <div className="bg-gradient-to-br from-[var(--sky)] to-[var(--sky-dark)] rounded-2xl p-5 text-[var(--primary-foreground)] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-40 h-40 bg-[var(--background)]/10 rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-8 w-24 h-24 bg-[var(--background)]/5 rounded-full translate-y-1/2" />
        </div>
        <div className="relative flex items-start justify-between">
          <div>
            <p className="text-[var(--sky-soft)] text-xs font-medium mb-1">Current Conditions · Live</p>
            <div className="flex items-baseline gap-2">
              <span className="text-6xl font-bold">24°</span>
              <div>
                <p className="text-[var(--sky-soft)] text-sm">Partly cloudy</p>
                <p className="text-[var(--sky-light)] text-xs">Feels like 22°</p>
              </div>
            </div>
          </div>
          <span className="text-6xl">🌤️</span>
        </div>
        <div className="grid grid-cols-4 gap-3 mt-5 pt-4 border-t border-[var(--background)]/20 relative">
          {[
            { icon: '💧', val: '68%', label: 'Humidity' },
            { icon: '💨', val: '12 km/h', label: 'Wind NW' },
            { icon: '🌡️', val: '1013 hPa', label: 'Pressure' },
            { icon: '☀️', val: 'UV 6', label: 'High' },
          ].map(m => (
            <div key={m.label}>
              <p className="text-[var(--sky-light)] text-xs">{m.label}</p>
              <p className="text-[var(--primary-foreground)] text-sm font-semibold">{m.val}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Hourly Forecast */}
      <div className="bg-[var(--background)] border border-[var(--border)] rounded-2xl p-4">
        <h2 className="text-sm font-semibold text-[var(--foreground)] mb-4">Hourly Forecast</h2>
        {/* Temperature curve and values share the same ten-column grid. */}
        <div className="overflow-x-auto hide-scrollbar">
          <div className="min-w-[560px]">
          <div className="relative mb-3 h-[60px]">
          <svg viewBox="0 0 1000 60" className="w-full h-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--sky)" stopOpacity="0.3"/>
                <stop offset="100%" stopColor="var(--sky)" stopOpacity="0"/>
              </linearGradient>
            </defs>
            {/* Fill */}
            <path
              d={`M 50 ${60 - ((hourlyData[0].temp - minTemp) / range) * 50 - 5} ${hourlyData.map((h, i) => `L ${(i + 0.5) * 100} ${60 - ((h.temp - minTemp) / range) * 50 - 5}`).join(' ')} L 1000 60 L 0 60 Z`}
              fill="url(#tempGrad)"
            />
            {/* Line */}
            <path
              d={`M 50 ${60 - ((hourlyData[0].temp - minTemp) / range) * 50 - 5} ${hourlyData.map((h, i) => `L ${(i + 0.5) * 100} ${60 - ((h.temp - minTemp) / range) * 50 - 5}`).join(' ')}`}
              stroke="var(--sky)"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Points */}
            {hourlyData.map((h, i) => (
              <circle
                key={i}
                cx={(i + 0.5) * 100}
                cy={60 - ((h.temp - minTemp) / range) * 50 - 5}
                r="3"
                fill="var(--primary-foreground)"
                stroke="var(--sky)"
                strokeWidth="1.5"
              />
            ))}
          </svg>
        </div>
        <div className="grid grid-cols-10 pb-1">
          {hourlyData.map((h, i) => (
            <div key={i} className={`flex flex-col items-center gap-1 px-2 py-2 rounded-xl ${i === 0 ? 'bg-[var(--secondary)]' : ''}`}>
              <span className="text-xs text-[var(--muted-foreground)]">{h.hour}</span>
              <span className="text-base">{h.icon}</span>
              <span className="text-sm font-semibold text-[var(--foreground)]">{h.temp}°</span>
              {h.precip > 0 && <span className="text-xs text-[var(--sky)]">{h.precip}%</span>}
            </div>
          ))}
        </div>
          </div>
        </div>
      </div>

      {/* 7-Day Forecast */}
      <div className="bg-[var(--background)] border border-[var(--border)] rounded-2xl p-4">
        <h2 className="text-sm font-semibold text-[var(--foreground)] mb-3">7-Day Forecast</h2>
        <div className="space-y-0.5">
          {forecast.map((day, i) => (
            <div key={i} className={`flex items-center gap-3 py-2.5 px-2 rounded-xl ${i === 0 ? 'bg-[var(--grey)]' : 'hover:bg-[var(--grey)] transition-colors'}`}>
              <span className="text-sm font-medium text-[var(--muted-foreground)] w-10 flex-shrink-0">{day.day}</span>
              <span className="text-xl w-8 flex-shrink-0">{day.icon}</span>
              <span className="text-xs text-[var(--muted-foreground)] flex-1">{day.desc}</span>
              <div className="flex items-center gap-1 w-10 flex-shrink-0">
                {day.precip > 0 && (
                  <>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="var(--sky)">
                      <path d="M5 1L7.5 5.5C7.5 7.5 5 9 5 9S2.5 7.5 2.5 5.5L5 1z"/>
                    </svg>
                    <span className="text-xs text-[var(--sky)]">{day.precip}%</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-sm font-semibold text-[var(--foreground)]">{day.high}°</span>
                <div className="w-16 h-1.5 bg-[var(--muted)] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      background: 'linear-gradient(to right, var(--sky), var(--accent))',
                      width: `${((day.high - 10) / 20) * 100}%`,
                      marginLeft: `${((day.low - 10) / 20) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-sm text-[var(--muted-foreground)]">{day.low}°</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Station Details */}
      <div className="bg-[var(--background)] border border-[var(--border)] rounded-2xl p-4">
        <h2 className="text-sm font-semibold text-[var(--foreground)] mb-3">Station Details</h2>
        <div className="flex gap-2 mb-4 overflow-x-auto hide-scrollbar">
          {stationDetails.map((s, i) => (
            <button
              key={i}
              onClick={() => setActiveStation(i)}
              className={`flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all ${
                activeStation === i
                  ? 'bg-[var(--primary)] text-[var(--primary-foreground)] border-[var(--primary)]'
                  : 'text-[var(--muted-foreground)] border-[var(--border)] hover:border-[var(--primary)]'
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Temperature', val: `${station.temp}°C`, icon: '🌡️', color: 'var(--accent)' },
            { label: 'Humidity', val: `${station.humidity}%`, icon: '💧', color: 'var(--sky)' },
            { label: 'Wind Speed', val: `${station.wind} km/h NW`, icon: '💨', color: 'var(--muted-foreground)' },
            { label: 'UV Index', val: `${station.uv} — High`, icon: '☀️', color: 'var(--accent)' },
            { label: 'Pressure', val: `${station.pressure} hPa`, icon: '📊', color: 'var(--muted-foreground)' },
            { label: 'Soil Moisture', val: `${station.soil}%`, icon: '🌱', color: 'var(--primary)' },
            { label: 'Dew Point', val: `${station.dew}°C`, icon: '🌫️', color: 'var(--sky)' },
          ].map(m => (
            <div key={m.label} className="bg-[var(--grey)] rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base">{m.icon}</span>
                <span className="text-xs text-[var(--muted-foreground)]">{m.label}</span>
              </div>
              <p className="text-sm font-semibold text-[var(--foreground)]">{m.val}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Precipitation Chart */}
      <div className="bg-[var(--background)] border border-[var(--border)] rounded-2xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-[var(--foreground)]">Precipitation Forecast</h2>
          <span className="text-xs text-[var(--muted-foreground)]">Next 10 hours</span>
        </div>
        <div className="flex items-end gap-2 h-20">
          {hourlyData.map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <MiniBarChart value={h.precip} max={100} color="var(--sky)" />
              <span className="text-xs text-[var(--muted-foreground)]">{h.hour}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
