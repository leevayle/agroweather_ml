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

export function getUserErrorMessage(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback
}

function getHttpErrorMessage(path: string, status: number): string {
  const isChat = path.startsWith('/chat')
  const isInsights = path === '/chat/insights'
  const isCalendar = path.startsWith('/calendar')
  const isWeather = path.startsWith('/weather') || path.startsWith('/forecast')
  const isLogin = path === '/auth/login'
  const isSignup = path === '/auth/signup'

  if (status === 401) {
    return isLogin
      ? 'Email or password doesn’t match our records. Check your details and try again.'
      : 'Your session has expired. Please sign in again.'
  }
  if (status === 403) return 'You don’t have permission to do that.'
  if (status === 400 || status === 409) {
    return isSignup
      ? 'We couldn’t create your account. Check your details and try again.'
      : 'Please check your information and try again.'
  }
  if (status === 422) return 'Please check your information and try again.'
  if (status === 429) {
    return isInsights
      ? 'Crop insights are busy right now. Please try again shortly.'
      : isChat
      ? 'The farm assistant is busy right now. Please try again shortly.'
      : 'Please wait a moment and try again.'
  }
  if (status >= 500) {
    return isInsights
      ? 'Crop insights are temporarily unavailable. Please try again later.'
      : isCalendar
      ? 'Your calendar couldn’t be updated. Please try again.'
      : isChat
      ? 'The farm assistant is temporarily unavailable. Please try again later.'
      : isWeather
        ? 'Weather data is temporarily unavailable. Please try again later.'
        : 'We couldn’t complete that right now. Please try again later.'
  }
  return isInsights
    ? 'Crop insights couldn’t be loaded. Please try again.'
    : isCalendar
    ? 'Your calendar couldn’t be updated. Please try again.'
    : isChat
    ? 'The farm assistant couldn’t reply. Please try again.'
    : isWeather
      ? 'Weather data couldn’t be loaded. Please try again.'
      : 'Something went wrong. Please try again.'
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

export interface CropInsightActivity {
  activity: string
  timing: string
  reason: string
}

export interface CropInsight {
  crop: string
  headline: string
  activities: CropInsightActivity[]
  optimal_conditions: string
  harvest_guidance: string
}

export interface CalendarTaskResponse {
  message: string
  created: boolean
  task: CalendarTask | null
}

export interface CalendarTask {
  id: string
  crop: string
  activity: string
  timing: string
  reason: string
  date: string | null
  status: 'planned' | 'completed'
  created_at: string | null
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
      throw new ApiError(
        'We’re having trouble connecting. Check your connection and try again.',
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
    throw new ApiError(getHttpErrorMessage(path, response.status), response.status)
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

export async function fetchCropInsights(): Promise<{
  insights: CropInsight[]
  message?: string
}> {
  return requestJson<{ insights: CropInsight[]; message?: string }>('/chat/insights')
}

export async function addCalendarTask(task: {
  crop: string
  activity: string
  timing: string
  reason: string
}): Promise<CalendarTaskResponse> {
  return requestJson<CalendarTaskResponse>('/calendar/tasks', {
    method: 'POST',
    body: JSON.stringify(task),
  })
}

export async function fetchCalendarTasks(start: string, end: string): Promise<CalendarTask[]> {
  const result = await requestJson<{ tasks: CalendarTask[] }>(
    `/calendar/tasks?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`,
  )
  return result.tasks
}

export async function updateCalendarTask(
  taskId: string,
  changes: Partial<Pick<CalendarTask, 'crop' | 'activity' | 'reason' | 'date' | 'status'>>,
): Promise<CalendarTask> {
  const result = await requestJson<{ task: CalendarTask }>(`/calendar/tasks/${encodeURIComponent(taskId)}`, {
    method: 'PATCH',
    body: JSON.stringify(changes),
  })
  return result.task
}

export async function deleteCalendarTask(taskId: string): Promise<void> {
  await requestJson<{ deleted: boolean }>(`/calendar/tasks/${encodeURIComponent(taskId)}`, {
    method: 'DELETE',
  })
}

export async function streamFarmChat(
  message: string,
  history: ChatTurn[],
  onText: (text: string) => void,
): Promise<string> {
  const headers = new Headers({
    Accept: 'text/event-stream',
    'Content-Type': 'application/json',
  })
  const token = getToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  let response: Response
  try {
    response = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ message, history: history.slice(-10) }),
    })
  } catch (error) {
    if (error instanceof TypeError) {
      throw new ApiError(
        'We’re having trouble connecting. Check your connection and try again.',
        0,
      )
    }
    throw error
  }

  if (!response.ok) {
    throw new ApiError(getHttpErrorMessage('/chat', response.status), response.status)
  }
  if (!response.body) {
    throw new ApiError(
      'The farm assistant couldn’t reply. Please try again.',
      response.status,
    )
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let reply = ''

  const handleEvent = (block: string) => {
    let eventType = 'message'
    const dataLines: string[] = []
    for (const line of block.split(/\r?\n/)) {
      if (line.startsWith('event:')) eventType = line.slice(6).trim()
      if (line.startsWith('data:')) dataLines.push(line.slice(5).trimStart())
    }
    if (eventType === 'done' || dataLines.length === 0) return

    const eventData = dataLines.join('\n')
    if (eventType === 'token') {
      const tokenData: unknown = JSON.parse(eventData)
      if (
        tokenData &&
        typeof tokenData === 'object' &&
        'text' in tokenData &&
        typeof tokenData.text === 'string'
      ) {
        reply += tokenData.text
        onText(reply)
      }
    } else if (eventType === 'error') {
      const errorData: unknown = JSON.parse(eventData)
      const message =
        errorData &&
        typeof errorData === 'object' &&
        'message' in errorData &&
        typeof errorData.message === 'string'
          ? errorData.message
          : 'The farm assistant couldn’t reply. Please try again.'
      throw new ApiError(message, 502)
    }
  }

  try {
    while (true) {
      const { done, value } = await reader.read()
      buffer += decoder.decode(value, { stream: !done })
      const blocks = buffer.split(/\r?\n\r?\n/)
      buffer = blocks.pop() ?? ''
      for (const block of blocks) handleEvent(block)
      if (done) break
    }
    if (buffer.trim()) handleEvent(buffer)
  } catch (error) {
    await reader.cancel()
    throw error
  } finally {
    reader.releaseLock()
  }

  if (!reply.trim()) {
    throw new ApiError(
      'The farm assistant couldn’t reply. Please try again.',
      response.status,
    )
  }
  return reply.trim()
}
