const RAW_BASE = import.meta.env.VITE_API_URL as string | undefined

export const API_BASE = (RAW_BASE ?? (import.meta.env.DEV ? 'http://localhost:8000' : '')).replace(
  /\/$/,
  '',
)

const TOKEN_KEY = 'agroweather_token'
const USER_KEY = 'agroweather_user'

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
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

export interface ForecastDay {
  date: string
  temperature: {
    avg_c: number | null
    min_c: number | null
    max_c: number | null
  }
  rainfall: {
    rain: boolean
    probability: number | null
    amount_mm: number | null
  }
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

export interface ChatTurn {
  role: 'user' | 'assistant'
  content: string
}

function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    localStorage.removeItem(USER_KEY)
    return null
  }
}

function saveSession(token: string, user: AuthUser): void {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers)
  headers.set('Accept', 'application/json')
  if (init?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const token = getToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  let response: Response
  try {
    response = await fetch(`${API_BASE}${path}`, { ...init, headers })
  } catch (error) {
    if (error instanceof TypeError) {
      const apiAddress = API_BASE || window.location.origin
      throw new ApiError(
        `Cannot reach the AgroWeather API at ${apiAddress}. Start the backend or configure VITE_API_URL to its reachable address.`,
        0,
      )
    }
    throw error
  }
  const text = await response.text()
  let data: unknown = null

  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }
  }

  if (!response.ok) {
    const detail =
      data && typeof data === 'object' && 'detail' in data
        ? String((data as { detail: unknown }).detail)
        : `Request failed (${response.status})`
    throw new ApiError(detail, response.status)
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

export async function updateMyCrops(crops: string[]): Promise<AuthUser> {
  const user = await requestJson<AuthUser>('/auth/me/crops', {
    method: 'PUT',
    body: JSON.stringify({ crops }),
  })
  const token = getToken()
  if (token) saveSession(token, user)
  return user
}

export async function fetchCurrentWeather(): Promise<CurrentWeatherResponse> {
  return requestJson<CurrentWeatherResponse>('/weather/current')
}

export async function fetchForecast(days = 7): Promise<ForecastResponse> {
  return requestJson<ForecastResponse>(`/forecast?days=${days}`)
}

export async function sendFarmChat(
  message: string,
  history: ChatTurn[],
): Promise<{ reply: string }> {
  return requestJson<{ reply: string }>('/chat', {
    method: 'POST',
    body: JSON.stringify({ message, history: history.slice(-10) }),
  })
}
