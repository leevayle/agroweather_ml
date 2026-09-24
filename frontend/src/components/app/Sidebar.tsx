interface SidebarProps {
  active: string
  onChange: (tab: string) => void
}

const navItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="1" y="1" width="7" height="7" rx="2" strokeWidth="1.5" stroke="currentColor"/>
        <rect x="10" y="1" width="7" height="7" rx="2" strokeWidth="1.5" stroke="currentColor"/>
        <rect x="1" y="10" width="7" height="7" rx="2" strokeWidth="1.5" stroke="currentColor"/>
        <rect x="10" y="10" width="7" height="7" rx="2" strokeWidth="1.5" stroke="currentColor"/>
      </svg>
    ),
  },
  {
    id: 'weather',
    label: 'Weather',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="7" r="3" strokeWidth="1.5" stroke="currentColor"/>
        <path d="M5 13.5a4 4 0 018 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M1 7h1M16 7h1M9 1v1M9 11v1M3 3l.7.7M14.3 14.3l.7.7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 'insights',
    label: 'AI Insights',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M2 13l3.5-3.5 2.5 2.5 3.5-4.5 2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="1" y="1" width="16" height="16" rx="3" strokeWidth="1.5" stroke="currentColor"/>
      </svg>
    ),
  },
  {
    id: 'calendar',
    label: 'Calendar',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="1" y="3" width="16" height="14" rx="3" strokeWidth="1.5" stroke="currentColor"/>
        <path d="M1 8h16" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M5 1v3M13 1v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="6" r="3" strokeWidth="1.5" stroke="currentColor"/>
        <path d="M2 17c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
]

export default function Sidebar({ active, onChange }: SidebarProps) {
  return (
    <aside className="hidden md:flex flex-col w-60 min-h-screen bg-[var(--background)] border-r border-[var(--border)] fixed left-0 top-0 bottom-0 z-40">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-[var(--border)]">
        <div className="w-8 h-8 rounded-lg bg-[var(--primary)] flex items-center justify-center">
          <span className="text-[var(--primary-foreground)] text-sm">🌿</span>
        </div>
        <span className="font-bold text-[var(--foreground)] text-base">AgroWeather</span>
      </div>

      {/* Farm info */}
      <div className="px-5 py-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[var(--primary)] flex items-center justify-center text-[var(--primary-foreground)] text-sm font-semibold flex-shrink-0">
            MT
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--foreground)] truncate">Thielmann Farm</p>
            <p className="text-xs text-[var(--muted-foreground)]">Ames, Iowa</p>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-3 px-3">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 transition-all text-sm font-medium ${
              active === item.id
                ? 'bg-[var(--secondary)] text-[var(--primary)]'
                : 'text-[var(--muted-foreground)] hover:bg-[var(--grey)] hover:text-[var(--foreground)]'
            }`}
          >
            <span className={active === item.id ? 'text-[var(--primary)]' : 'text-[var(--muted-foreground)]'}>
              {item.icon}
            </span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Station status */}
      <div className="px-4 py-4 border-t border-[var(--border)]">
        <div className="bg-[var(--secondary)] rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse" />
            <span className="text-xs font-semibold text-[var(--primary)]">3 stations live</span>
          </div>
          <p className="text-xs text-[var(--muted-foreground)]">Last reading 2 min ago</p>
        </div>
      </div>
    </aside>
  )
}
