import { useState } from 'react'

interface OnboardingProps {
  onComplete: () => void
}

const CROPS = ['Corn', 'Wheat', 'Soybeans', 'Rice', 'Cotton', 'Tomatoes', 'Potatoes', 'Sunflower', 'Barley', 'Canola']

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    firstName: '',
    email: '',
    password: '',
    farmName: '',
    location: '',
    acres: '',
    crops: [] as string[],
  })
  const [stationCode, setStationCode] = useState('')
  const [pairingSkipped, setPairingSkipped] = useState(false)

  const totalSteps = 5

  const toggleCrop = (crop: string) => {
    setForm(f => ({
      ...f,
      crops: f.crops.includes(crop) ? f.crops.filter(c => c !== crop) : [...f.crops, crop],
    }))
  }

  const canProceed = () => {
    if (step === 1) return form.firstName && form.email && form.password.length >= 6
    if (step === 2) return form.farmName && form.location && form.crops.length > 0
    return true
  }

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      {/* Header */}
      <div className="border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-sm">
        <div className="max-w-6xl w-full mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-[var(--primary)] flex items-center justify-center">
              <span className="text-[var(--primary-foreground)] text-xs">🌿</span>
            </div>
            <span className="font-semibold text-[var(--foreground)]">AgroWeather</span>
          </div>
          {step > 0 && step < 4 && (
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                {[1, 2, 3, 4].map(i => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all ${
                      i <= step ? 'bg-[var(--primary)] w-6' : 'bg-[var(--border)] w-4'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-[var(--muted-foreground)]">{step} of 4</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">

          {/* Step 0: Welcome */}
          {step === 0 && (
            <div className="text-center">
              <div className="w-20 h-20 rounded-3xl bg-[var(--primary)] flex items-center justify-center text-4xl mx-auto mb-8 shadow-lg shadow-[var(--primary)]/20">
                🌾
              </div>
              <h1 className="text-3xl font-bold text-[var(--foreground)] mb-3">Welcome to AgroWeather</h1>
              <p className="text-[var(--muted-foreground)] mb-10 text-base leading-relaxed">
                Your AI-powered farm companion. Set up takes less than 90 seconds and your first insight arrives immediately.
              </p>
              <button
                onClick={() => setStep(1)}
                className="w-full bg-[var(--primary)] text-[var(--primary-foreground)] font-semibold py-3.5 rounded-xl hover:bg-[var(--primary-hover)] transition-colors mb-3 text-base"
              >
                Create your account →
              </button>
              <button
                onClick={onComplete}
                className="w-full text-[var(--muted-foreground)] font-medium py-2.5 rounded-xl hover:text-[var(--foreground)] transition-colors text-sm"
              >
                Already have an account? Sign in
              </button>
            </div>
          )}

          {/* Step 1: Sign Up */}
          {step === 1 && (
            <div>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-[var(--foreground)] mb-1.5">Create your account</h2>
                <p className="text-[var(--muted-foreground)] text-sm">Your data is always private and secure.</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">First name</label>
                  <input
                    type="text"
                    placeholder="Marcus"
                    value={form.firstName}
                    onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Email address</label>
                  <input
                    type="email"
                    placeholder="marcus@thielmannfarm.com"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Password</label>
                  <input
                    type="password"
                    placeholder="6+ characters"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10 transition-all"
                  />
                </div>
              </div>
              <button
                disabled={!canProceed()}
                onClick={() => setStep(2)}
                className="w-full mt-6 bg-[var(--primary)] text-[var(--primary-foreground)] font-semibold py-3.5 rounded-xl hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-base"
              >
                Continue
              </button>
              <p className="text-center text-xs text-[var(--muted-foreground)] mt-4">
                By continuing you agree to our <span className="text-[var(--primary)] cursor-pointer">Terms</span> and <span className="text-[var(--primary)] cursor-pointer">Privacy Policy</span>
              </p>
            </div>
          )}

          {/* Step 2: Farm Profile */}
          {step === 2 && (
            <div>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-[var(--foreground)] mb-1.5">About your farm</h2>
                <p className="text-[var(--muted-foreground)] text-sm">Help us personalize your weather insights.</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Farm name</label>
                  <input
                    type="text"
                    placeholder="Thielmann Family Farm"
                    value={form.farmName}
                    onChange={e => setForm(f => ({ ...f, farmName: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Location</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Ames, Iowa, USA"
                      value={form.location}
                      onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                      className="w-full px-4 py-3 pl-10 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10 transition-all"
                    />
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M8 1.5C5.515 1.5 3.5 3.515 3.5 6c0 3.5 4.5 8.5 4.5 8.5S12.5 9.5 12.5 6c0-2.485-2.015-4.5-4.5-4.5zm0 6a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" fill="currentColor"/>
                    </svg>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Farm size (acres)</label>
                  <input
                    type="number"
                    placeholder="245"
                    value={form.acres}
                    onChange={e => setForm(f => ({ ...f, acres: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Crops you grow</label>
                  <div className="flex flex-wrap gap-2">
                    {CROPS.map(crop => (
                      <button
                        key={crop}
                        onClick={() => toggleCrop(crop)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                          form.crops.includes(crop)
                            ? 'bg-[var(--primary)] text-[var(--primary-foreground)] border-[var(--primary)]'
                            : 'bg-[var(--background)] text-[var(--muted-foreground)] border-[var(--border)] hover:border-[var(--primary)]'
                        }`}
                      >
                        {crop}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <button
                disabled={!canProceed()}
                onClick={() => setStep(3)}
                className="w-full mt-6 bg-[var(--primary)] text-[var(--primary-foreground)] font-semibold py-3.5 rounded-xl hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-base"
              >
                Continue
              </button>
            </div>
          )}

          {/* Step 3: Station Pairing */}
          {step === 3 && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-[var(--foreground)] mb-1.5">Connect your weather station</h2>
                <p className="text-[var(--muted-foreground)] text-sm">Optional — you can always add stations later from settings.</p>
              </div>

              <div className="bg-[var(--background)] border border-[var(--border)] rounded-2xl p-6 mb-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[var(--secondary)] flex items-center justify-center text-xl">📡</div>
                  <div>
                    <p className="font-semibold text-[var(--foreground)] text-sm">AgroStation ESP32</p>
                    <p className="text-xs text-[var(--muted-foreground)]">Enter the 8-character code on your device</p>
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="e.g. AGR-84F2"
                  maxLength={8}
                  value={stationCode}
                  onChange={e => setStationCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--grey)] text-center text-lg font-mono tracking-widest text-[var(--foreground)] outline-none focus:border-[var(--primary)] transition-colors"
                />
                <button
                  disabled={stationCode.length < 6}
                  onClick={() => setStep(4)}
                  className="w-full mt-3 bg-[var(--sky)] text-[var(--primary-foreground)] font-semibold py-2.5 rounded-xl hover:bg-[var(--sky-hover)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm"
                >
                  Pair station
                </button>
              </div>

              <div className="text-center mb-4">
                <span className="text-xs text-[var(--muted-foreground)]">— or scan the QR code on your station —</span>
              </div>

              <div className="bg-[var(--secondary)] rounded-xl p-4 flex items-center justify-center mb-6">
                <div className="grid grid-cols-7 gap-0.5">
                  {Array.from({ length: 49 }, (_, i) => (
                    <div
                      key={i}
                      className="w-4 h-4 rounded-sm"
                      style={{ backgroundColor: Math.random() > 0.5 ? 'var(--primary)' : 'transparent' }}
                    />
                  ))}
                </div>
              </div>

              <button
                disabled={stationCode.length < 6}
                onClick={() => setStep(4)}
                className="w-full bg-[var(--primary)] text-[var(--primary-foreground)] font-semibold py-3.5 rounded-xl hover:bg-[var(--primary-hover)] transition-colors mb-3 text-base"
              >
                Pair and continue
              </button>
              <button
                onClick={() => { setPairingSkipped(true); setStep(4) }}
                className="w-full text-[var(--muted-foreground)] font-medium py-2.5 rounded-xl hover:text-[var(--foreground)] transition-colors text-sm"
              >
                Skip for now
              </button>
            </div>
          )}

          {/* Step 4: Success */}
          {step === 4 && (
            <div className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-8">
                <div className="w-24 h-24 rounded-3xl bg-[var(--secondary)] flex items-center justify-center text-5xl">
                  🎉
                </div>
                <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-[var(--success)] flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2.5 7l3 3 6-6" stroke="var(--primary-foreground)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-[var(--foreground)] mb-3">
                {form.farmName ? `${form.farmName} is ready!` : "You're all set!"}
              </h2>
              <p className="text-[var(--muted-foreground)] mb-3 text-sm leading-relaxed max-w-sm mx-auto">
                {pairingSkipped
                  ? "Your farm profile is set up. Add a weather station anytime from Settings to start getting live data."
                  : "Your station is connected and sending live data. Your first AI insight is on its way."}
              </p>
              {form.crops.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center mb-8">
                  {form.crops.map(c => (
                    <span key={c} className="text-xs bg-[var(--secondary)] text-[var(--primary)] font-medium px-3 py-1 rounded-full">
                      {c}
                    </span>
                  ))}
                </div>
              )}
              <div className="space-y-3 max-w-sm mx-auto">
                {['Live weather data for your area', 'AI crop insights ready', 'Task calendar set up', 'Frost & storm alerts active'].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-[var(--foreground)]">
                    <div className="w-5 h-5 rounded-full bg-[var(--primary)] flex items-center justify-center flex-shrink-0">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M1.5 5l2.5 2.5 5-5" stroke="var(--primary-foreground)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    {item}
                  </div>
                ))}
              </div>
              <button
                onClick={onComplete}
                className="w-full mt-10 bg-[var(--primary)] text-[var(--primary-foreground)] font-semibold py-3.5 rounded-xl hover:bg-[var(--primary-hover)] transition-colors text-base"
              >
                Open my dashboard →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
