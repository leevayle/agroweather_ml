import { useState } from 'react'

interface LandingProps {
  onGetStarted: () => void
  onSignIn: () => void
}

export default function Landing({ onGetStarted, onSignIn }: LandingProps) {
  const [email, setEmail] = useState('')

  const features = [
    {
      icon: '🌡️',
      title: 'Current local weather',
      desc: 'An accurate picture of your farm’s microclimate, updated every 30 seconds from your location’s weather station.',
    },
    {
      icon: '🤖',
      title: 'AI-Powered Forecasts',
      desc: 'High quality models trained on local microclimates give you hyper-accurate weather forecasts your crops can count on.',
    },
    {
      icon: '🌱',
      title: 'Crop Intelligence',
      desc: 'AI analyzes conditions and tells you exactly when to plant, irrigate, and harvest for each crop on your farm.',
    },
    {
      icon: '📅',
      title: 'Smart Farm Calendar',
      desc: 'One-tap to add AI recommendations to your task calendar. Stay organized across your entire operation.',
    },
    {
      icon: '📡',
      title: 'Multi-Station Support',
      desc: 'Manage dozens of field sensors from a single dashboard. Know what\'s happening in every corner of your land.',
    },
    {
      icon: '🔔',
      title: 'Timely Alerts',
      desc: 'Frost warnings, storm alerts, and critical crop condition notifications before problems become losses.',
    },
  ]

  const steps = [
    { num: '01', title: 'Create your profile', desc: 'Tell us about your farm, location, and crops in under 2 minutes.' },
    { num: '02', title: 'Connect your station', desc: 'Pair your ESP32 weather station with a simple QR scan.' },
    { num: '03', title: 'Get AI insights', desc: 'Your first crop recommendation arrives the moment your first reading is in.' },
  ]

  const testimonials = [
    {
      quote: "AgroWeather told me to delay irrigation by 48 hours — saved me a full tank and the rain came right on schedule.",
      name: "Marcus Thielmann",
      farm: "Thielmann Family Farm, Iowa",
      avatar: "MT",
      color: "var(--primary)",
    },
    {
      quote: "The frost alert at 2am gave me time to cover my strawberry beds. Would have lost the whole crop otherwise.",
      name: "Ana Rodrigues",
      farm: "Quinta da Serra, Portugal",
      avatar: "AR",
      color: "var(--sky)",
    },
    {
      quote: "Finally a farm app that feels as polished as the apps my kids use. My farmhands picked it up on day one.",
      name: "James Okafor",
      farm: "Okafor Agri, Nigeria",
      avatar: "JO",
      color: "var(--accent)",
    },
  ]

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-[var(--background)] border-b border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--primary)] flex items-center justify-center">
              <span className="text-[var(--primary-foreground)] text-sm font-bold">🌿</span>
            </div>
            <span className="font-semibold text-[var(--foreground)] text-lg">AgroWeather</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-[var(--muted-foreground)] font-medium">
            <a href="#features" className="hover:text-[var(--primary)] transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-[var(--primary)] transition-colors">How it works</a>
            <a href="#testimonials" className="hover:text-[var(--primary)] transition-colors">Stories</a>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onSignIn} className="text-sm font-medium text-[var(--primary)] hover:text-[var(--foreground)] transition-colors">
              Sign in
            </button>
            <button
              onClick={onGetStarted}
              className="text-sm font-semibold bg-[var(--primary)] text-[var(--primary-foreground)] px-4 py-2 rounded-xl hover:bg-[var(--primary-hover)] transition-colors"
            >
              Get started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pt-16 pb-24 md:pt-24 md:pb-32">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--primary)]/6 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[var(--sky)]/8 rounded-full blur-3xl -translate-x-1/4 translate-y-1/4" />
        </div>
        <div className="max-w-6xl mx-auto px-6 relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-[var(--secondary)] text-[var(--primary)] text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse" />
              Get Live weather data from your farm in 90 seconds
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-[var(--foreground)] leading-[1.05] tracking-tight mb-6">
              Smarter farming starts with learning{' '}
              <span className="text-[var(--primary)] relative">
                weather
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                  <path d="M2 8 Q75 2 150 7 Q225 12 298 5" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" fill="none"/>
                </svg>
              </span>
            </h1>
            <p className="text-lg md:text-xl text-[var(--muted-foreground)] leading-relaxed mb-10 max-w-xl">
              AgroWeather combines live weather data, AI-powered forecasts, and crop intelligence into one simple, easy-to-use platform for modern farmers.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onGetStarted}
                className="inline-flex items-center justify-center gap-2 bg-[var(--primary)] text-[var(--primary-foreground)] font-semibold px-8 py-3.5 rounded-xl hover:bg-[var(--primary-hover)] transition-all hover:shadow-lg hover:shadow-[var(--primary)]/20 text-base"
              >
                Start free — takes 90 seconds
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button
                onClick={onSignIn}
                className="inline-flex items-center justify-center gap-2 bg-[var(--background)] text-[var(--foreground)] font-medium px-8 py-3.5 rounded-xl border border-[var(--border)] hover:border-[var(--primary)] transition-colors text-base"
              >
                Sign in to your farm
              </button>
            </div>
            <p className="text-xs text-[var(--muted-foreground)] mt-4">No credit card required! Free for small farms.</p>
          </div>

          {/* Hero Dashboard Preview */}
          <div className="mt-16 relative">
            <div className="bg-[var(--background)] rounded-2xl shadow-2xl shadow-[var(--foreground)]/10 border border-[var(--border)] overflow-hidden max-w-4xl">
              {/* Mock browser bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--muted)] bg-[var(--grey)]">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[var(--window-close)]" />
                  <div className="w-3 h-3 rounded-full bg-[var(--window-minimize)]" />
                  <div className="w-3 h-3 rounded-full bg-[var(--window-maximize)]" />
                </div>
                <div className="flex-1 mx-4 bg-[var(--background)] border border-[var(--border)] rounded-md h-6 flex items-center justify-center">
                  <span className="text-xs text-[var(--muted-foreground)]">app.agroweather.io/dashboard</span>
                </div>
              </div>
              {/* Mock Dashboard */}
              <div className="p-6 bg-[var(--grey1)]">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="text-xs text-[var(--muted-foreground)] font-medium">Hi,</p>
                    <h3 className="text-lg font-semibold text-[var(--foreground)]">Farmer ☀️</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[var(--success)]" />
                    <span className="text-xs text-[var(--muted-foreground)]">Updated 1 minute ago</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-[var(--sky)] text-[var(--primary-foreground)] rounded-xl p-4 col-span-1">
                    <p className="text-xs text-[var(--success-soft)] mb-1">Temperature</p>
                    <p className="text-3xl font-bold">24°</p>
                    <p className="text-xs text-[var(--success-soft)] mt-1">↑ 18° / ↓ 11°</p>
                  </div>
                  <div className="bg-[var(--background)] rounded-xl p-4">
                    <p className="text-xs text-[var(--muted-foreground)] mb-1">Humidity</p>
                    <p className="text-2xl font-bold text-[var(--sky)]">68%</p>
                    <p className="text-xs text-[var(--muted-foreground)] mt-1">Optimal</p>
                  </div>
                  <div className="bg-[var(--background)] rounded-xl p-4">
                    <p className="text-xs text-[var(--muted-foreground)] mb-1">Wind</p>
                    <p className="text-2xl font-bold text-[var(--foreground)]">12</p>
                    <p className="text-xs text-[var(--muted-foreground)] mt-1">km/h NW</p>
                  </div>
                </div>
                <div className="bg-[var(--background)] rounded-xl p-4 border border-[var(--border)]">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[var(--warning)] flex items-center justify-center flex-shrink-0">
                      <span>🤖</span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[var(--accent)] mb-1">Example AI Insight <span className="text-[var(--muted-foreground)]">|</span> Maize field E</p>
                      <p className="text-sm text-[var(--foreground)]">Ideal irrigation window: <strong>Tomorrow 6–9am</strong>. Rain expected Thursday reduces soil deficit to 12mm. Skip Friday irrigation entirely.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-[var(--accent)]/10 rounded-full blur-2xl pointer-events-none" />
          </div>
        </div>
      </section>

    

      {/* Features */}
      <section id="features" className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-xl mb-16">
            <p className="text-xs font-semibold text-[var(--foreground)] uppercase tracking-widest mb-3">Everything you need</p>
            <h2 className="text-4xl font-bold text-[var(--primary)] leading-tight">Built for the reality of farming</h2>
            <p className="text-[var(--muted-foreground)] mt-4 text-lg">Not a generic weather app with a farm coat of paint. Purpose-built intelligence for people who grow food.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <div key={i} className="bg-[var(--background)] border border-[var(--border)] rounded-2xl p-6 hover:border-[var(--primary)]/40 hover:shadow-md transition-all group">
                <div className="w-12 h-12 rounded-xl bg-[var(--secondary)] flex items-center justify-center text-2xl mb-4 group-hover:bg-[var(--primary)] transition-colors">
                  <span>{f.icon}</span>
                </div>
                <h3 className="font-semibold text-[var(--foreground)] mb-2">{f.title}</h3>
                <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-24 bg-[var(--primary)]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-xl mb-16">
            <p className="text-xs font-semibold text-[var(--success-muted)] uppercase tracking-widest mb-3">Simple as it gets</p>
            <h2 className="text-4xl font-bold text-[var(--primary-foreground)] leading-tight">From unboxing to insights in 90 seconds</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <div key={i} className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-7 left-full w-full h-px bg-[var(--background)]/0 -translate-x-70" />
                )}
                <div className="text-5xl font-bold text-[var(--primary-foreground)]/20 mb-4">{s.num}</div>
                <h3 className="text-lg font-semibold text-[var(--primary-foreground)] mb-2">{s.title}</h3>
                <p className="text-[var(--success-soft)] text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-12">
            <button
              onClick={onGetStarted}
              className="inline-flex items-center gap-2 bg-[var(--accent)] text-[var(--primary-foreground)] font-semibold px-8 py-3.5 rounded-xl hover:bg-[var(--accent-hover)] transition-colors text-base"
            >
              Set up your farm now →
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-xl mb-16">
            <p className="text-xs font-semibold text-[var(--primary)] uppercase tracking-widest mb-3">Real farmers, real results</p>
            <h2 className="text-4xl font-bold text-[var(--foreground)] leading-tight">What growers say</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-[var(--background)] border border-[var(--border)] rounded-2xl p-6">
                <div className="flex mb-4 gap-0.5">
                  {[...Array(5)].map((_, j) => (
                    <svg key={j} width="14" height="14" viewBox="0 0 14 14" fill="var(--accent)">
                      <path d="M7 1l1.545 3.13L12 4.635l-2.5 2.437.59 3.441L7 8.825l-3.09 1.688.59-3.44L2 4.634l3.455-.505L7 1z"/>
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-[var(--foreground)] leading-relaxed mb-5">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--primary-foreground)] text-sm font-semibold"
                    style={{ backgroundColor: t.color }}
                  >
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--foreground)]">{t.name}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">{t.farm}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[var(--grey)] border-t border-[var(--border)]">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-[var(--foreground)] mb-4">Ready to grow smarter?</h2>
          <p className="text-[var(--muted-foreground)] text-lg mb-8">Join thousands of farmers already making better decisions with AgroWeather.</p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)] transition-colors"
            />
            <button
              onClick={onGetStarted}
              className="bg-[var(--primary)] text-[var(--primary-foreground)] font-semibold px-6 py-3 rounded-xl hover:bg-[var(--primary-hover)] transition-colors whitespace-nowrap text-sm"
            >
              Get started free
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[var(--primary)] flex items-center justify-center">
              <span className="text-[var(--primary-foreground)] text-xs">🌿</span>
            </div>
            <span className="font-semibold text-[var(--foreground)]">AgroWeather</span>
          </div>
          <p className="text-xs text-[var(--muted-foreground)]">© 2026 AgroWeather Inc. Built for farmers, by farmers.</p>
          <div className="flex gap-6 text-xs text-[var(--muted-foreground)]">
            <a href="#" className="hover:text-[var(--primary)] transition-colors">Privacy</a>
            <a href="#" className="hover:text-[var(--primary)] transition-colors">Terms</a>
            <a href="#" className="hover:text-[var(--primary)] transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
