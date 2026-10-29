import { FormEvent, ReactNode, useState } from 'react'

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

const Button = ({ children, variant = 'primary', icon, onClick, type = 'button', className = '' }: {
  children: ReactNode; variant?: 'primary' | 'secondary' | 'ghost' | 'amber'; icon?: IconName; onClick?: () => void; type?: 'button' | 'submit'; className?: string
}) => <button type={type} onClick={onClick} className={`btn btn-${variant} ${className}`}>{children}{icon && <Icon name={icon} size={18} />}</button>

const navItems: { id: Page; label: string; icon: IconName }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'home' },
  { id: 'weather', label: 'Weather', icon: 'cloud' },
  { id: 'crops', label: 'Crops', icon: 'leaf' },
  { id: 'insights', label: 'AI Insights', icon: 'spark' },
  { id: 'profile', label: 'Profile', icon: 'user' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
]

const forecasts = [
  { day: 'Today', icon: 'sun' as IconName, hi: 26, lo: 14, rain: 5 },
  { day: 'Tue', icon: 'cloud' as IconName, hi: 23, lo: 13, rain: 20 },
  { day: 'Wed', icon: 'rain' as IconName, hi: 19, lo: 11, rain: 75 },
  { day: 'Thu', icon: 'cloud' as IconName, hi: 21, lo: 12, rain: 30 },
  { day: 'Fri', icon: 'sun' as IconName, hi: 25, lo: 14, rain: 10 },
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
            <p>Hyperlocal weather, crop-aware alerts, and practical AI guidance—all in one calm workspace for your farm.</p>
            <div className="hero-actions">
              <Button icon="arrow" onClick={() => go('signup')}>Start for free</Button>
              <Button variant="secondary" onClick={() => go('dashboard')}>Explore dashboard</Button>
            </div>
            <div className="trust-row"><span><Icon name="check" size={16} /> No credit card</span><span><Icon name="check" size={16} /> 10-minute setup</span></div>
          </div>
          <div className="hero-visual">
            <img className="field-photo" src="https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&w=1200&q=85" alt="Rows of green crops on a farm" />
            <div className="live-card">
              <div className="live-head"><div><span className="overline">North field · Live</span><strong>Clear skies</strong></div><span className="status-dot">Online</span></div>
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
              ['spark', 'Practical AI insights', 'Plain-language recommendations based on your crops, growth stage, and weather.'],
              ['leaf', 'Crop monitoring', 'Track every field’s health, tasks, and risks without clutter or complex tools.'],
            ].map(([icon, title, body]) => <article className="feature-card" key={title}><span className={`icon-tile ${icon === 'cloud' ? 'blue' : ''}`}><Icon name={icon as IconName} /></span><h3>{title}</h3><p>{body}</p><button onClick={() => go('signup')}>Learn more <Icon name="arrow" size={16} /></button></article>)}
          </div>
        </section>

        <section className="how section">
          <div className="section-heading"><span className="eyebrow">Simple from day one</span><h2>From field to forecast in three steps</h2></div>
          <div className="steps">
            {[
              ['01', 'Create your farm', 'Add your location, fields, and the crops you’re growing.'],
              ['02', 'Pair your station', 'Enter the code on your AgroWeather station to connect live data.'],
              ['03', 'Grow with confidence', 'Receive daily forecasts, alerts, and crop-specific guidance.'],
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

function AuthPage({ mode, go }: { mode: 'signin' | 'signup'; go: (page: Page) => void }) {
  const [step, setStep] = useState(1)
  const handleSubmit = (e: FormEvent) => { e.preventDefault(); if (mode === 'signin' || step === 3) go('dashboard'); else setStep(step + 1) }
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
          {mode === 'signup' && <div className="stepper">{[1,2,3].map((n) => <span key={n} className={step >= n ? 'active' : ''}><i>{step > n ? '✓' : n}</i><small>{['Account', 'Farm info', 'Pair station'][n-1]}</small></span>)}</div>}
          <span className="eyebrow">{mode === 'signin' ? 'Welcome back' : `Step ${step} of 3`}</span>
          <h2>{mode === 'signin' ? 'Sign in to your farm' : step === 1 ? 'Create your account' : step === 2 ? 'Tell us about your farm' : 'Pair your weather station'}</h2>
          <p>{mode === 'signin' ? 'Your fields and latest insights are waiting.' : step === 3 ? 'Enter the pairing code shown on your station.' : 'A few details and your workspace will be ready.'}</p>
          <form onSubmit={handleSubmit}>
            {mode === 'signin' || step === 1 ? <>
              {mode === 'signup' && <label>Full name<input required placeholder="e.g. Sarah Mitchell" /></label>}
              <label>Email address<input required type="email" placeholder="you@farm.com" /></label>
              <label>Password<input required type="password" placeholder="At least 8 characters" /></label>
              {mode === 'signin' && <div className="form-row"><label className="checkbox"><input type="checkbox" /> Keep me signed in</label><button type="button">Forgot password?</button></div>}
            </> : step === 2 ? <>
              <label>Farm name<input required placeholder="e.g. Willow Creek Farm" /></label>
              <label>Farm location<input required placeholder="Town or postcode" /></label>
              <div className="two-col"><label>Farm size<input required placeholder="48" /></label><label>Unit<select><option>Hectares</option><option>Acres</option></select></label></div>
            </> : <div className="pair-box"><span className="icon-tile"><Icon name="station" /></span><label>Station pair code<input className="code-input" defaultValue="AGR-8401" /></label><small>Find this 8-character code on the label beneath your station.</small></div>}
            <Button type="submit" icon="arrow" className="full">{mode === 'signin' ? 'Sign in' : step === 3 ? 'Finish setup' : 'Continue'}</Button>
          </form>
          <div className="auth-switch">{mode === 'signin' ? 'New to AgroWeather?' : 'Already have an account?'} <button onClick={() => go(mode === 'signin' ? 'signup' : 'signin')}>{mode === 'signin' ? 'Create account' : 'Sign in'}</button></div>
        </div>
      </div>
    </div>
  )
}

function AppShell({ page, go, children }: { page: Page; go: (p: Page) => void; children: ReactNode }) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Logo onClick={() => go('dashboard')} />
        <nav>{navItems.map(item => <button className={page === item.id ? 'active' : ''} key={item.id} onClick={() => go(item.id)}><Icon name={item.icon} /><span>{item.label}</span></button>)}</nav>
        <div className="sidebar-bottom"><div className="support-card"><span className="icon-tile amber"><Icon name="spark" /></span><strong>Need a hand?</strong><small>Ask Agro AI about your farm.</small><button onClick={() => go('insights')}>Start a chat <Icon name="arrow" size={15} /></button></div><button className="user-chip" onClick={() => go('profile')}><span>SM</span><div><strong>Sarah Mitchell</strong><small>Willow Creek Farm</small></div><Icon name="chevron" size={16} /></button></div>
      </aside>
      <div className="app-main">
        <header className="mobile-header"><Logo onClick={() => go('dashboard')} /><button><Icon name="bell" /></button></header>
        {children}
      </div>
      <nav className="bottom-nav">{navItems.slice(0,5).map(item => <button className={page === item.id ? 'active' : ''} key={item.id} onClick={() => go(item.id)}><Icon name={item.icon} /><small>{item.label === 'AI Insights' ? 'Insights' : item.label}</small></button>)}</nav>
    </div>
  )
}

function PageHeader({ eyebrow, title, body, children }: { eyebrow: string; title: string; body?: string; children?: ReactNode }) {
  return <header className="page-header"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1>{body && <p>{body}</p>}</div><div className="header-actions">{children}</div></header>
}

function ForecastStrip({ detailed = false }: { detailed?: boolean }) {
  return <div className={detailed ? 'forecast-grid detailed' : 'forecast-grid'}>{forecasts.map((f, i) => <article className={i === 0 ? 'forecast active' : 'forecast'} key={f.day}><strong>{f.day}</strong><Icon name={f.icon} size={detailed ? 34 : 26} /><div><b>{f.hi}°</b><span>{f.lo}°</span></div><small><Icon name="droplet" size={13} /> {f.rain}%</small>{detailed && <em>{i === 2 ? 'Rain' : i === 1 || i === 3 ? 'Partly cloudy' : 'Mostly sunny'}</em>}</article>)}</div>
}

function Dashboard() {
  const [tasks, setTasks] = useState([false, false, true])
  return (
    <main className="app-content">
      <PageHeader eyebrow="Monday, 12 May" title="Good morning, Sarah" body="Here’s what’s happening across Willow Creek Farm."><button className="icon-button"><Icon name="bell" /></button><Button variant="secondary" icon="station">Station online</Button></PageHeader>
      <section className="dashboard-grid">
        <article className="conditions-card">
          <div className="conditions-top"><div><span className="overline">North field · Now</span><h2>Clear and mild</h2></div><span className="status-dot light">Updated 2m ago</span></div>
          <div className="conditions-main"><div className="big-weather"><Icon name="sun" size={66} /><strong>24<span>°C</span></strong></div><div className="weather-copy"><strong>Feels like 23°</strong><span>High 26° · Low 14°</span></div></div>
          <div className="conditions-metrics"><span><Icon name="droplet" /> <b>62%</b><small>Humidity</small></span><span><Icon name="wind" /> <b>9 km/h</b><small>NW wind</small></span><span><Icon name="rain" /> <b>0 mm</b><small>Rain today</small></span></div>
        </article>
        <article className="card ai-card"><div className="card-title"><div><span className="eyebrow">Agro AI</span><h2>Today’s field note</h2></div><span className="icon-tile amber"><Icon name="spark" /></span></div><p>Soil moisture in the tomato block is trending low. Irrigate before 8 AM tomorrow to reduce evaporation loss.</p><div className="confidence"><span style={{ width: '88%' }} /><small>High confidence · Based on station and crop data</small></div><button>View full insight <Icon name="arrow" size={16} /></button></article>
      </section>
      <section className="content-section"><div className="section-title"><div><h2>5-day forecast</h2><p>A calm start, with rain likely Wednesday.</p></div><button>View weather <Icon name="arrow" size={16} /></button></div><ForecastStrip /></section>
      <section className="lower-grid">
        <article className="card"><div className="section-title compact"><div><h2>Priority tasks</h2><p>3 tasks for this week</p></div><Button variant="ghost" icon="plus">Add</Button></div><div className="task-list">{[
          ['Irrigate tomato block', 'Tomorrow · Before 8:00 AM', 'amber'],
          ['Check wheat for leaf rust', 'Wednesday · North field', 'green'],
          ['Calibrate soil sensor', 'Completed yesterday', 'gray'],
        ].map(([title, meta, tone], i) => <button className={`task ${tasks[i] ? 'done' : ''}`} key={title} onClick={() => setTasks(tasks.map((v,j) => j === i ? !v : v))}><span className={`task-check ${tone}`}>{tasks[i] && <Icon name="check" size={15} />}</span><span><strong>{title}</strong><small>{meta}</small></span><Icon name="chevron" size={16} /></button>)}</div></article>
        <article className="card"><div className="section-title compact"><div><h2>Crop overview</h2><p>3 active crops</p></div><button>Manage</button></div><div className="crop-mini">{[['Tomatoes','Flowering','Healthy','72%'],['Winter wheat','Tillering','Watch','54%'],['Sweet corn','V4 stage','Healthy','31%']].map(([crop, stage, status, width]) => <div key={crop}><span className="crop-symbol"><Icon name="leaf" size={18} /></span><div><strong>{crop}</strong><small>{stage}</small><i><span style={{ width }} /></i></div><em className={status === 'Watch' ? 'tag amber-tag' : 'tag green-tag'}>{status}</em></div>)}</div></article>
      </section>
    </main>
  )
}

function Weather() {
  const [station, setStation] = useState('North Field Station')
  return <main className="app-content"><PageHeader eyebrow="Live field weather" title="Weather" body="Hyperlocal conditions from your farm station."><label className="select-control"><Icon name="station" size={17} /><select value={station} onChange={e => setStation(e.target.value)}><option>North Field Station</option><option>Orchard Station</option></select></label></PageHeader>
    <article className="weather-hero">
      <div><span className="status-dot light">Live · updated just now</span><h2>{station}</h2><p>Willow Creek Farm · 51.5074° N</p></div>
      <div className="weather-display"><Icon name="sun" size={86} /><strong>24<span>°C</span></strong><div><b>Clear skies</b><span>Feels like 23°C</span><small>H: 26° · L: 14°</small></div></div>
      <div className="sun-times"><span><Icon name="sun" /><small>Sunrise</small><strong>5:42 AM</strong></span><span><Icon name="sun" /><small>Sunset</small><strong>8:14 PM</strong></span></div>
    </article>
    <section className="metric-grid">{[['droplet','Humidity','62','%'],['wind','Wind','9','km/h'],['pressure','Pressure','1,016','hPa'],['rain','Rain today','0.0','mm']].map(([icon,label,value,unit]) => <article className="metric-card" key={label}><span className="icon-tile blue"><Icon name={icon as IconName} /></span><div><small>{label}</small><strong>{value}<em>{unit}</em></strong></div><span className="trend">Normal</span></article>)}</section>
    <section className="content-section"><div className="section-title"><div><h2>5-day forecast</h2><p>Weather outlook for North Field.</p></div><span className="updated"><Icon name="clock" size={14} /> Updated 2 min ago</span></div><ForecastStrip detailed /></section>
  </main>
}

function Crops() {
  const [showAdd, setShowAdd] = useState(false)
  const [crops, setCrops] = useState([
    { name: 'Tomatoes', variety: 'Roma · South block', stage: 'Flowering', health: 'Healthy', progress: 72, color: 'tomato' },
    { name: 'Winter wheat', variety: 'Galloway · North field', stage: 'Tillering', health: 'Needs attention', progress: 54, color: 'wheat' },
    { name: 'Sweet corn', variety: 'Golden Bantam · East field', stage: 'V4 stage', health: 'Healthy', progress: 31, color: 'corn' },
  ])
  const addCrop = (e: FormEvent<HTMLFormElement>) => { e.preventDefault(); const data = new FormData(e.currentTarget); setCrops([...crops, { name: String(data.get('name')), variety: 'New crop · Unassigned field', stage: 'Planted', health: 'Healthy', progress: 8, color: 'green' }]); setShowAdd(false) }
  return <main className="app-content"><PageHeader eyebrow={`${crops.length} active crops`} title="Your crops" body="Monitor crop health, growth stages, and field conditions."><Button icon="plus" onClick={() => setShowAdd(true)}>Add crop</Button></PageHeader>
    <section className="crop-grid">{crops.map((crop, i) => <article className="crop-card" key={`${crop.name}-${i}`}><div className={`crop-art ${crop.color}`}><Icon name="leaf" size={44} /><span className={crop.health === 'Needs attention' ? 'tag amber-tag' : 'tag green-tag'}>{crop.health}</span></div><div className="crop-body"><span className="overline">{crop.variety}</span><h2>{crop.name}</h2><div className="growth"><span><b>{crop.stage}</b><small>{crop.progress}% of season</small></span><i><span style={{ width: `${crop.progress}%` }} /></i></div><div className="crop-stats"><span><small>Soil moisture</small><b>{i === 1 ? '48%' : '64%'}</b></span><span><small>Next task</small><b>{i === 1 ? 'Inspect Wed' : 'Water Tue'}</b></span></div><Button variant="secondary" icon="arrow">Manage crop</Button></div></article>)}</section>
    <section className="field-summary card"><span className="icon-tile"><Icon name="leaf" /></span><div><h3>Fields are looking good</h3><p>2 of 3 crops are in optimal condition. Winter wheat has a moderate leaf rust risk after Wednesday’s rain.</p></div><Button variant="secondary">View field report</Button></section>
    {showAdd && <div className="modal-backdrop" onClick={() => setShowAdd(false)}><div className="modal" onClick={e => e.stopPropagation()}><button className="modal-close" onClick={() => setShowAdd(false)}><Icon name="close" /></button><span className="icon-tile"><Icon name="leaf" /></span><h2>Add a crop</h2><p>Start tracking a crop and receive tailored weather insights.</p><form onSubmit={addCrop}><label>Crop name<input name="name" required placeholder="e.g. Potatoes" /></label><label>Field<select><option>North field</option><option>South block</option><option>East field</option></select></label><Button type="submit" className="full">Add crop</Button></form></div></div>}
  </main>
}

const initialInsights = [
  { severity: 'Action recommended', tone: 'amber', title: 'Irrigate tomatoes before tomorrow’s heat', body: 'Soil moisture is trending low and tomorrow afternoon will reach 28°C. A 20-minute drip cycle before 8 AM will reduce plant stress.', crop: 'Tomatoes', time: '12 min ago', icon: 'droplet' as IconName },
  { severity: 'Weather watch', tone: 'blue', title: 'Rain window arriving Wednesday', body: 'Expect 8–12 mm between 2 PM and 9 PM. Delay fertilizer application until Thursday morning to avoid runoff.', crop: 'All fields', time: '1 hr ago', icon: 'rain' as IconName },
  { severity: 'Monitor', tone: 'rose', title: 'Moderate leaf rust risk in wheat', body: 'Cool, damp conditions after Wednesday’s rain may favor leaf rust. Inspect lower leaves in the north field within 48 hours.', crop: 'Winter wheat', time: 'Today, 7:20 AM', icon: 'shield' as IconName },
  { severity: 'Good news', tone: 'green', title: 'Strong conditions for corn growth', body: 'Soil temperature and moisture are in the optimal range for your sweet corn’s V4 growth stage this week.', crop: 'Sweet corn', time: 'Yesterday', icon: 'leaf' as IconName },
]

function Insights() {
  const [query, setQuery] = useState('')
  const [messages, setMessages] = useState<string[]>([])
  const send = () => { if (query.trim()) { setMessages([...messages, query.trim()]); setQuery('') } }
  return <main className="app-content insights-page"><PageHeader eyebrow="Personalized for your farm" title="AI Insights" body="Timely recommendations built from your crops, station, and forecast."><span className="ai-status"><i /> Agro AI is online</span></PageHeader>
    <section className="insight-layout"><div className="insight-feed">{messages.map((m,i) => <article className="card user-question" key={i}><span className="icon-tile"><Icon name="user" /></span><div><span className="overline">You asked just now</span><h3>{m}</h3><p>Based on your current station data, conditions are stable. I’ll keep monitoring your fields and notify you if action is needed.</p></div></article>)}{initialInsights.map((item) => <article className="insight-card" key={item.title}><div className={`insight-icon ${item.tone}`}><Icon name={item.icon} /></div><div className="insight-content"><span className={`tag ${item.tone}-tag`}>{item.severity}</span><h2>{item.title}</h2><p>{item.body}</p><div><span><Icon name="leaf" size={14} /> {item.crop}</span><span><Icon name="clock" size={14} /> {item.time}</span></div></div><button><Icon name="chevron" size={18} /></button></article>)}</div>
      <aside className="insight-side"><article className="card"><span className="eyebrow">This week</span><h3>Your farm at a glance</h3><div className="risk-meter"><span><b>3</b><small>Healthy</small></span><span><b>1</b><small>To watch</small></span><span><b>2</b><small>Actions</small></span></div></article><article className="card"><span className="icon-tile amber"><Icon name="spark" /></span><h3>How insights work</h3><p>Agro AI combines your local station, crop stages, and forecast to suggest timely actions.</p></article></aside>
    </section>
    <div className="ai-composer"><div className="quick-chips"><span>Ask Agro AI:</span>{['Will it rain?', 'Irrigation advice', 'Check crop risks'].map(chip => <button key={chip} onClick={() => setQuery(chip)}>{chip}</button>)}</div><div className="composer-input"><textarea rows={1} value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }} placeholder="Ask about your weather, crops, or field tasks..." /><button onClick={send} aria-label="Send message"><Icon name="send" /></button></div><small>Agro AI can make mistakes. Check important agronomic decisions.</small></div>
  </main>
}

function Profile({ onPair }: { onPair: () => void }) {
  return <main className="app-content"><PageHeader eyebrow="Your account" title="Farm profile" body="Manage the details that personalize your AgroWeather experience."><Button variant="secondary">Edit profile</Button></PageHeader>
    <section className="profile-grid"><article className="card profile-card"><div className="avatar">SM</div><h2>Sarah Mitchell</h2><p>Farm owner · Member since March 2024</p><div className="profile-meta"><span><small>Email</small><b>sarah@willowcreek.farm</b></span><span><small>Phone</small><b>+44 7700 900 124</b></span></div></article>
      <article className="card farm-info"><div className="section-title compact"><div><span className="eyebrow">Primary farm</span><h2>Willow Creek Farm</h2></div><span className="tag green-tag">Active</span></div><div className="info-grid"><span><small>Location</small><b>Shropshire, UK</b></span><span><small>Farm size</small><b>48 hectares</b></span><span><small>Active fields</small><b>3 fields</b></span><span><small>Main crops</small><b>Wheat, tomato, corn</b></span></div></article>
      <article className="card station-card"><div><span className="icon-tile blue"><Icon name="station" /></span><span><small>Connected station</small><h3>North Field Station</h3><p>AGR-8401 · Last synced just now</p></span></div><span className="status-dot">Online</span><Button variant="secondary" onClick={onPair}>Pair another station</Button></article>
    </section>
  </main>
}

function Settings({ go, onPair }: { go: (p: Page) => void; onPair: () => void }) {
  const [email, setEmail] = useState(true); const [alerts, setAlerts] = useState(true)
  return <main className="app-content"><PageHeader eyebrow="Preferences" title="Settings" body="Tune AgroWeather to how you work." />
    <section className="settings-layout"><div>
      <article className="card settings-card"><div className="settings-heading"><span className="icon-tile"><Icon name="settings" /></span><div><h2>Units & display</h2><p>Choose how measurements appear.</p></div></div><label className="setting-row"><span><b>Temperature</b><small>Used across forecasts and alerts</small></span><select><option>Celsius (°C)</option><option>Fahrenheit (°F)</option></select></label><label className="setting-row"><span><b>Wind speed</b><small>Your preferred wind unit</small></span><select><option>km/h</option><option>mph</option></select></label><label className="setting-row"><span><b>Rainfall</b><small>Your preferred precipitation unit</small></span><select><option>Millimetres</option><option>Inches</option></select></label></article>
      <article className="card settings-card"><div className="settings-heading"><span className="icon-tile amber"><Icon name="bell" /></span><div><h2>Notifications</h2><p>Control how we keep you informed.</p></div></div><button className="setting-row" onClick={() => setAlerts(!alerts)}><span><b>Critical weather alerts</b><small>Frost, storms, heat, and heavy rain</small></span><i className={`toggle ${alerts ? 'on' : ''}`}><span /></i></button><button className="setting-row" onClick={() => setEmail(!email)}><span><b>Weekly farm summary</b><small>Insights and forecast sent every Monday</small></span><i className={`toggle ${email ? 'on' : ''}`}><span /></i></button></article>
    </div><aside><article className="card settings-card"><div className="settings-heading"><span className="icon-tile blue"><Icon name="station" /></span><div><h2>Weather station</h2><p>Manage your connected hardware.</p></div></div><div className="connected-device"><span><i /> North Field Station</span><small>Online · AGR-8401</small></div><Button variant="secondary" onClick={onPair} className="full">Pair another station</Button></article><article className="card settings-card legal-list"><h2>Privacy & legal</h2><button onClick={() => go('privacy')}><span><Icon name="shield" /> Privacy policy</span><Icon name="chevron" /></button><button onClick={() => go('terms')}><span><Icon name="check" /> Terms of service</span><Icon name="chevron" /></button><button className="danger"><span><Icon name="logout" /> Sign out</span><Icon name="chevron" /></button></article></aside></section>
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

function PairModal({ close }: { close: () => void }) {
  const [paired, setPaired] = useState(false)
  return <div className="modal-backdrop" onClick={close}><div className="modal" onClick={e => e.stopPropagation()}><button className="modal-close" onClick={close}><Icon name="close" /></button>{paired ? <><span className="icon-tile success"><Icon name="check" /></span><h2>Station connected</h2><p>South Field Station is now linked and will begin sending data shortly.</p><Button onClick={close} className="full">Done</Button></> : <><span className="icon-tile blue"><Icon name="station" /></span><h2>Pair a weather station</h2><p>Enter the code printed beneath your AgroWeather station.</p><label>Pair code<input className="code-input" placeholder="AGR-0000" /></label><Button onClick={() => setPaired(true)} className="full">Connect station</Button><small className="modal-help">Keep your station powered on and within Wi-Fi range.</small></>}</div></div>
}

export default function App() {
  const [page, setPage] = useState<Page>('landing')
  const [pairing, setPairing] = useState(false)
  const go = (next: Page) => { setPage(next); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  if (page === 'landing') return <Landing go={go} />
  if (page === 'signin' || page === 'signup') return <AuthPage mode={page} go={go} />
  if (page === 'privacy' || page === 'terms') return <Legal type={page} go={go} />
  return <AppShell page={page} go={go}>
    {page === 'dashboard' && <Dashboard />}
    {page === 'weather' && <Weather />}
    {page === 'crops' && <Crops />}
    {page === 'insights' && <Insights />}
    {page === 'profile' && <Profile onPair={() => setPairing(true)} />}
    {page === 'settings' && <Settings go={go} onPair={() => setPairing(true)} />}
    {pairing && <PairModal close={() => setPairing(false)} />}
  </AppShell>
}
