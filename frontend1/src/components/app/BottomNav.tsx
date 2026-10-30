interface BottomNavProps {
  active: string
  onChange: (tab: string) => void
}

const tabs = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="2" y="2" width="8" height="8" rx="2" fill={active ? 'var(--primary)' : 'none'} stroke={active ? 'var(--primary)' : 'var(--muted-foreground)'} strokeWidth="1.5"/>
        <rect x="12" y="2" width="8" height="8" rx="2" fill={active ? 'var(--primary)' : 'none'} stroke={active ? 'var(--primary)' : 'var(--muted-foreground)'} strokeWidth="1.5"/>
        <rect x="2" y="12" width="8" height="8" rx="2" fill="none" stroke={active ? 'var(--primary)' : 'var(--muted-foreground)'} strokeWidth="1.5"/>
        <rect x="12" y="12" width="8" height="8" rx="2" fill="none" stroke={active ? 'var(--primary)' : 'var(--muted-foreground)'} strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    id: 'weather',
    label: 'Weather',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="8" r="3.5" fill={active ? 'var(--primary)' : 'none'} stroke={active ? 'var(--primary)' : 'var(--muted-foreground)'} strokeWidth="1.5"/>
        <path d="M6 15.5a5 5 0 0110 0" stroke={active ? 'var(--primary)' : 'var(--muted-foreground)'} strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M2 8h1M19 8h1M11 2v1M11 13v1M4.22 4.22l.7.7M16.38 16.38l.7.7M4.22 11.78l.7-.7M16.38 5.62l.7-.7" stroke={active ? 'var(--primary)' : 'var(--muted-foreground)'} strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 'insights',
    label: 'Insights',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M4 16l4-4 3 3 4-5 3 3" stroke={active ? 'var(--primary)' : 'var(--muted-foreground)'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="2" y="2" width="18" height="18" rx="3" stroke={active ? 'var(--primary)' : 'var(--muted-foreground)'} strokeWidth="1.5" fill={active ? 'var(--secondary)' : 'none'}/>
      </svg>
    ),
  },
  {
    id: 'calendar',
    label: 'Calendar',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="2" y="4" width="18" height="16" rx="3" stroke={active ? 'var(--primary)' : 'var(--muted-foreground)'} strokeWidth="1.5" fill={active ? 'var(--secondary)' : 'none'}/>
        <path d="M2 9h18" stroke={active ? 'var(--primary)' : 'var(--muted-foreground)'} strokeWidth="1.5"/>
        <path d="M7 2v4M15 2v4" stroke={active ? 'var(--primary)' : 'var(--muted-foreground)'} strokeWidth="1.5" strokeLinecap="round"/>
        <rect x="6" y="13" width="3" height="3" rx="1" fill={active ? 'var(--primary)' : 'var(--muted-foreground)'}/>
        <rect x="13" y="13" width="3" height="3" rx="1" fill={active ? 'var(--muted-foreground)' : 'var(--muted-foreground)'} opacity="0.4"/>
      </svg>
    ),
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="8" r="3.5" fill={active ? 'var(--primary)' : 'none'} stroke={active ? 'var(--primary)' : 'var(--muted-foreground)'} strokeWidth="1.5"/>
        <path d="M3 20c0-4.418 3.582-8 8-8s8 3.582 8 8" stroke={active ? 'var(--primary)' : 'var(--muted-foreground)'} strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
]

export default function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--background)] border-t border-[var(--border)] px-2 pb-safe md:hidden">
      <div className="flex items-center">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex-1 flex flex-col items-center gap-1 pt-3 pb-3 transition-all ${
              active === tab.id ? 'text-[var(--primary)]' : 'text-[var(--muted-foreground)]'
            }`}
          >
            {tab.icon(active === tab.id)}
            <span className={`text-[10px] font-medium ${active === tab.id ? 'text-[var(--primary)]' : 'text-[var(--muted-foreground)]'}`}>
              {tab.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  )
}
