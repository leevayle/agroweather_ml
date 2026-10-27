import { useState } from 'react'
import { updateMyCrops, type AuthUser } from '../../lib/api'

interface ProfileProps {
  user: AuthUser | null
  onUserUpdate: (user: AuthUser) => void
  onAddStation: () => void
  onLogout: () => void
}

export default function Profile({ user, onUserUpdate, onAddStation, onLogout }: ProfileProps) {
  const [newCrop, setNewCrop] = useState('')
  const [editingCrop, setEditingCrop] = useState<string | null>(null)
  const [cropDraft, setCropDraft] = useState('')
  const [savingCrops, setSavingCrops] = useState(false)
  const [cropError, setCropError] = useState<string | null>(null)
  const [notifications, setNotifications] = useState({
    frost: true,
    rain: true,
    aiInsights: true,
    weeklyReport: false,
    irrigationAlerts: true,
  })
  const [settings, setSettings] = useState([
    { icon: '🌡️', label: 'Temperature unit', val: '°C (Celsius)', options: ['°C (Celsius)', '°F (Fahrenheit)'] },
    { icon: '💧', label: 'Rainfall unit', val: 'mm', options: ['mm', 'in'] },
    { icon: '💨', label: 'Wind speed unit', val: 'km/h', options: ['km/h', 'mph'] },
    { icon: '🌍', label: 'Language', val: 'English', options: ['English', 'Spanish', 'Portuguese'] },
  ])

  const toggle = (key: keyof typeof notifications) => {
    setNotifications(n => ({ ...n, [key]: !n[key] }))
  }

  const createdAt = user?.created_at ? new Date(user.created_at) : null
  const memberSince =
    createdAt && !Number.isNaN(createdAt.getTime())
      ? createdAt.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
      : 'Not available'
  const userInitial = user?.first_name?.trim().charAt(0).toUpperCase() || '?'

  const saveCrops = async (crops: string[]) => {
    setCropError(null)
    setSavingCrops(true)
    try {
      const updatedUser = await updateMyCrops(crops)
      onUserUpdate(updatedUser)
      setEditingCrop(null)
      setCropDraft('')
      setNewCrop('')
    } catch (error) {
      setCropError(error instanceof Error ? error.message : 'Unable to save crops.')
    } finally {
      setSavingCrops(false)
    }
  }

  const addCrop = async () => {
    const crop = newCrop.trim()
    if (!crop) {
      setCropError('Enter a crop name.')
      return
    }
    if ((user?.crops ?? []).some(existing => existing.toLowerCase() === crop.toLowerCase())) {
      setCropError('This crop is already registered.')
      return
    }
    await saveCrops([...(user?.crops ?? []), crop])
  }

  const renameCrop = async (oldCrop: string) => {
    const crop = cropDraft.trim()
    if (!crop) {
      setCropError('Crop names cannot be empty.')
      return
    }
    if (
      crop.toLowerCase() !== oldCrop.toLowerCase() &&
      (user?.crops ?? []).some(existing => existing.toLowerCase() === crop.toLowerCase())
    ) {
      setCropError('This crop is already registered.')
      return
    }
    await saveCrops((user?.crops ?? []).map(existing => existing === oldCrop ? crop : existing))
  }

  const deleteCrop = async (cropToDelete: string) => {
    await saveCrops((user?.crops ?? []).filter(crop => crop !== cropToDelete))
  }

  return (
    <div className="pb-24 md:pb-8 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-[var(--primary)] flex items-center justify-center text-[var(--primary-foreground)] text-2xl font-bold">
          {userInitial}
        </div>
        <div>
          <h1 className="text-xl font-bold text-[var(--foreground)]">
            {user?.first_name || 'Name not provided'}
          </h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            {user?.email || 'Email not provided'}
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-xs text-[var(--muted-foreground)]">Account profile</span>
          </div>
        </div>
      </div>

      {/* Farm Info */}
      <div className="bg-[var(--background)] border border-[var(--border)] rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-[var(--foreground)]">Farm Information</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Farm name', val: user?.farm_name || 'Not provided' },
            { label: 'Location', val: user?.location || 'Not provided' },
            { label: 'Farm size', val: user?.acres || 'Not provided' },
            { label: 'Member since', val: memberSince },
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
          {user?.station_code ? (
            <div className="border border-[var(--muted)] rounded-xl p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[var(--secondary)] flex items-center justify-center">
                <span className="text-lg">📡</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--foreground)]">Registered station</p>
                <p className="text-xs text-[var(--muted-foreground)] font-mono">{user.station_code}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-[var(--muted-foreground)]">
              No station is registered to this account yet.
            </p>
          )}
        </div>
      </div>

      {/* Crops */}
      <div className="bg-[var(--background)] border border-[var(--border)] rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-[var(--foreground)]">Registered Crops</h2>
        </div>
        {cropError && (
          <p role="alert" className="mb-3 text-sm text-[var(--danger-strong)]">{cropError}</p>
        )}
        <div className="space-y-2 mb-4">
          {user?.crops?.length ? user.crops.map(crop => (
            <div key={crop} className="flex items-center gap-3 p-3 border border-[var(--muted)] rounded-xl">
              <span className="text-2xl">🌱</span>
              {editingCrop === crop ? (
                <>
                  <input
                    aria-label={`Rename ${crop}`}
                    value={cropDraft}
                    onChange={event => setCropDraft(event.target.value)}
                    disabled={savingCrops}
                    className="min-w-0 flex-1 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)]"
                    onKeyDown={event => {
                      if (event.key === 'Enter') void renameCrop(crop)
                      if (event.key === 'Escape') setEditingCrop(null)
                    }}
                  />
                  <button
                    onClick={() => void renameCrop(crop)}
                    disabled={savingCrops}
                    className="text-xs font-medium text-[var(--primary)] disabled:opacity-50"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => { setEditingCrop(null); setCropError(null) }}
                    disabled={savingCrops}
                    className="text-xs text-[var(--muted-foreground)] disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <p className="flex-1 text-sm font-semibold text-[var(--foreground)]">{crop}</p>
                  <button
                    onClick={() => { setEditingCrop(crop); setCropDraft(crop); setCropError(null) }}
                    disabled={savingCrops}
                    className="text-xs font-medium text-[var(--primary)] disabled:opacity-50"
                    aria-label={`Edit ${crop}`}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => void deleteCrop(crop)}
                    disabled={savingCrops}
                    className="text-xs font-medium text-[var(--danger-strong)] disabled:opacity-50"
                    aria-label={`Delete ${crop}`}
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          )) : (
            <p className="text-sm text-[var(--muted-foreground)]">No crops have been added to this account.</p>
          )}
        </div>
        <form
          className="flex gap-2"
          onSubmit={event => { event.preventDefault(); void addCrop() }}
        >
          <input
            aria-label="New crop"
            value={newCrop}
            onChange={event => setNewCrop(event.target.value)}
            disabled={savingCrops}
            placeholder="Add a crop"
            className="min-w-0 flex-1 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm text-[var(--foreground)]"
          />
          <button
            type="submit"
            disabled={savingCrops || !newCrop.trim()}
            className="rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-[var(--primary-foreground)] disabled:opacity-50"
          >
            {savingCrops ? 'Saving…' : 'Add crop'}
          </button>
        </form>
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
