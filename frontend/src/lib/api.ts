/**
 * AgroWeather API client
 *
 * Configure the backend base URL with VITE_API_URL.
 * - Local development: leave unset or set to http://localhost:8000
 * - Production / same-origin reverse-proxy: set to "" or "/api" (relative)
 * - Separate backend host: set to the full public URL, e.g. https://api.example.com
 *
 * Never hard-code localhost in components; always go through this module.
 */

const RAW_BASE = import.meta.env.VITE_API_URL as string | undefined

/** Resolved API base (no trailing slash). Empty string = same origin. */
export const API_BASE = (RAW_BASE ?? (import.meta.env.DEV ? 'http://localhost:8000' : '')).replace(/\/$/, '')

function url(path: string): string {
  if (!path.startsWith('/')) path = `/${path}`
  return `${API_BASE}${path}`
}

export interface CurrentWeatherData {
  temperature_c: number | null
  humidity_percent: number | null
  day_night: string | null
  rain_sensor: number | null
  rain_status: string | null
  rainfall_mm: number | null
  wind_speed_kmh: number | null
  wind_direction_deg: number | null
  pressure_hpa: number | null
  ldr_value: number | null
}

export interface CurrentWeatherResponse {
  station_id?: string
  status: string
  message?: string
  weather: CurrentWeatherData
  timestamp: string | null
}

export interface ForecastTemperature {
  avg_c: number | null
  min_c: number | null
  max_c: number | null
}

export interface ForecastRainfall {
  rain: boolean
  probability: number | null
  amount_mm: number | null
}

export interface ForecastDay {
  date: string
  temperature: ForecastTemperature
  rainfall: ForecastRainfall
  wind_speed: number | null
  pressure_hpa: number | null
}

export interface ForecastResponse {
  source?: string
  cached?: boolean
  start_date?: string
  end_date?: string
  count?: number
  forecast: ForecastDay[]
  status?: string
}

async function getJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url(path), {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.headers ?? {}),
    },
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`API ${res.status}: ${text || res.statusText}`)
  }
  return res.json() as Promise<T>
}

/** Latest station reading from the backend. */
export async function fetchCurrentWeather(): Promise<CurrentWeatherResponse> {
  return getJson<CurrentWeatherResponse>('/weather/current')
}

/** ML forecast for the next `days` days (1–14). */
export async function fetchForecast(days = 7): Promise<ForecastResponse> {
  return getJson<ForecastResponse>(`/forecast?days=${days}`)
}

/** Health check. */
export async function fetchHealth(): Promise<Record<string, unknown>> {
  return getJson('/health')
}

/** Pretty display helpers */
export function displayValue(
  value: number | null | undefined,
  suffix = '',
  digits?: number,
): string {
  if (value == null || Number.isNaN(value)) return '—'
  const n = digits != null ? Number(value).toFixed(digits) : String(value)
  return `${n}${suffix}`
}

export function weekdayLabel(isoDate: string): string {
  try {
    return new Date(`${isoDate}T12:00:00`).toLocaleDateString(undefined, {
      weekday: 'short',
    })
  } catch {
    return isoDate
  }
}

export function fullDateLabel(isoDate: string): string {
  try {
    return new Date(`${isoDate}T12:00:00`).toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return isoDate
  }
}

export function rainIcon(probability: number | null | undefined): string {
  if (probability == null) return '🌡️'
  if (probability >= 0.6) return '🌧️'
  if (probability >= 0.3) return '🌦️'
  return '☀️'
}

export function rainLabel(probability: number | null | undefined): string {
  if (probability == null) return '—'
  if (probability >= 0.6) return 'Rain likely'
  if (probability >= 0.3) return 'Possible showers'
  return 'Mostly clear'
}
