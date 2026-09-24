import { useState } from 'react'
import Landing from './components/Landing'
import Onboarding from './components/Onboarding'
import BottomNav from './components/app/BottomNav'
import Sidebar from './components/app/Sidebar'
import Dashboard from './components/app/Dashboard'
import Weather from './components/app/Weather'
import Insights from './components/app/Insights'
import CalendarView from './components/app/CalendarView'
import Profile from './components/app/Profile'

function StationModal({ onClose }: { onClose: () => void }) {
  const [code, setCode] = useState('')
  const [paired, setPaired] = useState(false)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--overlay)]/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-[var(--background)] border border-[var(--border)] p-5 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-[var(--foreground)]">Add weather station</h2>
          <button onClick={onClose} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">✕</button>
        </div>
        {paired ? (
          <div className="text-center py-4">
            <div className="text-3xl mb-2">✅</div>
            <p className="font-semibold text-[var(--foreground)]">Station paired</p>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">Live readings will appear shortly.</p>
            <button onClick={onClose} className="w-full mt-5 rounded-xl bg-[var(--primary)] py-3 text-sm font-semibold text-[var(--primary-foreground)]">Done</button>
          </div>
        ) : (
          <>
            <p className="text-sm text-[var(--muted-foreground)] mb-4">Enter the code printed on your AgroStation ESP32.</p>
            <input value={code} onChange={e => setCode(e.target.value.toUpperCase())} maxLength={8} placeholder="e.g. AGR-84F2" className="w-full rounded-xl border border-[var(--border)] bg-[var(--grey)] px-4 py-3 text-center font-mono tracking-widest text-[var(--foreground)] outline-none focus:border-[var(--primary)]" />
            <button disabled={code.length < 6} onClick={() => setPaired(true)} className="w-full mt-3 rounded-xl bg-[var(--primary)] py-3 text-sm font-semibold text-[var(--primary-foreground)] disabled:opacity-40">Pair station</button>
          </>
        )}
      </div>
    </div>
  )
}

type Screen = 'landing' | 'onboarding' | 'app'

export default function App() {
  const [screen, setScreen] = useState<Screen>('landing')
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showStationModal, setShowStationModal] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  if (screen === 'landing') {
    return (
      <Landing
        onGetStarted={() => setScreen('onboarding')}
        onSignIn={() => setScreen('app')}
      />
    )
  }

  if (screen === 'onboarding') {
    return (
      <Onboarding onComplete={() => setScreen('app')} />
    )
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Sidebar active={activeTab} onChange={setActiveTab} />

      {/* Desktop top bar */}
      <div className="hidden md:flex fixed top-0 left-60 right-0 z-30 bg-[var(--background)] border-b border-[var(--border)]">
        <div className="max-w-6xl w-full mx-auto flex items-center justify-between px-6 py-4">
          <div>
            <h2 className="font-semibold text-[var(--foreground)] capitalize">{activeTab === 'dashboard' ? 'Dashboard' : activeTab === 'insights' ? 'AI Insights' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
            <p className="text-xs text-[var(--muted-foreground)]">Thielmann Family Farm · Ames, Iowa</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[var(--secondary)] px-3 py-1.5 rounded-xl">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--success)] animate-pulse" />
              <span className="text-xs font-medium text-[var(--primary)]">3 stations live</span>
            </div>
            <button onClick={() => setShowNotifications(value => !value)} className="relative w-9 h-9 rounded-full bg-[var(--grey)] border border-[var(--border)] flex items-center justify-center hover:border-[var(--primary)] transition-colors">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 1.5a4.5 4.5 0 00-4.5 4.5c0 2.7-1.5 4.5-1.5 4.5h12S12 8.7 12 6a4.5 4.5 0 00-4.5-4.5zM6.5 14a1.5 1.5 0 003 0" stroke="var(--muted-foreground)" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-[var(--danger)] border border-[var(--background)]" />
            </button>
            {showNotifications && <div className="absolute right-6 top-16 w-64 rounded-xl border border-[var(--border)] bg-[var(--background)] p-4 shadow-xl"><p className="text-sm font-semibold text-[var(--foreground)]">Notifications</p><p className="text-xs text-[var(--muted-foreground)] mt-2">No new alerts. Your farm is up to date.</p></div>}
            <div className="w-9 h-9 rounded-full bg-[var(--primary)] flex items-center justify-center text-[var(--primary-foreground)] text-sm font-semibold">
              MT
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="md:ml-60 md:pt-[73px]">
        <div className="max-w-6xl mx-auto px-4 py-5 md:px-8 md:py-6">
          {activeTab === 'dashboard' && <Dashboard onNavigate={setActiveTab} onAddStation={() => setShowStationModal(true)} onShowNotifications={() => setShowNotifications(value => !value)} />}
          {activeTab === 'weather' && <Weather />}
          {activeTab === 'insights' && <Insights />}
          {activeTab === 'calendar' && <CalendarView />}
          {activeTab === 'profile' && <Profile onAddStation={() => setShowStationModal(true)} onLogout={() => { setScreen('landing'); setActiveTab('dashboard') }} />}
        </div>
      </main>

      <BottomNav active={activeTab} onChange={setActiveTab} />
      {showStationModal && <StationModal onClose={() => setShowStationModal(false)} />}
    </div>
  )
}
