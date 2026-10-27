import { useEffect, useState } from 'react'
import Landing from './components/Landing'
import LegalPage from './components/LegalPage'
import Onboarding from './components/Onboarding'
import SignIn from './components/SignIn'
import BottomNav from './components/app/BottomNav'
import Sidebar from './components/app/Sidebar'
import Dashboard from './components/app/Dashboard'
import Weather from './components/app/Weather'
import Insights from './components/app/Insights'
import CalendarView from './components/app/CalendarView'
import Profile from './components/app/Profile'
import {
  clearSession,
  fetchMe,
  getStoredUser,
  getToken,
  type AuthUser,
} from './lib/api'

function StationModal({ onClose }: { onClose: () => void }) {
  const [code, setCode] = useState('')
  const [paired, setPaired] = useState(false)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--overlay)]/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-[var(--background)] border border-[var(--border)] p-5 shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold">Add weather station</h2>
          <button onClick={onClose}>✕</button>
        </div>
        {paired ? (
          <div className="text-center py-4">
            <p className="font-semibold">Station paired</p>
            <button onClick={onClose} className="w-full mt-5 rounded-xl bg-[var(--primary)] py-3 text-sm font-semibold text-[var(--primary-foreground)]">
              Done
            </button>
          </div>
        ) : (
          <>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={8}
              placeholder="e.g. AGR-84F2"
              className="w-full rounded-xl border px-4 py-3 text-center font-mono tracking-widest"
            />
            <button
              disabled={code.length < 6}
              onClick={() => setPaired(true)}
              className="w-full mt-3 rounded-xl bg-[var(--primary)] py-3 text-sm font-semibold text-[var(--primary-foreground)] disabled:opacity-40"
            >
              Pair station
            </button>
          </>
        )}
      </div>
    </div>
  )
}

type Screen = 'landing' | 'onboarding' | 'signin' | 'app' | 'privacy' | 'terms'

function screenFromPath(): Screen {
  if (window.location.pathname === '/privacy-policy') return 'privacy'
  if (window.location.pathname === '/terms-of-service') return 'terms'
  return 'landing'
}

export default function App() {
  const [screen, setScreen] = useState<Screen>(screenFromPath)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showStationModal, setShowStationModal] = useState(false)
  const [signupEmail, setSignupEmail] = useState('')
  const [startSignupAtForm, setStartSignupAtForm] = useState(false)
  const [user, setUser] = useState<AuthUser | null>(getStoredUser())
  const [bootstrapping, setBootstrapping] = useState(true)

  useEffect(() => {
    const handlePopState = () => setScreen(screenFromPath())
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  useEffect(() => {
    let active = true
    const bootstrap = async () => {
      const token = getToken()
      if (!token) {
        if (active) setBootstrapping(false)
        return
      }
      try {
        const me = await fetchMe()
        if (!active) return
        setUser(me)
        setScreen('app')
      } catch {
        clearSession()
        if (active) {
          setUser(null)
          setScreen('landing')
        }
      } finally {
        if (active) setBootstrapping(false)
      }
    }
    void bootstrap()
    return () => {
      active = false
    }
  }, [])

  const handleAuthSuccess = () => {
    setUser(getStoredUser())
    setScreen('app')
  }

  const handleSignOut = () => {
    clearSession()
    setUser(null)
    setActiveTab('dashboard')
    setScreen('landing')
  }

  const openLegalPage = (page: 'privacy' | 'terms') => {
    const path = page === 'privacy' ? '/privacy-policy' : '/terms-of-service'
    window.history.pushState({}, '', path)
    setScreen(page)
  }

  const returnToLanding = () => {
    window.history.pushState({}, '', '/')
    setScreen('landing')
  }

  if (bootstrapping) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-[var(--muted-foreground)]">
        Loading…
      </div>
    )
  }

  if (screen === 'landing') {
    return (
      <Landing
        onGetStarted={(email, startSignup = false) => {
          setSignupEmail(email ?? '')
          setStartSignupAtForm(startSignup)
          setScreen('onboarding')
        }}
        onSignIn={() => setScreen('signin')}
        onViewLegal={openLegalPage}
      />
    )
  }

  if (screen === 'privacy' || screen === 'terms') {
    return <LegalPage document={screen} onBack={returnToLanding} />
  }

  if (screen === 'signin') {
    return (
      <SignIn
        onSuccess={handleAuthSuccess}
        onBack={() => setScreen('landing')}
        onCreateAccount={() => setScreen('onboarding')}
      />
    )
  }

  if (screen === 'onboarding') {
    return (
      <Onboarding
        onComplete={handleAuthSuccess}
        onSignIn={() => setScreen('signin')}
        initialEmail={signupEmail}
        startAtSignup={startSignupAtForm}
      />
    )
  }

  const farmLabel = user?.farm_name

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Sidebar active={activeTab} onChange={setActiveTab} />

      <div className="hidden md:flex fixed top-0 left-60 right-0 z-30 bg-[var(--background)] border-b border-[var(--border)]">
        <div className="max-w-6xl w-full mx-auto flex items-center justify-between px-6 py-4">
          <div>
            <h2 className="font-semibold capitalize">{activeTab}</h2>
            <p className="text-xs text-[var(--muted-foreground)]">
              {[farmLabel, user?.location].filter(Boolean).join(' · ') || 'Account'}
            </p>
          </div>
          <button onClick={handleSignOut} className="text-xs text-[var(--muted-foreground)]">
            Sign out
          </button>
        </div>
      </div>

      <main className="md:ml-60 md:pt-20 pb-24 md:pb-8">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-4">
          {activeTab === 'dashboard' && (
            <Dashboard
              user={user}
              onAddStation={() => setShowStationModal(true)}
              onNavigate={setActiveTab}
            />
          )}
          {activeTab === 'weather' && <Weather user={user} />}
          {activeTab === 'insights' && <Insights user={user} />}
          {activeTab === 'calendar' && <CalendarView />}
          {activeTab === 'profile' && (
            <Profile
              user={user}
              onUserUpdate={setUser}
              onAddStation={() => setShowStationModal(true)}
              onLogout={handleSignOut}
            />
          )}
        </div>
      </main>

      <BottomNav active={activeTab} onChange={setActiveTab} />
      {showStationModal && <StationModal onClose={() => setShowStationModal(false)} />}
    </div>
  )
}