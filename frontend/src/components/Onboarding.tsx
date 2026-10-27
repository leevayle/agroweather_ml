import { useState } from 'react'
import { signup } from '../lib/api'

interface OnboardingProps {
  onComplete: () => void
  onSignIn?: () => void
}

const CROPS = [
  'Corn', 'Wheat', 'Soybeans', 'Rice', 'Cotton',
  'Tomatoes', 'Potatoes', 'Sunflower', 'Barley', 'Canola',
]

export default function Onboarding({ onComplete, onSignIn }: OnboardingProps) {
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
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const toggleCrop = (crop: string) => {
    setForm((f) => ({
      ...f,
      crops: f.crops.includes(crop) ? f.crops.filter((c) => c !== crop) : [...f.crops, crop],
    }))
  }

  const canProceed = () => {
    if (step === 1) return Boolean(form.firstName && form.email && form.password.length >= 6)
    if (step === 2) return Boolean(form.farmName && form.location && form.crops.length > 0)
    return true
  }

  const finishSignup = async () => {
    setError('')
    setLoading(true)
    try {
      await signup({
        email: form.email.trim(),
        password: form.password,
        first_name: form.firstName.trim(),
        farm_name: form.farmName.trim(),
        location: form.location.trim(),
        acres: form.acres.trim(),
        crops: form.crops,
        station_code: pairingSkipped ? null : stationCode || null,
      })
      onComplete()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      <div className="border-b border-[var(--border)]">
        <div className="max-w-6xl w-full mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <img src="/logo.webp" alt="AgroWeather" className="w-8 h-8 object-contain" />
            <span className="font-semibold text-[var(--foreground)]">AgroWeather</span>
          </div>
          {step > 0 && step < 4 && (
            <span className="text-xs text-[var(--muted-foreground)]">{step} of 3</span>
          )}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {step === 0 && (
            <div className="text-center">
              <div className="text-5xl mb-6">🌱</div>
              <h2 className="text-2xl font-bold mb-2">Let's set up your farm</h2>
              <p className="text-sm text-[var(--muted-foreground)] mb-8">
                Create an account so your data stays saved in MongoDB.
              </p>
              <button
                onClick={() => setStep(1)}
                className="w-full bg-[var(--primary)] text-[var(--primary-foreground)] font-semibold py-3.5 rounded-xl"
              >
                Create your account →
              </button>
              <button onClick={onSignIn} className="w-full mt-3 text-sm text-[var(--muted-foreground)]">
                Already have an account? Sign in
              </button>
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Create your account</h2>
              <div className="space-y-4">
                <input
                  placeholder="First name"
                  value={form.firstName}
                  onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border)]"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border)]"
                />
                <input
                  type="password"
                  placeholder="Password (min 6 chars)"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border)]"
                />
              </div>
              <button
                disabled={!canProceed()}
                onClick={() => setStep(2)}
                className="w-full mt-6 bg-[var(--primary)] text-[var(--primary-foreground)] font-semibold py-3.5 rounded-xl disabled:opacity-40"
              >
                Continue
              </button>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">About your farm</h2>
              <div className="space-y-4">
                <input
                  placeholder="Farm name"
                  value={form.farmName}
                  onChange={(e) => setForm((f) => ({ ...f, farmName: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border)]"
                />
                <input
                  placeholder="Location"
                  value={form.location}
                  onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border)]"
                />
                <input
                  placeholder="Farm size (optional)"
                  value={form.acres}
                  onChange={(e) => setForm((f) => ({ ...f, acres: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border)]"
                />
                <div className="flex flex-wrap gap-2">
                  {CROPS.map((crop) => (
                    <button
                      key={crop}
                      type="button"
                      onClick={() => toggleCrop(crop)}
                      className={`px-3 py-1.5 rounded-full text-xs border ${
                        form.crops.includes(crop)
                          ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                          : ''
                      }`}
                    >
                      {crop}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(1)} className="flex-1 border py-3 rounded-xl">
                  Back
                </button>
                <button
                  disabled={!canProceed()}
                  onClick={() => setStep(3)}
                  className="flex-1 bg-[var(--primary)] text-[var(--primary-foreground)] font-semibold py-3 rounded-xl disabled:opacity-40"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold mb-2">Connect a station</h2>
              <p className="text-sm text-[var(--muted-foreground)] mb-6">Optional — you can skip.</p>
              <input
                value={stationCode}
                onChange={(e) => setStationCode(e.target.value.toUpperCase())}
                maxLength={12}
                placeholder="e.g. AGR-84F2"
                className="w-full px-4 py-3 rounded-xl border border-[var(--border)] text-center font-mono tracking-widest"
              />
              <button
                disabled={loading || stationCode.length < 6}
                onClick={() => {
                  setPairingSkipped(false)
                  void finishSignup()
                }}
                className="w-full mt-4 bg-[var(--primary)] text-[var(--primary-foreground)] font-semibold py-3.5 rounded-xl disabled:opacity-40"
              >
                {loading ? 'Creating account…' : 'Pair and create account'}
              </button>
              <button
                disabled={loading}
                onClick={() => {
                  setPairingSkipped(true)
                  void finishSignup()
                }}
                className="w-full mt-3 text-sm text-[var(--muted-foreground)]"
              >
                Skip for now and create account
              </button>
              <button onClick={() => setStep(2)} className="w-full mt-2 text-sm text-[var(--muted-foreground)]">
                Back
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}