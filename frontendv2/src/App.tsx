import { FormEvent, ReactNode, useEffect, useRef, useState } from 'react'
import {
  clearSession,
  fetchCurrentWeather,
  fetchForecast,
  fetchMe,
  getStoredUser,
  login,
  signup,
  fetchCropInsights,
  streamFarmChat,
  updateMyCrops,
  ApiError,
  getUserErrorMessage,
  type AuthUser,
  type CropInsight,
  type ChatTurn,
  type CurrentWeatherResponse,
  type ForecastDay,
} from './lib/api'

type Page =
  | 'landing'
  | 'signin'
  | 'signup'
  | 'dashboard'
  | 'weather'
  | 'crops'
  | 'insights'
  | 'profile'
  | 'settings'
  | 'privacy'
  | 'terms'

type IconName =
  | 'home'
  | 'cloud'
  | 'leaf'
  | 'spark'
  | 'user'
  | 'settings'
  | 'arrow'
  | 'check'
  | 'station'
  | 'rain'
  | 'wind'
  | 'sun'
  | 'droplet'
  | 'pressure'
  | 'plus'
  | 'send'
  | 'chat'
  | 'bell'
  | 'menu'
  | 'close'
  | 'shield'
  | 'clock'
  | 'logout'
  | 'chevron'

const iconPaths: Record<IconName, ReactNode> = {
  home: <><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5M9 21v-7h6v7" /></>,
  cloud: <><path d="M7 18h10a4 4 0 0 0 .5-8 6 6 0 0 0-11.4-1.5A4.8 4.8 0 0 0 7 18Z" /><path d="m8 21 1-1m4 1 1-1" /></>,
  leaf: <><path d="M20 4C11 4 5 8 5 15c0 3 2 5 5 5 7 0 10-7 10-16Z" /><path d="M4 21c3-5 7-8 12-11" /></>,
  spark: <><path d="m12 3 1.4 4.6L18 9l-4.6 1.4L12 15l-1.4-4.6L6 9l4.6-1.4L12 3Z" /><path d="m19 15 .7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7L19 15Z" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4.5 21a7.5 7.5 0 0 1 15 0" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" /></>,
  arrow: <><path d="M5 12h14M14 7l5 5-5 5" /></>,
  check: <path d="m5 12 4 4L19 6" />,
  station: <><path d="M12 5v14M8 19h8M9 8a4 4 0 0 1 6 0M6 5a8 8 0 0 1 12 0" /><circle cx="12" cy="11" r="1" /></>,
  rain: <><path d="M7 15h10a3.5 3.5 0 0 0 .4-7A5.5 5.5 0 0 0 7 7a4 4 0 0 0 0 8Z" /><path d="m8 19-1 2m6-2-1 2m6-2-1 2" /></>,
  wind: <><path d="M4 8h10a2 2 0 1 0-2-2M4 12h15a2 2 0 1 1-2 2M4 16h7" /></>,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
  droplet: <path d="M12 3S6 10 6 15a6 6 0 0 0 12 0c0-5-6-12-6-12Z" />,
  pressure: <><circle cx="12" cy="12" r="8" /><path d="m12 12 4-3M5 19h14" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  send: <><path d="m22 2-7 20-4-9-9-4 20-7Z" /><path d="M22 2 11 13" /></>,
  chat: <><path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H6l-3 2v-6a7.5 7.5 0 1 1 17-3.5Z" /><path d="M8 11h.01M12 11h.01M16 11h.01" /></>,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" /></>,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  shield: <><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" /><path d="m9 12 2 2 4-4" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  logout: <><path d="M10 17l5-5-5-5M15 12H3M15 4h5v16h-5" /></>,
  chevron: <path d="m9 18 6-6-6-6" />,
}

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{iconPaths[name]}</svg>
}

function Logo({ onClick, light = false }: { onClick?: () => void; light?: boolean }) {
  return (
    <button className={`logo ${light ? 'logo-light' : ''}`} onClick={onClick}>
      <img src="/logo.webp" alt="" />
      <span>AgroWeather</span>
    </button>
  )
}

const Button = ({ children, variant = 'primary', icon, onClick, type = 'button', className = '', disabled = false }: {
  children: ReactNode; variant?: 'primary' | 'secondary' | 'ghost' | 'amber'; icon?: IconName; onClick?: () => void; type?: 'button' | 'submit'; className?: string; disabled?: boolean
}) => <button type={type} onClick={onClick} disabled={disabled} className={`btn btn-${variant} ${className}`}>{children}{icon && <Icon name={icon} size={18} />}</button>

const navItems: { id: Page; label: string; icon: IconName }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'home' },
  { id: 'weather', label: 'Weather', icon: 'cloud' },
  { id: 'crops', label: 'Crops', icon: 'leaf' },
  { id: 'insights', label: 'AI Insights', icon: 'spark' },
  { id: 'profile', label: 'Profile', icon: 'user' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
]

function PublicNav({ go }: { go: (page: Page) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <header className="public-nav">
      <Logo onClick={() => go('landing')} />
      <nav className={open ? 'public-links open' : 'public-links'}>
        <button onClick={() => { go('landing'); setOpen(false) }}>Features</button>
        <button onClick={() => { go('landing'); setOpen(false) }}>How it works</button>
        <button onClick={() => { go('signin'); setOpen(false) }}>Sign in</button>
        <Button onClick={() => { go('signup'); setOpen(false) }}>Get started</Button>
      </nav>
      <button className="mobile-menu" onClick={() => setOpen(!open)} aria-label="Toggle menu"><Icon name={open ? 'close' : 'menu'} /></button>
    </header>
  )
}

function Landing({ go }: { go: (page: Page) => void }) {
  return (
    <div className="landing">
      <PublicNav go={go} />
      <main>
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow"><Icon name="spark" size={15} /> Weather intelligence, built for growers</span>
            <h1>Farm with more certainty.</h1>
            <p>Current weather readings, forecasts, and saved crop preferences—all in one calm workspace for your farm.</p>
            <div className="hero-actions">
              <Button icon="arrow" onClick={() => go('signup')}>Start for free</Button>
              <Button variant="secondary" onClick={() => go('dashboard')}>Explore dashboard</Button>
            </div>
            <div className="trust-row"><span><Icon name="check" size={16} /> No credit card</span><span><Icon name="check" size={16} /> 10-minute setup</span></div>
          </div>
          <div className="hero-visual">
            <img className="field-photo" src="https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&w=1200&q=85" alt="Rows of green crops on a farm" />
            <div className="live-card">
              <div className="live-head"><div><span className="overline">Field weather · Preview</span><strong>Sample conditions</strong></div><span className="status-dot">Preview</span></div>
              <div className="hero-temp"><Icon name="sun" size={48} /><span>24°</span></div>
              <div className="mini-metrics"><span><Icon name="droplet" size={16} /> 62%</span><span><Icon name="wind" size={16} /> 9 km/h</span><span><Icon name="rain" size={16} /> 0 mm</span></div>
            </div>
            <div className="ai-float"><span className="icon-tile amber"><Icon name="spark" /></span><div><strong>Best irrigation window</strong><small>Tomorrow, 5:30–7:00 AM</small></div></div>
          </div>
        </section>

        <section className="section features">
          <div className="section-heading"><span className="eyebrow">One view of your farm</span><h2>Less guessing. Better growing.</h2><p>AgroWeather turns field data into simple, timely decisions.</p></div>
          <div className="feature-grid">
            {[
              ['cloud', 'Field-level weather', 'Live conditions and forecasts tuned to your station, not the nearest airport.'],
              ['spark', 'Weather insights', 'Review current station readings and forecast conditions in one place.'],
              ['leaf', 'Crop monitoring', 'Track every field’s health, tasks, and risks without clutter or complex tools.'],
            ].map(([icon, title, body]) => <article className="feature-card" key={title}><span className={`icon-tile ${icon === 'cloud' ? 'blue' : ''}`}><Icon name={icon as IconName} /></span><h3>{title}</h3><p>{body}</p><button onClick={() => go('signup')}>Learn more <Icon name="arrow" size={16} /></button></article>)}
          </div>
        </section>

        <section className="how section">
          <div className="section-heading"><span className="eyebrow">Simple from day one</span><h2>From field to forecast in three steps</h2></div>
          <div className="steps">
            {[
              ['01', 'Create your farm', 'Add your location, fields, and the crops you’re growing.'],
              ['02', 'Add station details', 'Save the station code associated with your account.'],
              ['03', 'Plan with confidence', 'Review available forecasts and your saved farm information.'],
            ].map(([n, title, body]) => <article className="step" key={n}><span>{n}</span><div><h3>{title}</h3><p>{body}</p></div></article>)}
          </div>
        </section>

        <section className="cta">
          <div><span className="eyebrow light">Your next growing season starts here</span><h2>Make every field decision count.</h2><p>Set up your farm and get your first local forecast today.</p></div>
          <Button variant="amber" icon="arrow" onClick={() => go('signup')}>Create your farm</Button>
        </section>
      </main>
      <footer><Logo onClick={() => go('landing')} /><p>Weather clarity for every field.</p><div><button onClick={() => go('privacy')}>Privacy</button><button onClick={() => go('terms')}>Terms</button><span>© 2025 AgroWeather</span></div></footer>
    </div>
  )
}

function AuthPage({
  mode,
  go,
  onSuccess,
}: {
  mode: 'signin' | 'signup'
  go: (page: Page) => void
  onSuccess: (user: AuthUser) => void
}) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    firstName: '',
    email: '',
    password: '',
    farmName: '',
    location: '',
    acres: '',
    sizeUnit: 'acres',
    crops: [] as string[],
    stationCode: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const toggleCrop = (crop: string) => {
    setForm((current) => ({
      ...current,
      crops: current.crops.includes(crop)
        ? current.crops.filter((item) => item !== crop)
        : [...current.crops, crop],
    }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    if (mode === 'signup' && step < 3) {
      setStep((current) => current + 1)
      return
    }

    setLoading(true)
    try {
      const result =
        mode === 'signin'
          ? await login(form.email.trim(), form.password)
          : await signup({
              email: form.email.trim(),
              password: form.password,
              first_name: form.firstName.trim(),
              farm_name: form.farmName.trim(),
              location: form.location.trim(),
              acres: form.acres.trim() ? `${form.acres.trim()} ${form.sizeUnit}` : '',
              crops: form.crops,
              station_code: form.stationCode.trim() || null,
            })
      onSuccess(result.user)
    } catch (requestError) {
      setError(getUserErrorMessage(requestError, 'We couldn’t complete that. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-brand">
        <Logo light onClick={() => go('landing')} />
        <div><span className="eyebrow light">Built around your fields</span><h1>Local knowledge.<br />Smarter seasons.</h1><p>Join growers using live weather and crop intelligence to act at the right time.</p></div>
        <small>Trusted by farms across 18 growing regions</small>
      </div>
      <div className="auth-panel">
        <button className="back-link" onClick={() => go('landing')}>← Back to home</button>
        <div className="auth-form">
        {mode === 'signup' && <div className="stepper">{[1,2,3].map((n) => <span key={n} className={step >= n ? 'active' : ''}><i>{step > n ? '✓' : n}</i><small>{['Account', 'Farm info', 'Station code'][n-1]}</small></span>)}</div>}
          <span className="eyebrow">{mode === 'signin' ? 'Welcome back' : `Step ${step} of 3`}</span>
        <h2>{mode === 'signin' ? 'Sign in to your farm' : step === 1 ? 'Create your account' : step === 2 ? 'Tell us about your farm' : 'Add station details'}</h2>
          <p>{mode === 'signin' ? 'Your fields and latest insights are waiting.' : step === 3 ? 'A station code is optional and will be saved with your account.' : 'A few details and your workspace will be ready.'}</p>
          {error && <div className="auth-error" role="alert">{error}</div>}
          <form onSubmit={(event) => void handleSubmit(event)}>
            {mode === 'signin' || step === 1 ? <>
              {mode === 'signup' && <label>First name<input required autoComplete="given-name" value={form.firstName} onChange={(event) => setForm({ ...form, firstName: event.target.value })} placeholder="e.g. Sarah" /></label>}
              <label>Email address<input required autoComplete="email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="you@farm.com" /></label>
              <label>Password<input required autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} minLength={6} type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="At least 6 characters" /></label>
            </> : step === 2 ? <>
              <label>Farm name<input required value={form.farmName} onChange={(event) => setForm({ ...form, farmName: event.target.value })} placeholder="e.g. Willow Creek Farm" /></label>
              <label>Farm location<input required value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} placeholder="Town or postcode" /></label>
              <div className="two-col"><label>Farm size<input value={form.acres} onChange={(event) => setForm({ ...form, acres: event.target.value })} placeholder="Optional" /></label><label>Size unit<select aria-label="Farm size unit" value={form.sizeUnit} onChange={(event) => setForm({ ...form, sizeUnit: event.target.value })}><option value="acres">Acres</option><option value="hectares">Hectares</option></select></label></div>
              <div className="signup-crops"><span>What do you grow?</span>{['Corn', 'Wheat', 'Soybeans', 'Rice', 'Cotton', 'Tomatoes', 'Potatoes', 'Sunflower', 'Barley', 'Canola'].map((crop) => <button key={crop} type="button" className={form.crops.includes(crop) ? 'selected' : ''} onClick={() => toggleCrop(crop)}>{crop}</button>)}</div>
            </> : <div className="pair-box"><span className="icon-tile"><Icon name="station" /></span><label>Station code (optional)<input className="code-input" value={form.stationCode} onChange={(event) => setForm({ ...form, stationCode: event.target.value.toUpperCase() })} maxLength={32} placeholder="e.g. AGR-84F2" /></label><small>This is stored on your account. Station pairing itself is not available through the current backend API.</small></div>}
            <Button type="submit" icon="arrow" className="full">{loading ? 'Please wait…' : mode === 'signin' ? 'Sign in' : step === 3 ? 'Create account' : 'Continue'}</Button>
          </form>
          {mode === 'signup' && step > 1 && <button className="auth-previous" onClick={() => setStep(step - 1)}>Back</button>}
          <div className="auth-switch">{mode === 'signin' ? 'New to AgroWeather?' : 'Already have an account?'} <button onClick={() => go(mode === 'signin' ? 'signup' : 'signin')}>{mode === 'signin' ? 'Create account' : 'Sign in'}</button></div>
        </div>
      </div>
    </div>
  )
}

function AppShell({
  page,
  go,
  user,
  onSignOut,
  children,
}: {
  page: Page
  go: (p: Page) => void
  user: AuthUser
  onSignOut: () => void
  children: ReactNode
}) {
  const initials = user.first_name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Logo onClick={() => go('dashboard')} />
        <nav>{navItems.map(item => <button className={page === item.id ? 'active' : ''} key={item.id} onClick={() => go(item.id)}><Icon name={item.icon} /><span>{item.label}</span></button>)}</nav>
        <div className="sidebar-bottom"><div className="support-card"><span className="icon-tile amber"><Icon name="cloud" /></span><strong>Weather insights</strong><small>Review your current station readings and forecast.</small><button onClick={() => go('insights')}>View insights <Icon name="arrow" size={15} /></button></div><button className="user-chip" onClick={() => go('profile')}><span>{initials}</span><div><strong>{user.first_name}</strong><small>{user.farm_name || user.email}</small></div><Icon name="chevron" size={16} /></button><button className="sidebar-signout" onClick={onSignOut}><Icon name="logout" size={16} /> Sign out</button></div>
      </aside>
      <div className="app-main">
        <header className="mobile-header"><Logo onClick={() => go('dashboard')} /><button onClick={() => go('settings')} aria-label="Settings"><Icon name="settings" /></button></header>
        {children}
      </div>
      <nav className="bottom-nav">{navItems.slice(0,5).map(item => <button className={page === item.id ? 'active' : ''} key={item.id} onClick={() => go(item.id)}><Icon name={item.icon} /><small>{item.label === 'AI Insights' ? 'Insights' : item.label}</small></button>)}</nav>
    </div>
  )
}

function PageHeader({ eyebrow, title, body, children }: { eyebrow: string; title: string; body?: string; children?: ReactNode }) {
  return <header className="page-header"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1>{body && <p>{body}</p>}</div><div className="header-actions">{children}</div></header>
}

function useWeatherData() {
  const [weather, setWeather] = useState<CurrentWeatherResponse | null>(null)
  const [forecast, setForecast] = useState<ForecastDay[]>([])
  const [weatherError, setWeatherError] = useState('')
  const [forecastError, setForecastError] = useState('')
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true
    setLoading(true)
    void Promise.allSettled([fetchCurrentWeather(), fetchForecast(7)]).then(([weatherResult, forecastResult]) => {
      if (!active) return
      if (weatherResult.status === 'fulfilled') {
        setWeather(weatherResult.value)
        setWeatherError('')
      } else {
        setWeatherError(getUserErrorMessage(weatherResult.reason, 'Weather data couldn’t be loaded. Please try again.'))
      }
      if (forecastResult.status === 'fulfilled') {
        setForecast(forecastResult.value.forecast)
        setForecastError('')
      } else {
        setForecastError(getUserErrorMessage(forecastResult.reason, 'The forecast couldn’t be loaded. Please try again.'))
      }
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [refreshKey])

  return {
    weather,
    forecast,
    weatherError,
    forecastError,
    loading,
    refresh: () => setRefreshKey((key) => key + 1),
  }
}

function displayValue(value: number | null | undefined, suffix = '', digits = 1): string {
  if (value == null || !Number.isFinite(value)) return '—'
  return `${Number(value.toFixed(digits))}${suffix}`
}

function ForecastStrip({ forecast, detailed = false }: { forecast: ForecastDay[]; detailed?: boolean }) {
  if (!forecast.length) {
    return <p className="empty-state">No forecast data is currently available.</p>
  }

  return (
    <div className={detailed ? 'forecast-grid detailed' : 'forecast-grid'}>
      {forecast.slice(0, 7).map((day, index) => {
        const probability = day.rainfall.probability
        const rain = day.rainfall.rain
        const icon: IconName = rain ? 'rain' : probability != null && probability >= 0.3 ? 'cloud' : 'sun'
        const label = new Date(`${day.date}T12:00:00`).toLocaleDateString(undefined, {
          weekday: detailed ? 'long' : 'short',
        })
        return (
          <article className={index === 0 ? 'forecast active' : 'forecast'} key={day.date}>
            <strong>{label}</strong>
            <Icon name={icon} size={detailed ? 34 : 26} />
            <div>
              <b>{displayValue(day.temperature.max_c, '°')}</b>
              <span>{displayValue(day.temperature.min_c, '°')}</span>
            </div>
            <small><Icon name="droplet" size={13} /> {probability == null ? '—' : `${Math.round(probability * 100)}%`}</small>
            {detailed && <em>{displayValue(day.rainfall.amount_mm, ' mm')} expected</em>}
          </article>
        )
      })}
    </div>
  )
}

function Dashboard({
  user,
  go,
}: {
  user: AuthUser
  go: (page: Page) => void
}) {
  const { weather, forecast, weatherError, forecastError, loading, refresh } = useWeatherData()
  const current = weather?.weather
  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening'
  const rainyDay = forecast.find((day) => day.rainfall.rain)

  return (
    <main className="app-content">
      <PageHeader eyebrow={new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })} title={`${greeting}, ${user.first_name}`} body={`Here’s the latest for ${user.farm_name || 'your farm'}.`}>
        <Button variant="secondary" icon="station" onClick={refresh}>{loading ? 'Updating…' : 'Refresh weather'}</Button>
      </PageHeader>
      {weatherError && <p className="api-error" role="alert">{weatherError}</p>}
      <section className="dashboard-grid">
        <article className="conditions-card">
          <div className="conditions-top"><div><span className="overline">{weather?.station_id || user.station_code || 'Farm station'} · Current</span><h2>{weather?.status === 'online' ? 'Live conditions' : weather?.message || 'Weather station waiting for data'}</h2></div><span className="status-dot light">{weather?.status === 'online' ? 'Online' : 'Waiting for data'}</span></div>
          <div className="conditions-main"><div className="big-weather"><Icon name="sun" size={66} /><strong>{displayValue(current?.temperature_c, '°')}<span>C</span></strong></div><div className="weather-copy"><strong>{user.location || 'Your farm'}</strong><span>{weather?.timestamp ? `Updated ${new Date(weather.timestamp).toLocaleString()}` : loading ? 'Loading live data…' : 'No station reading received yet'}</span></div></div>
          <div className="conditions-metrics"><span><Icon name="droplet" /> <b>{displayValue(current?.humidity_percent, '%')}</b><small>Humidity</small></span><span><Icon name="wind" /> <b>{displayValue(current?.wind_speed_kmh, ' km/h')}</b><small>Wind speed</small></span><span><Icon name="rain" /> <b>{displayValue(current?.rainfall_mm, ' mm')}</b><small>Rainfall</small></span></div>
        </article>
        <article className="card ai-card"><div className="card-title"><div><span className="eyebrow">Forecast note</span><h2>{rainyDay ? 'Rain in the forecast' : 'Your forecast'}</h2></div><span className="icon-tile amber"><Icon name="spark" /></span></div><p>{rainyDay ? `${Math.round((rainyDay.rainfall.probability ?? 0) * 100)}% chance of rain on ${new Date(`${rainyDay.date}T12:00:00`).toLocaleDateString(undefined, { weekday: 'long' })}${rainyDay.rainfall.amount_mm == null ? '.' : `, with ${displayValue(rainyDay.rainfall.amount_mm, ' mm')} expected.`}` : forecast.length ? 'No rain is predicted in the available forecast.' : 'Forecast data is not available yet.'}</p>{forecastError && <small className="api-error">{forecastError}</small>}<div className="confidence"><small>Based on the backend forecast for your area.</small></div><button onClick={() => go('insights')}>View weather insights <Icon name="arrow" size={16} /></button></article>
      </section>
      <section className="content-section"><div className="section-title"><div><h2>Forecast</h2><p>Daily forecast from AgroWeather.</p></div><button onClick={() => go('weather')}>View weather <Icon name="arrow" size={16} /></button></div><ForecastStrip forecast={forecast} /></section>
      <section className="lower-grid">
        <article className="card dashboard-crops"><div className="section-title compact"><div><h2>Your crops</h2><p>{user.crops?.length ?? 0} saved crops</p></div><button onClick={() => go('crops')}>Manage</button></div>{user.crops?.length ? <div className="crop-mini">{user.crops.map((crop) => <div key={crop}><span className="crop-symbol"><Icon name="leaf" size={18} /></span><div><strong>{crop}</strong><small>Saved to your farm profile</small></div></div>)}</div> : <p className="empty-state">Add crops to your farm profile to see them here.</p>}</article>
        <article className="card dashboard-crops"><div className="section-title compact"><div><h2>Farm details</h2><p>From your account</p></div><button onClick={() => go('profile')}>View profile</button></div><p className="farm-summary">{user.location || 'No location saved'}{user.acres ? ` · ${user.acres}` : ''}</p><p className="farm-summary">{user.station_code ? `Station code: ${user.station_code}` : 'No station code saved'}</p></article>
      </section>
    </main>
  )
}

function Weather({ user }: { user: AuthUser }) {
  const { weather, forecast, weatherError, forecastError, loading, refresh } = useWeatherData()
  const current = weather?.weather
  return <main className="app-content"><PageHeader eyebrow="Live field weather" title="Weather" body="Current readings and forecast supplied by the backend."><Button variant="secondary" onClick={refresh}>{loading ? 'Updating…' : 'Refresh'}</Button></PageHeader>
    {weatherError && <p className="api-error" role="alert">{weatherError}</p>}
    <article className="weather-hero">
      <div><span className="status-dot light">{weather?.status === 'online' ? 'Live station data' : 'Waiting for station data'}</span><h2>{weather?.station_id || user.station_code || 'Weather station'}</h2><p>{user.farm_name || 'Your farm'}{user.location ? ` · ${user.location}` : ''}</p></div>
      <div className="weather-display"><Icon name="sun" size={86} /><strong>{displayValue(current?.temperature_c, '°')}<span>C</span></strong><div><b>{current?.rain_status || weather?.message || 'Current conditions'}</b><span>{current?.day_night || 'Live sensor reading'}</span><small>{weather?.timestamp ? `Updated ${new Date(weather.timestamp).toLocaleString()}` : 'No timestamp available'}</small></div></div>
    </article>
    <section className="metric-grid">{[['droplet','Humidity',displayValue(current?.humidity_percent),'%'],['wind','Wind',displayValue(current?.wind_speed_kmh),'km/h'],['pressure','Pressure',displayValue(current?.pressure_hpa),'hPa'],['rain','Rainfall',displayValue(current?.rainfall_mm),'mm']].map(([icon,label,value,unit]) => <article className="metric-card" key={label}><span className="icon-tile blue"><Icon name={icon as IconName} /></span><div><small>{label}</small><strong>{value}<em>{unit}</em></strong></div></article>)}</section>
    {forecastError && <p className="api-error" role="alert">{forecastError}</p>}
    <section className="content-section"><div className="section-title"><div><h2>Forecast</h2><p>Daily predictions from the backend forecast.</p></div></div><ForecastStrip forecast={forecast} detailed /></section>
  </main>
}

function Crops({
  user,
  onUserUpdate,
}: {
  user: AuthUser
  onUserUpdate: (user: AuthUser) => void
}) {
  const [showAdd, setShowAdd] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const crops = user.crops ?? []

  const saveCrops = async (nextCrops: string[]) => {
    setError('')
    setSaving(true)
    try {
      onUserUpdate(await updateMyCrops(nextCrops))
      setShowAdd(false)
    } catch (requestError) {
      setError(getUserErrorMessage(requestError, 'We couldn’t save your changes. Please try again.'))
    } finally {
      setSaving(false)
    }
  }

  const addCrop = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const crop = String(formData.get('name')).trim()
    if (crop && !crops.some((existing) => existing.toLocaleLowerCase() === crop.toLocaleLowerCase())) {
      void saveCrops([...crops, crop])
    } else {
      setError(crop ? 'This crop is already on your farm.' : 'Enter a crop name.')
    }
  }

  return <main className="app-content"><PageHeader eyebrow={`${crops.length} saved crops`} title="Your crops" body="Manage the crop preferences saved to your account."><Button icon="plus" onClick={() => { setError(''); setShowAdd(true) }}>Add crop</Button></PageHeader>
    {error && <p className="api-error" role="alert">{error}</p>}
    {crops.length ? <section className="crop-grid">{crops.map((crop, index) => <article className="crop-card" key={crop}><div className={`crop-art ${['tomato', 'wheat', 'corn'][index % 3]}`}><Icon name="leaf" size={44} /></div><div className="crop-body"><span className="overline">{user.farm_name || 'Your farm'}</span><h2>{crop}</h2><div className="crop-stats"><span><small>Farm location</small><b>{user.location || 'Not set'}</b></span><span><small>Farm size</small><b>{user.acres || 'Not set'}</b></span></div><Button variant="secondary" disabled={saving} onClick={() => void saveCrops(crops.filter((item) => item !== crop))}>{saving ? 'Saving…' : 'Remove crop'}</Button></div></article>)}</section> : <p className="empty-state card">No crops are saved to your account yet. Add the crops you grow to personalize your farm dashboard.</p>}
    {showAdd && <div className="modal-backdrop" onClick={() => !saving && setShowAdd(false)}><div className="modal" onClick={event => event.stopPropagation()}><button className="modal-close" onClick={() => setShowAdd(false)}><Icon name="close" /></button><span className="icon-tile"><Icon name="leaf" /></span><h2>Add a crop</h2><p>This crop will be saved to your account and appear on your dashboard.</p><form onSubmit={addCrop}><label>Crop name<input name="name" required placeholder="e.g. Potatoes" /></label><Button type="submit" className="full">{saving ? 'Saving…' : 'Add crop'}</Button></form></div></div>}
  </main>
}

function loadChatHistory(userId: string): ChatTurn[] {
  const raw = sessionStorage.getItem(`agroweather_chat_${userId}`)
  if (!raw) return []

  try {
    const messages: unknown = JSON.parse(raw)
    if (
      Array.isArray(messages) &&
      messages.every(
        (message): message is ChatTurn =>
          message &&
          (message.role === 'user' || message.role === 'assistant') &&
          typeof message.content === 'string',
      )
    ) {
      return messages
    }
  } catch {
    sessionStorage.removeItem(`agroweather_chat_${userId}`)
  }
  return []
}

function Insights({
  user,
  cropInsights,
  insightsError,
  insightsLoading,
  onRefreshInsights,
}: {
  user: AuthUser
  cropInsights: CropInsight[]
  insightsError: string
  insightsLoading: boolean
  onRefreshInsights: () => void
}) {
  const [messages, setMessages] = useState<ChatTurn[]>(() => loadChatHistory(user.id))
  const [query, setQuery] = useState('')
  const [chatError, setChatError] = useState('')
  const [streamingReply, setStreamingReply] = useState('')
  const [sending, setSending] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const chatThread = useRef<HTMLDivElement>(null)
  useEffect(() => {
    sessionStorage.setItem(`agroweather_chat_${user.id}`, JSON.stringify(messages))
    if (chatOpen) {
      const thread = chatThread.current
      if (thread) thread.scrollTo({ top: thread.scrollHeight, behavior: 'smooth' })
    }
  }, [messages, streamingReply, chatError, user.id, chatOpen])

  const submitPrompt = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault()
    const message = query.trim()
    if (!message || sending) return

    setChatOpen(true)
    setSending(true)
    setChatError('')
    setStreamingReply('')
    const conversation = messages
    setMessages((currentMessages) => [...currentMessages, { role: 'user', content: message }])
    try {
      const reply = await streamFarmChat(message, conversation, setStreamingReply)
      setMessages((currentMessages) => [
        ...currentMessages,
        { role: 'assistant', content: reply },
      ])
      setQuery('')
    } catch (error) {
      setChatError(getUserErrorMessage(error, 'The farm assistant couldn’t reply. Please try again.'))
    } finally {
      setSending(false)
      setStreamingReply('')
    }
  }

  return <main className="app-content insights-page"><PageHeader eyebrow="Personalized for your crops" title="Weather insights" body="Crop guidance shaped by recent weather, current conditions, and your 7-day forecast."><Button variant="secondary" onClick={onRefreshInsights}>{insightsLoading ? 'Updating…' : 'Refresh'}</Button></PageHeader>
    <section className="crop-insights-section" aria-label="Personalized crop insights">
      <div className="crop-insights-heading"><div><span className="eyebrow"><Icon name="spark" size={14} /> This week on your farm</span><h2>Recommended for your crops</h2><p>Practical next steps based on your farm’s recent and upcoming conditions.</p></div><span className="insight-source-pill"><Icon name="cloud" size={14} /> Gemini + local weather</span></div>
      {insightsLoading && <div className="crop-insight-loading" role="status"><span className="insight-orbit"><Icon name="spark" /></span><div><b>Preparing your crop brief</b><p>Matching your crops with recent weather and the week ahead…</p></div><span className="typing-dots"><i /><i /><i /></span></div>}
      {insightsError && !insightsLoading && <div className="crop-insight-message error" role="alert"><Icon name="cloud" /><p>{insightsError}</p><button onClick={onRefreshInsights}>Try again</button></div>}
      {!insightsLoading && !insightsError && cropInsights.length === 0 && <div className="crop-insight-message"><span className="icon-tile"><Icon name="leaf" /></span><p>Add crops to your farm profile to get weather-based recommendations tailored to what you grow.</p></div>}
      {!insightsLoading && cropInsights.length > 0 && <div className="crop-insight-grid">{cropInsights.map((insight) => <article className="crop-insight-card" key={insight.crop}>
        <div className="crop-insight-card-head"><span className="insight-icon green"><Icon name="leaf" /></span><div><span className="tag green-tag">{insight.crop}</span><h3>{insight.headline}</h3></div></div>
        <div className="crop-insight-conditions"><span className="overline">Conditions to aim for</span><p>{insight.optimal_conditions}</p></div>
        <div className="crop-actions"><span className="overline">Best next steps</span>{insight.activities.map((activity, index) => <div className="crop-action" key={`${activity.activity}-${index}`}><span className="crop-action-number">{String(index + 1).padStart(2, '0')}</span><div><h4>{activity.activity}</h4><span className="crop-action-timing"><Icon name="clock" size={13} /> {activity.timing}</span><p>{activity.reason}</p></div></div>)}</div>
        <div className="harvest-note"><Icon name="sun" size={16} /><p><b>Harvest watch</b>{insight.harvest_guidance}</p></div>
      </article>)}</div>}
    </section>
    <div className="farm-chat-widget" onMouseEnter={() => setChatOpen(true)} onMouseLeave={() => {
      if (!document.querySelector('.composer-input textarea:focus')) setChatOpen(false)
    }}>
      <section className={`chat-history ${chatOpen ? 'is-open' : ''}`} aria-label="Farm assistant conversation" aria-hidden={!chatOpen}>
        <div className="chat-heading"><span className="icon-tile amber"><Icon name="spark" /></span><div><h2>Chat with AgroWeather</h2><p>Ask about your farm, crops, current weather, or forecast.</p></div></div>
        <div className="chat-thread" ref={chatThread} aria-live="polite">
          {messages.length === 0 && <div className="chat-message assistant"><b>AgroWeather assistant</b><p>Hi{user.first_name ? ` ${user.first_name}` : ''}! I can help you plan around your crops and local weather. What would you like to know?</p></div>}
          {messages.map((message, index) => <article className={`chat-message ${message.role}`} key={`${index}-${message.role}`}><b>{message.role === 'user' ? 'You' : 'AgroWeather assistant'}</b><p>{message.content}</p></article>)}
          {sending && <article className="chat-message assistant live-reply" role="status"><b>AgroWeather assistant</b>{streamingReply ? <p>{streamingReply}</p> : <span className="typing-dots" aria-label="Waiting for a reply"><i /><i /><i /></span>}</article>}
          {chatError && <article className="chat-message assistant chat-failure" role="alert"><b>AgroWeather assistant</b><p>{chatError}</p></article>}
        </div>
      </section>
      <button className="farm-chat-launcher" type="button" title="Chat with AgroWeather" aria-label={chatOpen ? 'Close AgroWeather chat history' : 'Open AgroWeather chat history'} aria-expanded={chatOpen} onClick={() => setChatOpen((open) => !open)}><Icon name={chatOpen ? 'close' : 'chat'} size={23} /></button>
    </div>
    <div className="ai-chat-dock">
      <div className="ai-composer">
        <div className="ai-composer-inner">
          <div className="quick-chips"><span>Try asking:</span>{['Will it rain this week?', 'What crops are on my farm?', 'What should I do today?'].map((prompt) => <button key={prompt} type="button" onClick={() => setQuery(prompt)}>{prompt}</button>)}</div>
          <form className="composer-input" onSubmit={(event) => void submitPrompt(event)}>
            <textarea rows={1} value={query} onFocus={() => setChatOpen(true)} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void submitPrompt() } }} placeholder="Ask the farm assistant about your farm…" aria-label="Message the farm assistant" />
            <button type="submit" disabled={sending || !query.trim()} aria-label="Send message"><Icon name="send" /></button>
          </form>
          <small>Weather and crop guidance is informational.</small>
        </div>
      </div>
    </div>
  </main>
}

function Profile({ user, onSignOut }: { user: AuthUser; onSignOut: () => void }) {
  const initials = user.first_name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
  return <main className="app-content"><PageHeader eyebrow="Your account" title="Farm profile" body="Account details saved by AgroWeather."><Button variant="secondary" icon="logout" onClick={onSignOut}>Sign out</Button></PageHeader>
    <section className="profile-grid"><article className="card profile-card"><div className="avatar">{initials}</div><h2>{user.first_name}</h2><p>Account created {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'date unavailable'}</p><div className="profile-meta"><span><small>Email</small><b>{user.email}</b></span><span><small>User ID</small><b>{user.id}</b></span></div></article>
      <article className="card farm-info"><div className="section-title compact"><div><span className="eyebrow">Farm details</span><h2>{user.farm_name || 'Farm name not set'}</h2></div><span className="tag green-tag">Account</span></div><div className="info-grid"><span><small>Location</small><b>{user.location || 'Not set'}</b></span><span><small>Farm size</small><b>{user.acres || 'Not set'}</b></span><span><small>Saved crops</small><b>{user.crops?.length ?? 0}</b></span><span><small>Crops</small><b>{user.crops?.join(', ') || 'None saved'}</b></span></div><p className="profile-note">The current backend does not expose profile-edit or account-deletion endpoints.</p></article>
      <article className="card station-card"><div><span className="icon-tile blue"><Icon name="station" /></span><span><small>Station code on account</small><h3>{user.station_code || 'No station code saved'}</h3><p>Station status and pairing are managed separately by the backend.</p></span></div></article>
    </section>
  </main>
}

function Settings({ go, onPair, onSignOut }: { go: (p: Page) => void; onPair: () => void; onSignOut: () => void }) {
  const [email, setEmail] = useState(() => localStorage.getItem('agroweather_weekly_summary') !== 'false')
  const [alerts, setAlerts] = useState(() => localStorage.getItem('agroweather_weather_alerts') !== 'false')
  const togglePreference = (key: string, value: boolean, update: (value: boolean) => void) => {
    localStorage.setItem(key, String(!value))
    update(!value)
  }
  return <main className="app-content"><PageHeader eyebrow="Preferences" title="Settings" body="Display units and notification preferences are stored in this browser." />
    <section className="settings-layout"><div>
      <article className="card settings-card"><div className="settings-heading"><span className="icon-tile"><Icon name="settings" /></span><div><h2>Units & display</h2><p>Measurements are currently displayed in backend-provided units.</p></div></div><label className="setting-row"><span><b>Temperature</b><small>Backend values are degrees Celsius</small></span><select disabled><option>Celsius (°C)</option></select></label><label className="setting-row"><span><b>Wind speed</b><small>Backend values are kilometres per hour</small></span><select disabled><option>km/h</option></select></label><label className="setting-row"><span><b>Rainfall</b><small>Backend values are millimetres</small></span><select disabled><option>Millimetres</option></select></label></article>
      <article className="card settings-card"><div className="settings-heading"><span className="icon-tile amber"><Icon name="bell" /></span><div><h2>Local preferences</h2><p>Saved in this browser only; server notifications are not available.</p></div></div><button className="setting-row" onClick={() => togglePreference('agroweather_weather_alerts', alerts, setAlerts)}><span><b>Show weather alerts</b><small>Enable weather alerts in this browser</small></span><i className={`toggle ${alerts ? 'on' : ''}`}><span /></i></button><button className="setting-row" onClick={() => togglePreference('agroweather_weekly_summary', email, setEmail)}><span><b>Weekly summary preference</b><small>Preference only; no email is sent</small></span><i className={`toggle ${email ? 'on' : ''}`}><span /></i></button></article>
    </div><aside><article className="card settings-card"><div className="settings-heading"><span className="icon-tile blue"><Icon name="station" /></span><div><h2>Weather station</h2><p>Station reading from the backend API.</p></div></div><div className="connected-device"><span><i /> Station pairing</span><small>Post-registration pairing is not supported by the current API.</small></div><Button variant="secondary" onClick={onPair} className="full">Station details</Button></article><article className="card settings-card legal-list"><h2>Privacy & legal</h2><button onClick={() => go('privacy')}><span><Icon name="shield" /> Privacy policy</span><Icon name="chevron" /></button><button onClick={() => go('terms')}><span><Icon name="check" /> Terms of service</span><Icon name="chevron" /></button><button className="danger" onClick={onSignOut}><span><Icon name="logout" /> Sign out</span><Icon name="chevron" /></button></article></aside></section>
  </main>
}

function Legal({ type, go }: { type: 'privacy' | 'terms'; go: (p: Page) => void }) {
  const privacy = type === 'privacy'
  return <div className="legal-page"><PublicNav go={go} /><main><button className="back-link" onClick={() => go('landing')}>← Back to home</button><span className="eyebrow">Legal · Updated 12 May 2025</span><h1>{privacy ? 'Privacy policy' : 'Terms of service'}</h1><p className="legal-lead">{privacy ? 'We believe your farm data belongs to you. This policy explains what we collect and how we protect it.' : 'These terms explain the rules for using AgroWeather and our responsibilities to each other.'}</p>{(privacy ? [
    ['Information we collect', 'We collect account details, farm locations, crop information, and measurements sent by connected weather stations. This lets us provide local forecasts and personalized insights.'],
    ['How we use farm data', 'Your information is used to operate AgroWeather, improve recommendations, and send alerts you choose to receive. We do not sell individual farm data.'],
    ['Your choices and rights', 'You can update, export, or delete your data from your account settings. You can also change notification preferences at any time.'],
  ] : [
    ['Using AgroWeather', 'You must provide accurate account information and use the service lawfully. Forecasts and AI insights support decisions but do not replace professional agronomic advice.'],
    ['Connected stations', 'You are responsible for installing and maintaining compatible hardware according to the manufacturer instructions.'],
    ['Service availability', 'We work to keep AgroWeather reliable, but weather data and network services may occasionally be delayed or unavailable.'],
  ]).map(([title, body], i) => <section key={title}><span>0{i+1}</span><div><h2>{title}</h2><p>{body}</p></div></section>)}</main><footer><Logo onClick={() => go('landing')} /><div><button onClick={() => go('privacy')}>Privacy</button><button onClick={() => go('terms')}>Terms</button></div></footer></div>
}

function PairModal({ close, stationCode }: { close: () => void; stationCode?: string | null }) {
  return <div className="modal-backdrop" onClick={close}><div className="modal" onClick={event => event.stopPropagation()}><button className="modal-close" onClick={close}><Icon name="close" /></button><span className="icon-tile blue"><Icon name="station" /></span><h2>Station details</h2><p>{stationCode ? `Saved station code: ${stationCode}.` : 'No station code is saved on this account.'}</p><p>The backend currently provides weather readings but does not expose an endpoint to pair or update a station from this screen.</p><Button onClick={close} className="full">Close</Button></div></div>
}

export default function App() {
  const [page, setPage] = useState<Page>(() => {
    const path = window.location.pathname
    const match = (['signin', 'signup', 'dashboard', 'weather', 'crops', 'insights', 'profile', 'settings', 'privacy', 'terms'] as Page[])
      .find((item) => path === `/${item}`)
    return match ?? 'landing'
  })
  const [user, setUser] = useState<AuthUser | null>(getStoredUser)
  const [bootstrapping, setBootstrapping] = useState(true)
  const [pairing, setPairing] = useState(false)
  const [sessionMessage, setSessionMessage] = useState('')
  const [cropInsights, setCropInsights] = useState<CropInsight[]>([])
  const [insightsError, setInsightsError] = useState('')
  const [insightsLoading, setInsightsLoading] = useState(true)
  const [insightsRefresh, setInsightsRefresh] = useState(0)

  useEffect(() => {
    if (!user || bootstrapping) return

    let active = true
    setInsightsLoading(true)
    setInsightsError('')
    void fetchCropInsights()
      .then((result) => {
        if (active) setCropInsights(result.insights)
      })
      .catch((error: unknown) => {
        if (active) {
          setInsightsError(
            getUserErrorMessage(error, 'Crop insights couldn’t be loaded. Please try again.'),
          )
        }
      })
      .finally(() => {
        if (active) setInsightsLoading(false)
      })
    return () => {
      active = false
    }
  }, [user, bootstrapping, insightsRefresh])

  useEffect(() => {
    let active = true
    const token = localStorage.getItem('agroweather_token')
    if (!token) {
      setBootstrapping(false)
      return () => {
        active = false
      }
    }

    void fetchMe()
      .then((currentUser) => {
        if (!active) return
        setUser(currentUser)
        if (['signin', 'signup', 'landing'].includes(page)) setPage('dashboard')
      })
      .catch((error: unknown) => {
        if (!active) return
        if (error instanceof ApiError && error.status === 401) {
          clearSession()
          setUser(null)
          setSessionMessage('Your session expired. Please sign in again.')
          if (!['privacy', 'terms'].includes(page)) {
            window.history.replaceState({}, '', '/signin')
            setPage('signin')
          }
        } else {
          setSessionMessage('We couldn’t reconnect your account. Check your connection and try again.')
        }
      })
      .finally(() => {
        if (active) setBootstrapping(false)
      })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname
      const next = (['signin', 'signup', 'dashboard', 'weather', 'crops', 'insights', 'profile', 'settings', 'privacy', 'terms'] as Page[])
        .find((item) => path === `/${item}`) ?? 'landing'
      if (['dashboard', 'weather', 'crops', 'insights', 'profile', 'settings'].includes(next) && !user) {
        window.history.replaceState({}, '', '/signin')
        setPage('signin')
        return
      }
      setPage(next)
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [user])

  const privatePages: Page[] = ['dashboard', 'weather', 'crops', 'insights', 'profile', 'settings']
  const go = (requested: Page) => {
    const next = privatePages.includes(requested) && !user ? 'signin' : requested
    const path = next === 'landing' ? '/' : `/${next}`
    window.history.pushState({}, '', path)
    setPage(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const handleAuthSuccess = (authenticatedUser: AuthUser) => {
    setUser(authenticatedUser)
    setSessionMessage('')
    window.history.pushState({}, '', '/dashboard')
    setPage('dashboard')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const handleSignOut = () => {
    clearSession()
    setUser(null)
    setPairing(false)
    go('landing')
  }

  if (bootstrapping) return <div className="loading-screen">Connecting to AgroWeather…</div>
  if (page === 'landing') return <><Landing go={go} />{sessionMessage && <p className="session-message">{sessionMessage}</p>}</>
  if (page === 'signin' || page === 'signup') return <><AuthPage mode={page} go={go} onSuccess={handleAuthSuccess} />{sessionMessage && <p className="session-message">{sessionMessage}</p>}</>
  if (page === 'privacy' || page === 'terms') return <Legal type={page} go={go} />
  if (!user && privatePages.includes(page)) return <AuthPage mode="signin" go={go} onSuccess={handleAuthSuccess} />
  if (!user) return <Landing go={go} />
  return <>
    {sessionMessage && <p className="session-message" role="status">{sessionMessage}</p>}
    <AppShell page={page} go={go} user={user} onSignOut={handleSignOut}>
    {page === 'dashboard' && <Dashboard user={user} go={go} />}
    {page === 'weather' && <Weather user={user} />}
    {page === 'crops' && <Crops user={user} onUserUpdate={setUser} />}
    {page === 'insights' && <Insights user={user} cropInsights={cropInsights} insightsError={insightsError} insightsLoading={insightsLoading} onRefreshInsights={() => setInsightsRefresh((value) => value + 1)} />}
    {page === 'profile' && <Profile user={user} onSignOut={handleSignOut} />}
    {page === 'settings' && <Settings go={go} onPair={() => setPairing(true)} onSignOut={handleSignOut} />}
      {pairing && <PairModal close={() => setPairing(false)} stationCode={user.station_code} />}
    </AppShell>
  </>
}
