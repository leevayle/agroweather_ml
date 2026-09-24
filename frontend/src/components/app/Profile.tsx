import { useState } from 'react'

const stations = [
  { name: 'Field A — North', id: 'AGR-F1A2', battery: 87, signal: 92, lastSeen: '2 min ago', status: 'live' },
  { name: 'Field B — Corn', id: 'AGR-8B3D', battery: 62, signal: 87, lastSeen: '3 min ago', status: 'live' },
  { name: 'Greenhouse', id: 'AGR-C490', battery: 94, signal: 99, lastSeen: '1 min ago', status: 'live' },
]

const crops = [
  { name: 'Corn', field: 'Field B', area: '120 ac', planted: 'May 8', icon: '🌽' },
  { name: 'Soybeans', field: 'Field A', area: '85 ac', planted: 'May 14', icon: '🫘' },
  { name: 'Tomatoes', field: 'Greenhouse', area: '0.8 ac', planted: 'Mar 22', icon: '🍅' },
]

interface ProfileProps {
  onAddStation: () => void
  onLogout: () => void
}

export default function Profile({ onAddStation, onLogout }: ProfileProps) {
  const [notifications, setNotifications] = useState({
    frost: true,
    rain: true,
    aiInsights: true,
    weeklyReport: false,
    irrigationAlerts: true,
  })
  const [farmName, setFarmName] = useState('Thielmann Family Farm')
  const [cropList, setCropList] = useState(crops)
  const [settings, setSettings] = useState([
    { icon: '🌡️', label: 'Temperature unit', val: '°C (Celsius)', options: ['°C (Celsius)', '°F (Fahrenheit)'] },
    { icon: '💧', label: 'Rainfall unit', val: 'mm', options: ['mm', 'in'] },
    { icon: '💨', label: 'Wind speed unit', val: 'km/h', options: ['km/h', 'mph'] },
    { icon: '🌍', label: 'Language', val: 'English', options: ['English', 'Spanish', 'Portuguese'] },
  ])

  const toggle = (key: keyof typeof notifications) => {
    setNotifications(n => ({ ...n, [key]: !n[key] }))
  }

  return (
    <div className="pb-24 md:pb-8 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-[var(--primary)] flex items-center justify-center text-[var(--primary-foreground)] text-2xl font-bold">
          MT
        </div>
        <div>
          <h1 className="text-xl font-bold text-[var(--foreground)]">Marcus Thielmann</h1>
          <p className="text-sm text-[var(--muted-foreground)]">marcus@thielmannfarm.com</p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="w-2 h-2 rounded-full bg-[var(--success)]" />
            <span className="text-xs text-[var(--muted-foreground)]">Pro plan · Active</span>
          </div>
        </div>
      </div>

      {/* Farm Info */}
      <div className="bg-[var(--background)] border border-[var(--border)] rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-[var(--foreground)]">Farm Information</h2>
          <button onClick={() => {
            const nextName = window.prompt('Farm name', farmName)
            if (nextName?.trim()) setFarmName(nextName.trim())
          }} className="text-xs text-[var(--primary)] font-medium">Edit</button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Farm name', val: farmName },
            { label: 'Location', val: 'Ames, Iowa, USA' },
            { label: 'Total area', val: '245 acres' },
            { label: 'Member since', val: 'March 2025' },
          ].map(row => (
            <div key={row.label} className="bg-[var(--grey)] rounded-xl p-3">
              <p className="text-xs text-[var(--muted-foreground)]">{row.label}</p>
              <p className="text-sm font-medium text-[var(--foreground)] mt-0.5">{row.val}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stations */}
      <div className="bg-[var(--background)] border border-[var(--border)] rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-[var(--foreground)]">Weather Stations</h2>
          <button onClick={onAddStation} className="text-xs bg-[var(--primary)] text-[var(--primary-foreground)] font-medium px-3 py-1.5 rounded-lg hover:bg-[var(--primary-hover)] transition-colors">
            + Add station
          </button>
        </div>
        <div className="space-y-3">
          {stations.map((s, i) => (
            <div key={i} className="border border-[var(--muted)] rounded-xl p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[var(--secondary)] flex items-center justify-center">
                    <span className="text-lg">📡</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--foreground)]">{s.name}</p>
                    <p className="text-xs text-[var(--muted-foreground)] font-mono">{s.id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--success)]" />
                  <span className="text-xs text-[var(--muted-foreground)]">{s.lastSeen}</span>
                </div>
              </div>
              <div className="flex gap-4 mt-3">
                <div className="flex-1">
                  <p className="text-xs text-[var(--muted-foreground)] mb-1">Battery</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-[var(--muted)] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${s.battery}%`,
                          backgroundColor: s.battery > 50 ? 'var(--primary)' : s.battery > 25 ? 'var(--accent)' : 'var(--danger)',
                        }}
                      />
                    </div>
                    <span className="text-xs text-[var(--muted-foreground)] w-8">{s.battery}%</span>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-[var(--muted-foreground)] mb-1">Signal</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-[var(--muted)] rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-[var(--sky)]" style={{ width: `${s.signal}%` }} />
                    </div>
                    <span className="text-xs text-[var(--muted-foreground)] w-8">{s.signal}%</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Crops */}
      <div className="bg-[var(--background)] border border-[var(--border)] rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-[var(--foreground)]">Registered Crops</h2>
          <button onClick={() => {
            const name = window.prompt('Crop name')
            if (name?.trim()) setCropList(current => [...current, { name: name.trim(), field: 'New field', area: 'Set area', planted: 'Not set', icon: '🌱' }])
          }} className="text-xs text-[var(--primary)] font-medium">+ Add crop</button>
        </div>
        <div className="space-y-2">
          {cropList.map((c, i) => (
            <div key={i} className="flex items-center gap-3 p-3 border border-[var(--muted)] rounded-xl">
              <span className="text-2xl">{c.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[var(--foreground)]">{c.name}</p>
                <p className="text-xs text-[var(--muted-foreground)]">{c.field} · {c.area}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs text-[var(--muted-foreground)]">Planted</p>
                <p className="text-xs font-medium text-[var(--foreground)]">{c.planted}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-[var(--background)] border border-[var(--border)] rounded-2xl p-4">
        <h2 className="text-sm font-semibold text-[var(--foreground)] mb-3">Notifications</h2>
        <div className="space-y-0.5">
          {[
            { key: 'frost' as const, label: 'Frost warnings', desc: 'Alert when frost risk > 40%' },
            { key: 'rain' as const, label: 'Rain alerts', desc: 'Upcoming precipitation events' },
            { key: 'aiInsights' as const, label: 'AI Insights', desc: 'New crop recommendations' },
            { key: 'irrigationAlerts' as const, label: 'Irrigation alerts', desc: 'Soil moisture thresholds' },
            { key: 'weeklyReport' as const, label: 'Weekly report', desc: 'Season summary every Monday' },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between py-3 px-1 border-b border-[var(--muted)] last:border-0">
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">{item.label}</p>
                <p className="text-xs text-[var(--muted-foreground)]">{item.desc}</p>
              </div>
              <button
                onClick={() => toggle(item.key)}
                className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                  notifications[item.key] ? 'bg-[var(--primary)]' : 'bg-[var(--border)]'
                }`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-[var(--background)] shadow-sm transition-all ${
                  notifications[item.key] ? 'left-6' : 'left-1'
                }`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div className="bg-[var(--background)] border border-[var(--border)] rounded-2xl p-4">
        <h2 className="text-sm font-semibold text-[var(--foreground)] mb-3">Settings</h2>
        <div className="space-y-0.5">
          {settings.map((s, index) => (
            <button key={s.label} onClick={() => setSettings(current => current.map((setting, settingIndex) => settingIndex === index ? { ...setting, val: setting.options[(setting.options.indexOf(setting.val) + 1) % setting.options.length] } : setting))} className="w-full flex items-center gap-3 py-3 px-1 border-b border-[var(--muted)] last:border-0 hover:bg-[var(--grey)] -mx-1 px-1 rounded-lg transition-colors">
              <span className="text-lg w-8">{s.icon}</span>
              <span className="flex-1 text-sm text-[var(--foreground)] text-left">{s.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--muted-foreground)]">{s.val}</span>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M5 3l4 4-4 4" stroke="var(--muted-foreground)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Sign Out */}
      <button onClick={onLogout} className="w-full py-3.5 rounded-xl border border-[var(--border)] text-[var(--muted-foreground)] text-sm font-medium hover:border-[var(--danger-border)] hover:text-[var(--danger)] transition-colors">
        Sign out
      </button>
    </div>
  )
}
