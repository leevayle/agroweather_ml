import { useEffect, useState } from 'react'
import {
  fetchCurrentWeather,
  fetchForecast,
  displayValue,
  weekdayLabel,
  fullDateLabel,
  rainIcon,
  rainLabel,
  type AuthUser,
  type CurrentWeatherData,
  type ForecastDay,
} from '../../lib/api'

export default function Weather({ user }: { user: AuthUser | null }) {
  const [weather, setWeather] = useState<CurrentWeatherData | null>(null)
  const [weatherStatus, setWeatherStatus] = useState<string>('loading')
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
          setTimestamp(cw.timestamp ?? null)
        } else {
          setWeather(null)
          setWeatherStatus('offline')
        }

        setForecast(fc?.forecast ?? [])
        setError(null)
      } catch (e) {
        if (isCurrent) setError(e instanceof Error ? e.message : 'Failed to load')
      } finally {
        if (isCurrent) setLoading(false)
      }
    }

    load()
    const id = window.setInterval(load, 30_000)
    return () => {
      isCurrent = false
      window.clearInterval(id)
    }
  }, [])

  const isLive = weatherStatus === 'online' && weather?.temperature_c != null
  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className="pb-24 md:pb-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Weather</h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          {user?.location ? `${user.location} · ` : ''}{today}
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-[var(--danger)]/40 bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger-strong)]">
          API error: {error}
        </div>
      )}

      {/* Current Hero */}
      <div className="bg-gradient-to-br from-[var(--sky)] to-[var(--sky-dark)] rounded-2xl p-5 text-[var(--primary-foreground)] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-40 h-40 bg-[var(--background)]/10 rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-8 w-24 h-24 bg-[var(--background)]/5 rounded-full translate-y-1/2" />
        </div>
        <div className="relative flex items-start justify-between">
          <div>
            <p className="text-[var(--sky-soft)] text-xs font-medium mb-1">
              {isLive
                ? 'Current Conditions · Live'
                : weatherStatus === 'waiting_for_data'
                  ? 'Waiting for station data…'
                  : loading
                    ? 'Loading…'
                    : 'Station offline'}
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-6xl font-bold">
                {displayValue(weather?.temperature_c, '°', 1)}
              </span>
              <div>
                <p className="text-[var(--sky-soft)] text-sm">
                  {weather?.rain_status ?? (isLive ? '—' : 'No reading')}
                </p>
                <p className="text-[var(--sky-light)] text-xs">
                  {weather?.day_night ? `· ${weather.day_night}` : ''}
                </p>
              </div>
            </div>
            {timestamp && (
              <p className="text-[var(--sky-light)] text-xs mt-2">
                Last update {new Date(timestamp).toLocaleString()}
              </p>
            )}
          </div>
          <span className="text-6xl">{rainIcon(forecast[0]?.rainfall?.probability)}</span>
        </div>

        <div className="grid grid-cols-4 gap-3 mt-5 pt-4 border-t border-[var(--background)]/20 relative">
          {[
            { icon: '💧', val: displayValue(weather?.humidity_percent, '%', 0), label: 'Humidity' },
            {
              icon: '💨',
              val: displayValue(weather?.wind_speed_kmh, ' km/h', 1),
              label: weather?.wind_direction_deg != null ? `Wind ${weather.wind_direction_deg}°` : 'Wind',
            },
            { icon: '🌡️', val: displayValue(weather?.pressure_hpa, ' hPa', 0), label: 'Pressure' },
            { icon: '🌧️', val: displayValue(weather?.rainfall_mm, ' mm', 1), label: 'Rainfall' },
          ].map((m) => (
            <div key={m.label}>
              <p className="text-[var(--sky-light)] text-xs">{m.label}</p>
              <p className="text-[var(--primary-foreground)] text-sm font-semibold">{m.val}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Note: no hourly endpoint yet – show daily forecast only */}
      <div className="bg-[var(--background)] border border-[var(--border)] rounded-2xl p-4">
        <h2 className="text-sm font-semibold text-[var(--foreground)] mb-1">7-Day Forecast</h2>
        <p className="text-xs text-[var(--muted-foreground)] mb-3">
          Powered by the AgroWeather ML models
        </p>
        <div className="space-y-0.5">
          {(forecast.length ? forecast : Array.from({ length: 7 }, () => null)).map((day, i) => (
            <div
              key={day?.date ?? i}
              className="flex items-center gap-3 py-2.5 px-2 rounded-xl hover:bg-[var(--grey)] transition-colors"
            >
              <div className="w-16 text-sm font-medium text-[var(--foreground)]">
                {day ? weekdayLabel(day.date) : '—'}
              </div>
              <div className="text-xl w-8 text-center">
                {day ? rainIcon(day.rainfall?.probability) : '—'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[var(--foreground)] truncate">
                  {day ? rainLabel(day.rainfall?.probability) : '—'}
                </p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {day
                    ? `${displayValue(day.rainfall?.amount_mm, ' mm', 1)} · wind ${displayValue(day.wind_speed, ' km/h', 1)}`
                    : ''}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  {displayValue(day?.temperature?.max_c, '°', 0)}
                </p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {displayValue(day?.temperature?.min_c, '°', 0)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed metrics from live station */}
      <div className="bg-[var(--background)] border border-[var(--border)] rounded-2xl p-4">
        <h2 className="text-sm font-semibold text-[var(--foreground)] mb-3">Station details</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: 'Temperature', value: displayValue(weather?.temperature_c, ' °C', 1) },
            { label: 'Humidity', value: displayValue(weather?.humidity_percent, ' %', 0) },
            { label: 'Pressure', value: displayValue(weather?.pressure_hpa, ' hPa', 1) },
            { label: 'Wind speed', value: displayValue(weather?.wind_speed_kmh, ' km/h', 1) },
            {
              label: 'Wind direction',
              value:
                weather?.wind_direction_deg != null ? `${weather.wind_direction_deg}°` : '—',
            },
            { label: 'Rainfall', value: displayValue(weather?.rainfall_mm, ' mm', 1) },
            { label: 'Rain status', value: weather?.rain_status ?? '—' },
            { label: 'Day / Night', value: weather?.day_night ?? '—' },
            { label: 'Status', value: weatherStatus },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl bg-[var(--grey)] border border-[var(--border)] px-3 py-2.5"
            >
              <p className="text-xs text-[var(--muted-foreground)]">{item.label}</p>
              <p className="text-sm font-semibold text-[var(--foreground)] mt-0.5">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Forecast detail cards */}
      {forecast.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-[var(--foreground)] mb-3">Forecast detail</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {forecast.map((day) => (
              <div
                key={day.date}
                className="bg-[var(--background)] border border-[var(--border)] rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-[var(--foreground)]">{fullDateLabel(day.date)}</p>
                  <span className="text-2xl">{rainIcon(day.rainfall?.probability)}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-xs text-[var(--muted-foreground)]">Avg / Min / Max</p>
                    <p className="font-medium text-[var(--foreground)]">
                      {displayValue(day.temperature?.avg_c, '°', 1)} /{' '}
                      {displayValue(day.temperature?.min_c, '°', 1)} /{' '}
                      {displayValue(day.temperature?.max_c, '°', 1)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--muted-foreground)]">Rain probability</p>
                    <p className="font-medium text-[var(--foreground)]">
                      {day.rainfall?.probability != null
                        ? `${Math.round(day.rainfall.probability * 100)}%`
                        : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--muted-foreground)]">Rain amount</p>
                    <p className="font-medium text-[var(--foreground)]">
                      {displayValue(day.rainfall?.amount_mm, ' mm', 1)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--muted-foreground)]">Wind / Pressure</p>
                    <p className="font-medium text-[var(--foreground)]">
                      {displayValue(day.wind_speed, ' km/h', 1)} ·{' '}
                      {displayValue(day.pressure_hpa, ' hPa', 0)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
