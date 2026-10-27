import { useEffect, useState } from 'react'
import {
  fetchCurrentWeather,
  fetchForecast,
  displayValue,
  weekdayLabel,
  rainIcon,
  type AuthUser,
  type CurrentWeatherData,
  type ForecastDay,
} from '../../lib/api'

interface DashboardProps {
  user: AuthUser | null
  onNavigate: (tab: string) => void
  onAddStation: () => void
}

export default function Dashboard({ user, onNavigate, onAddStation }: DashboardProps) {
  const [weather, setWeather] = useState<CurrentWeatherData | null>(null)
  const [weatherStatus, setWeatherStatus] = useState<string>('loading')
  const [stationId, setStationId] = useState<string | null>(null)
  const [timestamp, setTimestamp] = useState<string | null>(null)
  const [forecast, setForecast] = useState<ForecastDay[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isCurrent = true

    const load = async () => {
      try {
        const [cw, fc] = await Promise.all([
          fetchCurrentWeather().catch(() => null),
          fetchForecast(7).catch(() => null),
        ])

        if (!isCurrent) return

        if (cw) {
          setWeather(cw.weather ?? null)
          setWeatherStatus(cw.status ?? 'unknown')
          setStationId(cw.station_id ?? null)
          setTimestamp(cw.timestamp ?? null)
        } else {
          setWeather(null)
          setWeatherStatus('offline')
          setStationId(null)
        }

        if (fc?.forecast) {
          setForecast(fc.forecast)
        } else {
          setForecast([])
        }

        setError(null)
      } catch (e) {
        if (isCurrent) {
          setError(e instanceof Error ? e.message : 'Failed to load data')
        }
      } finally {
        if (isCurrent) setLoading(false)
      }
    }

    load()
    const refresh = window.setInterval(load, 30_000)
    return () => {
      isCurrent = false
      window.clearInterval(refresh)
    }
  }, [])

  const todayLabel = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  const isLive = weatherStatus === 'online' && weather?.temperature_c != null

  return (
    <div className="pb-24 md:pb-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[var(--muted-foreground)] font-medium">Hi,</p>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            {user?.first_name || 'there'} 👋
          </h1>
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
            {todayLabel}{user?.location ? ` · ${user.location}` : ''}
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-[var(--danger)]/40 bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger-strong)]">
          Could not reach the API. Check that the backend is running and <code className="text-xs">VITE_API_URL</code> is set correctly.
          <span className="block mt-1 opacity-80 text-xs">{error}</span>
        </div>
      )}

      {/* Live Weather Card */}
      <div
        className="relative bg-[var(--primary)] rounded-2xl p-5 overflow-hidden cursor-pointer"
        onClick={() => onNavigate('weather')}
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--background)]/5 rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[var(--background)]/5 rounded-full translate-y-1/2 -translate-x-1/4 pointer-events-none" />
        <div className="relative">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-[var(--success-soft)] text-xs font-medium mb-1">
                {isLive
                  ? `Live · ${stationId ?? 'Weather station'}`
                  : weatherStatus === 'waiting_for_data'
                    ? 'Waiting for station…'
                    : loading
                      ? 'Loading…'
                      : 'Station offline'}
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-[var(--primary-foreground)]">
                  {displayValue(weather?.temperature_c, '°C', 1)}
                </span>
              </div>
              <p className="text-[var(--primary-foreground)] font-medium mt-1">
                {weather?.rain_status ?? (isLive ? '—' : 'No data yet')}
              </p>
              {timestamp && (
                <p className="text-[var(--success-soft)] text-xs mt-1">
                  Updated {new Date(timestamp).toLocaleTimeString()}
                </p>
              )}
            </div>
            <div className="text-5xl">
              {rainIcon(forecast[0]?.rainfall?.probability)}
            </div>
          </div>
          <div className="flex gap-4 mt-4 pt-4 border-t border-[var(--background)]/20">
            {[
              { icon: '💧', label: 'Humidity', val: displayValue(weather?.humidity_percent, '%', 0) },
              { icon: '💨', label: 'Wind', val: displayValue(weather?.wind_speed_kmh, ' km/h', 1) },
              {
                icon: '🌡️',
                label: 'High / Low',
                val: forecast[0]
                  ? `${displayValue(forecast[0].temperature?.max_c, '°', 0)} / ${displayValue(forecast[0].temperature?.min_c, '°', 0)}`
                  : '—',
              },
              { icon: '🌧️', label: 'Rain', val: displayValue(weather?.rainfall_mm, ' mm', 1) },
            ].map((m) => (
              <div key={m.label} className="flex-1 min-w-0">
                <p className="text-[var(--success-soft)] text-xs">{m.label}</p>
                <p className="text-[var(--primary-foreground)] text-sm font-semibold truncate">{m.val}</p>
              </div>
            ))}
          </div>

          {/* 7-day strip from API */}
          <div className="grid grid-cols-7 gap-2 mt-4">
            {(forecast.length ? forecast : Array.from({ length: 7 }, () => null)).map((day, i) => (
              <div
                key={day?.date ?? i}
                className="min-w-0 flex flex-col items-center gap-1 bg-[var(--background)]/10 rounded-xl px-1.5 py-2"
              >
                <span className="text-[var(--success-soft)] text-xs">
                  {day ? weekdayLabel(day.date) : '—'}
                </span>
                <span className="text-base">{day ? rainIcon(day.rainfall?.probability) : '—'}</span>
                <span className="text-[var(--primary-foreground)] text-sm font-semibold">
                  {displayValue(day?.temperature?.avg_c, '°', 0)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Station Status */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-[var(--foreground)] text-sm">Station Status</h2>
          <button
            onClick={() => onNavigate('profile')}
            className="text-xs text-[var(--primary)] font-medium hover:text-[var(--primary-hover)]"
          >
            Manage →
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto hide-scrollbar -mx-1 px-1 pb-1">
          {stationId ? (
            <div
              className="flex-shrink-0 bg-[var(--background)] border border-[var(--border)] rounded-xl p-3 w-52"
            >
              <div className="flex items-center gap-1.5 mb-2">
                <div
                  className={`w-2 h-2 rounded-full ${isLive ? 'bg-[var(--success)]' : 'bg-[var(--muted-foreground)]'}`}
                />
                <span className="text-xs text-[var(--muted-foreground)] font-medium truncate">
                  {stationId}
                </span>
              </div>
              <p className="text-xs text-[var(--muted-foreground)]">
                {isLive
                  ? 'Receiving weather readings'
                  : weatherStatus === 'waiting_for_data'
                    ? 'Waiting for first reading'
                    : 'No live reading'}
              </p>
              <div className="flex gap-2 mt-1 text-xs text-[var(--muted-foreground)]">
                <span>💧{displayValue(weather?.humidity_percent, '%', 0)}</span>
                <span>💨{displayValue(weather?.wind_speed_kmh, ' km/h', 0)}</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-[var(--muted-foreground)]">
              {weatherStatus === 'loading' ? 'Loading station status…' : 'No station readings available.'}
            </p>
          )}
          <button
            onClick={onAddStation}
            className="flex-shrink-0 bg-[var(--background)] border border-dashed border-[var(--border)] rounded-xl p-3 w-44 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[var(--primary)] transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[var(--secondary)] flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 2v10M2 7h10" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-xs text-[var(--muted-foreground)] text-center">Add station</span>
          </button>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-[var(--foreground)] text-sm">Today&apos;s AI Insights</h2>
          <button
            onClick={() => onNavigate('insights')}
            className="text-xs text-[var(--primary)] font-medium hover:text-[var(--primary-hover)]"
          >
            View all →
          </button>
        </div>
        <div className="bg-[var(--background)] border border-[var(--border)] rounded-xl p-4">
          <p className="text-sm text-[var(--muted-foreground)]">
            Personalized insights are not available yet.
          </p>
        </div>
      </div>

      {/* Tasks */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-[var(--foreground)] text-sm">Upcoming tasks</h2>
          <button
            onClick={() => onNavigate('calendar')}
            className="text-xs text-[var(--primary)] font-medium hover:text-[var(--primary-hover)]"
          >
            Calendar →
          </button>
        </div>
        <div className="bg-[var(--background)] border border-[var(--border)] rounded-xl divide-y divide-[var(--border)]">
          <p className="px-4 py-3 text-sm text-[var(--muted-foreground)]">
            You have no saved tasks yet. Add one in the calendar.
          </p>
        </div>
      </div>
    </div>
  )
}
