/**
 * AgroWeather API client
 */

const RAW_BASE = import.meta.env.VITE_API_URL as string | undefined

export const API_BASE = (RAW_BASE ?? (import.meta.env.DEV ? 'http://localhost:8000' : '')).replace(
  /\/$/,
  '',
)

const TOKEN_KEY = 'agroweather_token'
const USER_KEY = 'agroweather_user'

function url(path: string): string {
  if (!path.startsWith('/')) path = `/${path}`
  return `${API_BASE}${path}`
}

export interface AuthUser {
  id: string
  email: string
  first_name: string
  farm_name?: string
  location?: string
  acres?: string
  crops?: string[]
  station_code?: string | null
  created_at?: string | null
}

export interface AuthResponse {
  access_token: string
  token_type: string
  user: AuthUser
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

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as AuthUser) : null
  } catch {
    return null
  }
}

export function saveSession(token: string, user: AuthUser): void {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(init?.headers as Record<string, string> | undefined),
  }

  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  if (init?.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json'
  }

  const res = await fetch(url(path), { ...init, headers })

  let data: unknown = null
  const text = await res.text()
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }
  }

  if (!res.ok) {
    const detail =
      data && typeof data === 'object' && data !== null && 'detail' in data
        ? String((data as { detail: unknown }).detail)
        : `Request failed (${res.status})`
    throw new Error(detail)
  }

  return data as T
}

export async function signup(payload: {
  email: string
  password: string
  first_name: string
  farm_name?: string
  location?: string
  acres?: string
  crops?: string[]
  station_code?: string | null
}): Promise<AuthResponse> {
  const result = await requestJson<AuthResponse>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  saveSession(result.access_token, result.user)
  return result
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const result = await requestJson<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  saveSession(result.access_token, result.user)
  return result
}

export async function fetchMe(): Promise<AuthUser> {
  const user = await requestJson<AuthUser>('/auth/me')
  const token = getToken()
  if (token) saveSession(token, user)
  return user
}

export function logout(): void {
  clearSession()
}

export async function fetchCurrentWeather(): Promise<CurrentWeatherResponse> {
  return requestJson<CurrentWeatherResponse>('/weather/current')
}

export async function fetchForecast(days = 7): Promise<ForecastResponse> {
  return requestJson<ForecastResponse>(`/forecast?days=${days}`)
}

export async function fetchHealth(): Promise<Record<string, unknown>> {
  return requestJson('/health')
}

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