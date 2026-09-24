import { useState } from 'react'

interface DashboardProps {
  onNavigate: (tab: string) => void
  onAddStation: () => void
  onShowNotifications: () => void
}

const stations = [
  { name: 'Field A — North', temp: 24, humidity: 68, wind: 12, status: 'live', signal: 92 },
  { name: 'Field B — Corn', temp: 23, humidity: 71, wind: 9, status: 'live', signal: 87 },
  { name: 'Greenhouse', temp: 28, humidity: 84, wind: 0, status: 'live', signal: 99 },
]

const insights = [
  {
    type: 'irrigation',
    crop: 'Corn — Field B',
    title: 'Skip Thursday irrigation',
    body: '14mm of rain expected Thursday 2–5pm. Soil moisture at 68% — irrigation would cause oversaturation. Resume Friday evening.',
    priority: 'high',
    saved: '$340 est.',
  },
  {
    type: 'harvest',
    crop: 'Soybeans — Field A',
    title: 'Harvest window opens in 4 days',
    body: 'Moisture content projected at 13.2% by Sept 26. Dry conditions forecast through Sept 29. Ideal 3-day combine window.',
    priority: 'medium',
    saved: null,
  },
  {
    type: 'frost',
    crop: 'All fields',
    title: 'Light frost possible Oct 3',
    body: 'Temperatures may dip to -1°C on the night of Oct 3–4. Consider frost cloth for tomato beds and any late-season seedlings.',
    priority: 'warning',
    saved: null,
  },
]

const tasks = [
  { title: 'Apply fertilizer — Field A', time: 'Today', done: false, ai: false },
  { title: 'Check irrigation lines — South pivot', time: 'Tomorrow', done: false, ai: false },
  { title: 'Soil sample — Greenhouse beds', time: 'Sep 25', done: true, ai: false },
  { title: 'Harvest window — Soybeans', time: 'Sep 26', done: false, ai: true },
]

const hourly = [
  { hour: 'Now', temp: 24, icon: '☀️' },
  { hour: '3pm', temp: 26, icon: '🌤️' },
  { hour: '6pm', temp: 22, icon: '⛅' },
  { hour: '9pm', temp: 17, icon: '🌙' },
  { hour: '12am', temp: 14, icon: '🌙' },
  { hour: '3am', temp: 12, icon: '🌙' },
  { hour: '6am', temp: 13, icon: '🌤️' },
]

export default function Dashboard({ onNavigate, onAddStation, onShowNotifications }: DashboardProps) {
  const [addedInsight, setAddedInsight] = useState<number | null>(null)

  const priorityStyle = (p: string) => {
    if (p === 'high') return { bg: 'bg-[var(--warning)]', text: 'text-[var(--accent)]', label: 'Action today' }
    if (p === 'warning') return { bg: 'bg-[var(--danger-soft)]', text: 'text-[var(--danger-strong)]', label: 'Alert' }
    return { bg: 'bg-[var(--secondary)]', text: 'text-[var(--primary)]', label: 'Plan ahead' }
  }

  const typeIcon = (t: string) => {
    if (t === 'irrigation') return '💧'
    if (t === 'harvest') return '🌾'
    if (t === 'frost') return '❄️'
    return '🤖'
  }

  return (
    <div className="pb-24 md:pb-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[var(--muted-foreground)] font-medium">Good morning,</p>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Marcus 👋</h1>
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">Tuesday, September 22 · Ames, Iowa</p>
        </div>
        
      </div>

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
              <p className="text-[var(--success-soft)] text-xs font-medium mb-1">Live · Field A Station</p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-[var(--primary-foreground)]">24°C</span>
                <span className="text-[var(--success-soft)] text-sm">Feels 22°</span>
              </div>
              <p className="text-[var(--primary-foreground)] font-medium mt-1">Partly cloudy</p>
            </div>
            <div className="text-5xl">🌤️</div>
          </div>
          <div className="flex gap-4 mt-4 pt-4 border-t border-[var(--background)]/20">
            {[
              { icon: '💧', label: 'Humidity', val: '68%' },
              { icon: '💨', label: 'Wind', val: '12 km/h' },
              { icon: '🌡️', label: 'High/Low', val: '26° / 11°' },
              { icon: '🌧️', label: 'Rain', val: '0%' },
            ].map(m => (
              <div key={m.label} className="flex-1 min-w-0">
                <p className="text-[var(--success-soft)] text-xs">{m.label}</p>
                <p className="text-[var(--primary-foreground)] text-sm font-semibold truncate">{m.val}</p>
              </div>
            ))}
          </div>
          {/* Hourly forecast fills the weather card width. */}
          <div className="grid grid-cols-7 gap-2 mt-4">
            {hourly.map((h, i) => (
              <div key={i} className="min-w-0 flex flex-col items-center gap-1 bg-[var(--background)]/10 rounded-xl px-1.5 py-2">
                <span className="text-[var(--success-soft)] text-xs">{h.hour}</span>
                <span className="text-base">{h.icon}</span>
                <span className="text-[var(--primary-foreground)] text-sm font-semibold">{h.temp}°</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Station Status */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-[var(--foreground)] text-sm">Station Status</h2>
          <button onClick={() => onNavigate('profile')} className="text-xs text-[var(--primary)] font-medium hover:text-[var(--primary-hover)]">
            Manage →
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto hide-scrollbar -mx-1 px-1 pb-1">
          {stations.map((s, i) => (
            <div key={i} className="flex-shrink-0 bg-[var(--background)] border border-[var(--border)] rounded-xl p-3 w-44">
              <div className="flex items-center gap-1.5 mb-2">
                <div className="w-2 h-2 rounded-full bg-[var(--success)]" />
                <span className="text-xs text-[var(--muted-foreground)] font-medium truncate">{s.name}</span>
              </div>
              <p className="text-xl font-bold text-[var(--foreground)]">{s.temp}°C</p>
              <div className="flex gap-2 mt-1 text-xs text-[var(--muted-foreground)]">
                <span>💧{s.humidity}%</span>
                <span>💨{s.wind}km/h</span>
              </div>
              <div className="mt-2 flex items-center gap-1">
                <div className="flex-1 h-1 bg-[var(--muted)] rounded-full overflow-hidden">
                  <div className="h-full bg-[var(--sky)] rounded-full" style={{ width: `${s.signal}%` }} />
                </div>
                <span className="text-xs text-[var(--muted-foreground)]">{s.signal}%</span>
              </div>
            </div>
          ))}
          <button onClick={onAddStation} className="flex-shrink-0 bg-[var(--background)] border border-dashed border-[var(--border)] rounded-xl p-3 w-44 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[var(--primary)] transition-colors">
            <div className="w-8 h-8 rounded-full bg-[var(--secondary)] flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 2v10M2 7h10" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="text-xs text-[var(--muted-foreground)] text-center">Add station</span>
          </button>
        </div>
      </div>

      {/* AI Insights */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-[var(--foreground)] text-sm">Today's AI Insights</h2>
            <span className="text-xs bg-[var(--warning)] text-[var(--accent)] font-semibold px-2 py-0.5 rounded-full">3</span>
          </div>
          <button onClick={() => onNavigate('insights')} className="text-xs text-[var(--primary)] font-medium hover:text-[var(--primary-hover)]">
            View all →
          </button>
        </div>
        <div className="space-y-3">
          {insights.map((ins, i) => {
            const style = priorityStyle(ins.priority)
            return (
              <div key={i} className="bg-[var(--background)] border border-[var(--border)] rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl ${style.bg} flex items-center justify-center text-lg flex-shrink-0`}>
                    {typeIcon(ins.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span className={`text-xs font-semibold ${style.text}`}>{style.label}</span>
                      <span className="text-xs text-[var(--muted-foreground)]">{ins.crop}</span>
                    </div>
                    <p className="text-sm font-semibold text-[var(--foreground)] mb-1">{ins.title}</p>
                    <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">{ins.body}</p>
                    {ins.saved && (
                      <p className="text-xs text-[var(--success-strong)] font-medium mt-1.5">💰 {ins.saved}</p>
                    )}
                    <button
                      onClick={() => setAddedInsight(i)}
                      className={`mt-2.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                        addedInsight === i
                          ? 'bg-[var(--secondary)] text-[var(--primary)]'
                          : 'bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)]'
                      }`}
                    >
                      {addedInsight === i ? '✓ Added to calendar' : '+ Add to calendar'}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Upcoming Tasks */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-[var(--foreground)] text-sm">Upcoming Tasks</h2>
          <button onClick={() => onNavigate('calendar')} className="text-xs text-[var(--primary)] font-medium hover:text-[var(--primary-hover)]">
            View calendar →
          </button>
        </div>
        <div className="bg-[var(--background)] border border-[var(--border)] rounded-xl divide-y divide-[var(--muted)]">
          {tasks.map((task, i) => (
            <div key={i} className={`flex items-center gap-3 px-4 py-3 ${task.done ? 'opacity-50' : ''}`}>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                task.done ? 'border-[var(--primary)] bg-[var(--primary)]' : 'border-[var(--border)]'
              }`}>
                {task.done && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M1.5 5l2.5 2.5 5-5" stroke="var(--primary-foreground)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${task.done ? 'line-through text-[var(--muted-foreground)]' : 'text-[var(--foreground)]'}`}>
                  {task.title}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {task.ai && (
                  <span className="text-xs bg-[var(--warning)] text-[var(--accent)] font-medium px-1.5 py-0.5 rounded">AI</span>
                )}
                <span className="text-xs text-[var(--muted-foreground)]">{task.time}</span>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={() => onNavigate('calendar')}
          className="w-full mt-2 flex items-center justify-center gap-2 bg-[var(--background)] border border-dashed border-[var(--border)] text-[var(--muted-foreground)] text-sm font-medium py-2.5 rounded-xl hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Add task
        </button>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="font-semibold text-[var(--foreground)] text-sm mb-3">Quick Actions</h2>
        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: '📡', label: 'Check\nstations', tab: 'profile' },
            { icon: '🌦️', label: '7-day\nforecast', tab: 'weather' },
            { icon: '🌱', label: 'Crop\nadvice', tab: 'insights' },
            { icon: '📋', label: 'Add\ntask', tab: 'calendar' },
          ].map((a, i) => (
            <button
              key={i}
              onClick={() => onNavigate(a.tab)}
              className="bg-[var(--background)] border border-[var(--border)] rounded-xl p-3 flex flex-col items-center gap-2 hover:border-[var(--primary)] hover:shadow-sm transition-all"
            >
              <span className="text-2xl">{a.icon}</span>
              <span className="text-xs text-[var(--muted-foreground)] font-medium text-center whitespace-pre-line leading-tight">{a.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
