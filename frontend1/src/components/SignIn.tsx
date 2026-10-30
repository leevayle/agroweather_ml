import { useState } from 'react'
import { login } from '../lib/api'

interface SignInProps {
  onSuccess: () => void
  onBack: () => void
  onCreateAccount: () => void
}

export default function SignIn({ onSuccess, onBack, onCreateAccount }: SignInProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email.trim(), password)
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      <div className="border-b border-[var(--border)]">
        <div className="max-w-6xl w-full mx-auto flex items-center justify-between px-6 py-4">
          <button onClick={onBack} className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            ← Back
          </button>
          <div className="flex items-center gap-2">
            <img src="/logo.webp" alt="AgroWeather" className="w-8 h-8 object-contain" />
            <span className="font-semibold text-[var(--foreground)]">AgroWeather</span>
          </div>
          <div className="w-12" />
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <form onSubmit={handleSubmit} className="w-full max-w-md">
          <h1 className="text-2xl font-bold text-[var(--foreground)] mb-1.5">Welcome back</h1>
          <p className="text-sm text-[var(--muted-foreground)] mb-8">Sign in to your farm dashboard.</p>

          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@farm.com"
                className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 bg-[var(--primary)] text-[var(--primary-foreground)] font-semibold py-3.5 rounded-xl disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>

          <p className="text-center text-sm text-[var(--muted-foreground)] mt-6">
            New here?{' '}
            <button type="button" onClick={onCreateAccount} className="text-[var(--primary)] font-medium">
              Create an account
            </button>
          </p>
        </form>
      </div>
    </div>
  )
}