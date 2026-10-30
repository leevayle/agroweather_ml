import { useEffect, useRef, useState, type ReactNode } from "react"

type Page = "overview" | "users" | "stations" | "infrastructure" | "audit" | "settings"
type IconName = "activity" | "alert" | "bell" | "bolt" | "check" | "chevron" | "cpu" | "database" | "dots" | "download" | "gauge" | "grid" | "help" | "key" | "leaf" | "log" | "menu" | "pencil" | "plus" | "refresh" | "search" | "server" | "settings" | "shield" | "station" | "user" | "users" | "x"

const paths: Record<IconName, ReactNode> = {
  activity: (
    <>
      <path d="M3 12h4l2.4-6 4.2 12 2.4-6h5" />
    </>
  ),
  alert: (
    <>
      <path d="M12 9v4m0 4h.01" />
      <path d="M10.3 3.7 2.6 17a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 3.7a2 2 0 0 0-3.4 0Z" />
    </>
  ),
  bell: (
    <>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
    </>
  ),
  bolt: (
    <>
      <path d="m13 2-9 12h8l-1 8 9-12h-8z" />
    </>
  ),
  check: (
    <>
      <path d="m5 12 4 4L19 6" />
    </>
  ),
  chevron: (
    <>
      <path d="m9 18 6-6-6-6" />
    </>
  ),
  cpu: (
    <>
      <rect x="7" y="7" width="10" height="10" rx="2" />
      <path d="M9 1v3m6-3v3M9 20v3m6-3v3M20 9h3m-3 6h3M1 9h3m-3 6h3M10 10h4v4h-4z" />
    </>
  ),
  database: (
    <>
      <ellipse cx="12" cy="5" rx="8" ry="3" />
      <path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" />
    </>
  ),
  dots: (
    <>
      <circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="19" cy="12" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  download: (
    <>
      <path d="M12 3v12m0 0 4-4m-4 4-4-4M4 20h16" />
    </>
  ),
  gauge: (
    <>
      <path d="M4.9 19a9 9 0 1 1 14.2 0M12 13l4-4" />
      <path d="M9 19h6" />
    </>
  ),
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </>
  ),
  help: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9a2.7 2.7 0 1 1 3.7 2.5c-.8.4-1.2.9-1.2 1.8M12 17h.01" />
    </>
  ),
  key: (
    <>
      <circle cx="8" cy="15" r="4" />
      <path d="m11 12 9-9m-3 3 3 3m-6 0 3 3" />
    </>
  ),
  leaf: (
    <>
      <path d="M20 4C12 4 5 8 5 15c0 3 2 5 5 5 7 0 10-8 10-16Z" />
      <path d="M4 21c2-6 6-10 12-13" />
    </>
  ),
  log: (
    <>
      <path d="M8 6h12M8 12h12M8 18h12" />
      <circle cx="4" cy="6" r=".8" fill="currentColor" />
      <circle cx="4" cy="12" r=".8" fill="currentColor" />
      <circle cx="4" cy="18" r=".8" fill="currentColor" />
    </>
  ),
  menu: (
    <>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </>
  ),
  pencil: (
    <>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
    </>
  ),
  plus: (
    <>
      <path d="M12 5v14M5 12h14" />
    </>
  ),
  refresh: (
    <>
      <path d="M20 7v5h-5M4 17v-5h5" />
      <path d="M6.1 9A7 7 0 0 1 18 6l2 6M18 15a7 7 0 0 1-12 3l-2-6" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </>
  ),
  server: (
    <>
      <rect x="3" y="4" width="18" height="6" rx="2" />
      <rect x="3" y="14" width="18" height="6" rx="2" />
      <path d="M7 7h.01M7 17h.01" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" />
    </>
  ),
  shield: (
    <>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  station: (
    <>
      <path d="M12 18v4m-4 0h8M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
      <path d="M7.8 6.2a8 8 0 0 0 0 11.6m8.4 0a8 8 0 0 0 0-11.6M4.2 3a12 12 0 0 0 0 18m15.6 0a12 12 0 0 0 0-18" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
  users: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" />
    </>
  ),
  x: (
    <>
      <path d="m6 6 12 12M18 6 6 18" />
    </>
  ),
}

function Icon({ name, size = 18 }: { name: IconName size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  )
}

const nav: { id: Page label: string icon: IconName }[] = [
  { id: "overview", label: "System overview", icon: "grid" },
  { id: "users", label: "User management", icon: "users" },
  { id: "stations", label: "Station management", icon: "station" },
  { id: "infrastructure", label: "Server & MQTT", icon: "server" },
  { id: "audit", label: "Audit logs", icon: "log" },
  { id: "settings", label: "Settings", icon: "settings" },
]

const pageMeta: Record<Page, [string, string]> = {
  overview: [
    "System overview",
    "Monitor platform health, activity, and infrastructure.",
  ],
  users: [
    "User management",
    "Manage platform access, roles, and account status.",
  ],
  stations: [
    "Station management",
    "Monitor and manage the complete ESP32 station fleet.",
  ],
  infrastructure: [
    "Server & infrastructure",
    "Real-time services, capacity, and runtime controls.",
  ],
  audit: [
    "Audit & activity logs",
    "A chronological record of system and administrative events.",
  ],
  settings: [
    "Platform settings",
    "Configure security, notifications, and data retention.",
  ],
}

function Badge({
  children,
  tone = "neutral",
  dot = false,
}: {
  children: ReactNode
  tone?: string
  dot?: boolean
}) {
  return (
    <span className={`badge ${tone}`}>
      {dot && <i />}
      {children}
    </span>
  )
}

function Button({
  children,
  kind = "primary",
  icon,
  onClick,
  disabled,
  type = "button",
}: {
  children: ReactNode
  kind?: string
  icon?: IconName
  onClick?: () => void
  disabled?: boolean
  type?: "button" | "submit"
}) {
  return (
    <button
      type={type}
      className={`button ${kind}`}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <Icon name={icon} size={16} />}
      {children}
    </button>
  )
}

function Search({
  placeholder = "Search...",
  value,
  onChange,
}: {
  placeholder?: string
  value?: string
  onChange?: (v: string) => void
}) {
  return (
    <label className="search-field">
      <Icon name="search" size={17} />
      <input
        aria-label={placeholder}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
      />
    </label>
  )
}

function PageTitle({ page, action }: { page: Page action?: ReactNode }) {
  const [title, sub] = pageMeta[page]
  return (
    <div className="page-title">
      <div>
        <h1>{title}</h1>
        <p>{sub}</p>
      </div>
      {action}
    </div>
  )
}

function Card({
  title,
  sub,
  action,
  children,
  className = "",
}: {
  title?: string
  sub?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`card ${className}`}>
      {(title || action) && (
        <header className="card-head">
          <div>
            {title && <h2>{title}</h2>}
            {sub && <p>{sub}</p>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  )
}

function Meter({
  label,
  value,
  detail,
  tone = "green",
}: {
  label: string
  value: number
  detail: string
  tone?: string
}) {
  return (
    <div className="meter">
      <div className="meter-copy">
        <span>{label}</span>
        <strong>{value}%</strong>
      </div>
      <div className="track">
        <span className={tone} style={{ width: `${value}%` }} />
      </div>
      <small>{detail}</small>
    </div>
  )
}

const users = [
  [
    "Elena Gilbert",
    "elena@cedarfield.farm",
    "Cedar Field Farm",
    "Farm owner",
    "Active",
    "May 28, 2024",
  ],
  [
    "Marcus Chen",
    "m.chen@greenrise.co",
    "Greenrise Organics",
    "Farm owner",
    "Active",
    "May 26, 2024",
  ],
  [
    "Amina Yusuf",
    "amina@sunvale.ag",
    "Sunvale Acres",
    "Agronomist",
    "Active",
    "May 22, 2024",
  ],
  [
    "Theo Martin",
    "theo.martin@example.com",
    "—",
    "Viewer",
    "Pending",
    "May 20, 2024",
  ],
  [
    "Javier Morales",
    "javier@moralesfarm.mx",
    "Morales Family Farm",
    "Farm owner",
    "Suspended",
    "May 17, 2024",
  ],
  [
    "Nora Singh",
    "nora@harvestlab.io",
    "Harvest Lab",
    "Agronomist",
    "Active",
    "May 14, 2024",
  ],
]

const stations = [
  [
    "AWS-ESP-08401",
    "AGR-8401",
    "Cedar Field Farm",
    "North field · Block 4",
    "12 sec ago",
    "Online",
  ],
  [
    "AWS-ESP-07392",
    "AGR-7392",
    "Greenrise Organics",
    "Greenhouse 2",
    "24 sec ago",
    "Online",
  ],
  [
    "AWS-ESP-06128",
    "AGR-6128",
    "Sunvale Acres",
    "East orchard",
    "1 min ago",
    "Online",
  ],
  [
    "AWS-ESP-09551",
    "AGR-9551",
    "Morales Family Farm",
    "West field",
    "3 hours ago",
    "Offline",
  ],
  [
    "AWS-ESP-04219",
    "AGR-4219",
    "Harvest Lab",
    "Test plot A",
    "41 sec ago",
    "Warning",
  ],
  [
    "AWS-ESP-08802",
    "AGR-8802",
    "Unassigned",
    "Not deployed",
    "Never",
    "Unpaired",
  ],
]

function TableActions({
  items,
  icon = "dots",
  label = "Open row actions",
}: {
  items: string[]
  icon?: IconName
  label?: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", close)
    return () => document.removeEventListener("mousedown", close)
  }, [])
  return (
    <div className="row-actions" ref={ref}>
      <button
        className={icon === "pencil" ? "edit-trigger" : ""}
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <Icon name={icon} size={icon === "pencil" ? 15 : 18} />
      </button>
      {open && (
        <div className="action-menu">
          {items.map((item, i) => (
            <button
              key={item}
              className={i === items.length - 1 ? "danger-text" : ""}
              onClick={() => setOpen(false)}
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function Overview({ go }: { go: (p: Page) => void }) {
  const kpis: [IconName, string, string, string, string][] = [
    ["users", "Total users", "2,846", "+12.4%", "vs. last month"],
    ["station", "Active stations", "1,248", "98.2%", "of 1,271 paired"],
    ["activity", "MQTT message rate", "4,892", "+8.1%", "messages / min"],
    ["gauge", "Server uptime", "99.98%", "42 days", "since last restart"],
  ]
  return (
    <>
      <PageTitle
        page="overview"
        action={
          <div className="title-actions">
            <span className="last-sync">
              <i />
              Live · Updated now
            </span>
            <Button kind="secondary" icon="refresh">
              Refresh
            </Button>
          </div>
        }
      />
      <div className="kpi-grid">
        {kpis.map(([icon, label, value, trend, detail]) => (
          <Card key={label} className="kpi">
            <div className="kpi-top">
              <span className="icon-box">
                <Icon name={icon} />
              </span>
              <Icon name="dots" />
            </div>
            <p>{label}</p>
            <strong>{value}</strong>
            <div className="trend">
              <b>{trend}</b>
              <span>{detail}</span>
            </div>
          </Card>
        ))}
      </div>
      <div className="dashboard-grid">
        <Card
          title="System health"
          sub="Live resource and service utilization"
          action={
            <Badge tone="success" dot>
              All systems operational
            </Badge>
          }
        >
          <div className="health-meters">
            <Meter
              label="API server"
              value={36}
              detail="1.8 GB / 5 GB memory"
            />
            <Meter
              label="PostgreSQL"
              value={58}
              detail="29 GB / 50 GB storage"
              tone="amber"
            />
            <Meter
              label="MQTT broker"
              value={24}
              detail="1,248 active connections"
            />
          </div>
          <div className="service-row">
            <div>
              <span className="service-icon">
                <Icon name="server" />
              </span>
              <p>
                <strong>FastAPI backend</strong>
                <small>api.agroweather.io</small>
              </p>
            </div>
            <Badge tone="success" dot>
              Operational
            </Badge>
          </div>
          <div className="service-row">
            <div>
              <span className="service-icon">
                <Icon name="station" />
              </span>
              <p>
                <strong>EMQX MQTT broker</strong>
                <small>mqtt.agroweather.io</small>
              </p>
            </div>
            <Badge tone="success" dot>
              Operational
            </Badge>
          </div>
        </Card>
        <Card title="Quick actions" sub="Common administrative tasks">
          <div className="quick-list">
            <button onClick={() => go("users")}>
              <span className="quick-icon">
                <Icon name="plus" />
              </span>
              <span>
                <strong>Register a user</strong>
                <small>Create a new platform account</small>
              </span>
              <Icon name="chevron" size={16} />
            </button>
            <button onClick={() => go("stations")}>
              <span className="quick-icon amber-box">
                <Icon name="station" />
              </span>
              <span>
                <strong>Pair a station</strong>
                <small>Register ESP32 hardware</small>
              </span>
              <Icon name="chevron" size={16} />
            </button>
            <button onClick={() => go("infrastructure")}>
              <span className="quick-icon blue-box">
                <Icon name="refresh" />
              </span>
              <span>
                <strong>Service controls</strong>
                <small>Restart platform services</small>
              </span>
              <Icon name="chevron" size={16} />
            </button>
            <button onClick={() => go("audit")}>
              <span className="quick-icon gray-box">
                <Icon name="download" />
              </span>
              <span>
                <strong>Export audit log</strong>
                <small>Download activity as CSV</small>
              </span>
              <Icon name="chevron" size={16} />
            </button>
          </div>
        </Card>
      </div>
      <Card
        title="Recent system events"
        sub="Errors and warnings requiring attention"
        action={
          <button className="text-link" onClick={() => go("audit")}>
            View all logs <Icon name="chevron" size={14} />
          </button>
        }
      >
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Event</th>
                <th>Source</th>
                <th>Severity</th>
                <th>Time</th>
                <th />
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div className="event-cell">
                    <span className="event-icon warning">
                      <Icon name="alert" />
                    </span>
                    <div>
                      <strong>High packet loss detected</strong>
                      <small>
                        Station AWS-ESP-04219 reported 18.4% packet loss
                      </small>
                    </div>
                  </div>
                </td>
                <td>MQTT Broker</td>
                <td>
                  <Badge tone="warning">Warning</Badge>
                </td>
                <td>2 min ago</td>
                <td>
                  <Icon name="chevron" size={15} />
                </td>
              </tr>
              <tr>
                <td>
                  <div className="event-cell">
                    <span className="event-icon danger">
                      <Icon name="x" />
                    </span>
                    <div>
                      <strong>Authentication attempts blocked</strong>
                      <small>5 failed attempts from IP 185.220.101.4</small>
                    </div>
                  </div>
                </td>
                <td>Auth service</td>
                <td>
                  <Badge tone="danger">Critical</Badge>
                </td>
                <td>18 min ago</td>
                <td>
                  <Icon name="chevron" size={15} />
                </td>
              </tr>
              <tr>
                <td>
                  <div className="event-cell">
                    <span className="event-icon neutral">
                      <Icon name="database" />
                    </span>
                    <div>
                      <strong>Automated backup completed</strong>
                      <small>Database snapshot stored successfully</small>
                    </div>
                  </div>
                </td>
                <td>PostgreSQL</td>
                <td>
                  <Badge>Info</Badge>
                </td>
                <td>1 hr ago</td>
                <td>
                  <Icon name="chevron" size={15} />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </>
  )
}

function UsersPage({ onRegister }: { onRegister: () => void }) {
  const [query, setQuery] = useState("")
  const filtered = users.filter((u) =>
    u.join(" ").toLowerCase().includes(query.toLowerCase()),
  )
  return (
    <>
      <PageTitle
        page="users"
        action={
          <Button icon="plus" onClick={onRegister}>
            Register new user
          </Button>
        }
      />
      <div className="stats-strip">
        <div>
          <span className="mini-icon">
            <Icon name="users" />
          </span>
          <p>
            <small>Total users</small>
            <strong>2,846</strong>
          </p>
        </div>
        <div>
          <span className="mini-icon green">
            <Icon name="check" />
          </span>
          <p>
            <small>Active</small>
            <strong>2,731</strong>
          </p>
        </div>
        <div>
          <span className="mini-icon amber">
            <Icon name="user" />
          </span>
          <p>
            <small>Pending</small>
            <strong>84</strong>
          </p>
        </div>
        <div>
          <span className="mini-icon red">
            <Icon name="shield" />
          </span>
          <p>
            <small>Suspended</small>
            <strong>31</strong>
          </p>
        </div>
      </div>
      <Card>
        <div className="table-toolbar">
          <Search
            placeholder="Search name, email, or farm..."
            value={query}
            onChange={setQuery}
          />
          <div>
            <select aria-label="Filter by role">
              <option>All roles</option>
              <option>Farm owner</option>
              <option>Agronomist</option>
              <option>Viewer</option>
            </select>
            <select aria-label="Filter by status">
              <option>All statuses</option>
              <option>Active</option>
              <option>Pending</option>
              <option>Suspended</option>
            </select>
            <Button kind="secondary" icon="download">
              Export
            </Button>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Farm</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
                <tr key={u[1]}>
                  <td>
                    <div className="user-cell">
                      <span className={`avatar av-${i}`}>
                        {u[0]
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                      <div>
                        <strong>{u[0]}</strong>
                        <small>{u[1]}</small>
                      </div>
                    </div>
                  </td>
                  <td>{u[2]}</td>
                  <td>{u[3]}</td>
                  <td>
                    <Badge
                      tone={
                        u[4] === "Active"
                          ? "success"
                          : u[4] === "Pending"
                            ? "warning"
                            : "danger"
                      }
                      dot
                    >
                      {u[4]}
                    </Badge>
                  </td>
                  <td>{u[5]}</td>
                  <td>
                    <TableActions
                      items={[
                        "Edit details",
                        u[4] === "Suspended"
                          ? "Activate account"
                          : "Suspend account",
                        "Force password reset",
                        "Delete account",
                      ]}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pagination">
          <span>Showing 1–6 of 2,846 users</span>
          <div>
            <button disabled>Previous</button>
            <button className="active">1</button>
            <button>2</button>
            <button>3</button>
            <span>…</span>
            <button>475</button>
            <button>Next</button>
          </div>
        </div>
      </Card>
    </>
  )
}

function StationsPage() {
  const [selectedStation, setSelectedStation] = useState<string[] | null>(null)
  return (
    <>
      <PageTitle
        page="stations"
        action={<Button icon="plus">Register station</Button>}
      />
      <div className="stats-strip station-strip">
        <div>
          <span className="mini-icon">
            <Icon name="station" />
          </span>
          <p>
            <small>Total fleet</small>
            <strong>1,271</strong>
          </p>
        </div>
        <div>
          <span className="mini-icon green">
            <Icon name="activity" />
          </span>
          <p>
            <small>Online now</small>
            <strong>1,248</strong>
          </p>
        </div>
        <div>
          <span className="mini-icon amber">
            <Icon name="alert" />
          </span>
          <p>
            <small>Needs attention</small>
            <strong>9</strong>
          </p>
        </div>
        <div>
          <span className="mini-icon gray">
            <Icon name="bolt" />
          </span>
          <p>
            <small>Unpaired</small>
            <strong>14</strong>
          </p>
        </div>
      </div>
      <Card>
        <div className="table-toolbar">
          <Search placeholder="Search ID, pair code, or owner..." />
          <div>
            <select aria-label="Filter stations">
              <option>All stations</option>
              <option>Online</option>
              <option>Offline</option>
              <option>Warning</option>
            </select>
            <Button kind="secondary" icon="refresh">
              Refresh fleet
            </Button>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Station</th>
                <th>Pair code</th>
                <th>Owner</th>
                <th>Deployment</th>
                <th>Last ping</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {stations.map((s) => (
                <tr key={s[0]}>
                  <td>
                    <div className="station-id">
                      <span>
                        <Icon name="station" />
                      </span>
                      <strong>{s[0]}</strong>
                    </div>
                  </td>
                  <td>
                    <code>{s[1]}</code>
                  </td>
                  <td>{s[2]}</td>
                  <td>{s[3]}</td>
                  <td>{s[4]}</td>
                  <td>
                    <Badge
                      dot
                      tone={
                        s[5] === "Online"
                          ? "success"
                          : s[5] === "Warning"
                            ? "warning"
                            : s[5] === "Offline"
                              ? "danger"
                              : "neutral"
                      }
                    >
                      {s[5]}
                    </Badge>
                  </td>
                  <td>
                    <button
                      className="station-edit-button"
                      aria-label={`Manage ${s[0]}`}
                      onClick={() => setSelectedStation(s)}
                    >
                      <Icon name="pencil" size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pagination">
          <span>Showing 1–6 of 1,271 stations</span>
          <div>
            <button disabled>Previous</button>
            <button className="active">1</button>
            <button>2</button>
            <button>3</button>
            <span>…</span>
            <button>212</button>
            <button>Next</button>
          </div>
        </div>
      </Card>
      {selectedStation && (
        <StationManagementModal
          station={selectedStation}
          close={() => setSelectedStation(null)}
        />
      )}
    </>
  )
}

function Infrastructure({ confirm }: { confirm: (service: string) => void }) {
  return (
    <>
      <PageTitle
        page="infrastructure"
        action={
          <div className="title-actions">
            <span className="last-sync">
              <i />
              Live telemetry
            </span>
            <Button kind="secondary" icon="refresh">
              Refresh
            </Button>
          </div>
        }
      />
      <div className="telemetry-grid">
        <Card className="telemetry-card">
          <div className="telemetry-title">
            <span className="icon-box">
              <Icon name="cpu" />
            </span>
            <div>
              <p>CPU usage</p>
              <strong>
                36<span>%</span>
              </strong>
            </div>
            <Badge tone="success">Normal</Badge>
          </div>
          <div className="spark bars">
            {[32, 38, 35, 48, 42, 37, 53, 46, 39, 36, 44, 36].map((v, i) => (
              <i key={i} style={{ height: `${v}%` }} />
            ))}
          </div>
          <small>8 vCPU · Load avg 1.24</small>
        </Card>
        <Card className="telemetry-card">
          <div className="telemetry-title">
            <span className="icon-box amber-bg">
              <Icon name="database" />
            </span>
            <div>
              <p>Memory</p>
              <strong>
                58<span>%</span>
              </strong>
            </div>
            <Badge tone="warning">Moderate</Badge>
          </div>
          <div className="track large">
            <span className="amber" style={{ width: "58%" }} />
          </div>
          <small>9.3 GB of 16 GB used</small>
        </Card>
        <Card className="telemetry-card">
          <div className="telemetry-title">
            <span className="icon-box blue-bg">
              <Icon name="server" />
            </span>
            <div>
              <p>Disk usage</p>
              <strong>
                42<span>%</span>
              </strong>
            </div>
            <Badge tone="success">Normal</Badge>
          </div>
          <div className="track large">
            <span className="blue" style={{ width: "42%" }} />
          </div>
          <small>84.7 GB of 200 GB used</small>
        </Card>
      </div>
      <div className="infra-grid">
        <Card
          title="Active containers"
          sub="Docker service status and resource usage"
        >
          <div className="containers">
            {[
              [
                "FastAPI backend",
                "agro-api-01",
                "0.42%",
                "1.8 GB",
                "Up 42 days",
              ],
              ["EMQX broker", "agro-mqtt-01", "1.84%", "642 MB", "Up 42 days"],
              ["PostgreSQL 16", "agro-db-01", "0.86%", "2.4 GB", "Up 42 days"],
              ["Redis cache", "agro-cache-01", "0.12%", "128 MB", "Up 42 days"],
            ].map((c) => (
              <div className="container-row" key={c[0]}>
                <div className="container-name">
                  <span>
                    <Icon name="server" />
                  </span>
                  <p>
                    <strong>{c[0]}</strong>
                    <small>{c[1]}</small>
                  </p>
                </div>
                <div>
                  <small>CPU</small>
                  <strong>{c[2]}</strong>
                </div>
                <div>
                  <small>Memory</small>
                  <strong>{c[3]}</strong>
                </div>
                <Badge tone="success" dot>
                  {c[4]}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
        <Card title="MQTT broker" sub="Live messaging diagnostics">
          <div className="mqtt-hero">
            <div>
              <small>Messages / min</small>
              <strong>4,892</strong>
              <span>+8.1%</span>
            </div>
            <div className="mini-chart">
              <svg viewBox="0 0 220 60" preserveAspectRatio="none">
                <path d="M0 48 C20 45,28 20,48 35 S80 50,95 28 S125 15,140 30 S165 42,178 20 S205 12,220 16" />
              </svg>
            </div>
          </div>
          <div className="mqtt-stats">
            <div>
              <small>Connections</small>
              <strong>1,248</strong>
            </div>
            <div>
              <small>Subscriptions</small>
              <strong>3,742</strong>
            </div>
            <div>
              <small>Dropped</small>
              <strong>0.02%</strong>
            </div>
          </div>
        </Card>
      </div>
      <Card
        title="Server control panel"
        sub="Privileged infrastructure actions"
        className="control-panel"
      >
        <div className="secure-note">
          <Icon name="shield" />
          <p>
            <strong>Protected actions</strong>
            <span>
              Restarting a service may briefly interrupt station data ingestion.
              All actions are recorded in the audit log.
            </span>
          </p>
        </div>
        <div className="control-row">
          <div>
            <span className="control-icon">
              <Icon name="server" />
            </span>
            <p>
              <strong>FastAPI backend</strong>
              <small>Core API and data processing service</small>
            </p>
          </div>
          <Badge tone="success" dot>
            Running
          </Badge>
          <Button
            kind="danger-outline"
            icon="refresh"
            onClick={() => confirm("FastAPI backend")}
          >
            Restart service
          </Button>
        </div>
        <div className="control-row">
          <div>
            <span className="control-icon">
              <Icon name="station" />
            </span>
            <p>
              <strong>EMQX MQTT broker</strong>
              <small>IoT message broker and station connections</small>
            </p>
          </div>
          <Badge tone="success" dot>
            Running
          </Badge>
          <Button
            kind="danger-outline"
            icon="refresh"
            onClick={() => confirm("EMQX MQTT broker")}
          >
            Restart service
          </Button>
        </div>
      </Card>
    </>
  )
}

const logs = [
  [
    "Admin action",
    "User account suspended",
    "Javier Morales was suspended by Olivia Bennett",
    "Olivia Bennett",
    "2 min ago",
    "Info",
  ],
  [
    "Authentication",
    "Repeated login failures",
    "5 failed attempts from IP 185.220.101.4",
    "Auth service",
    "18 min ago",
    "Critical",
  ],
  [
    "Station",
    "Station connection degraded",
    "AWS-ESP-04219 reported elevated packet loss",
    "MQTT broker",
    "26 min ago",
    "Warning",
  ],
  [
    "Infrastructure",
    "Database backup completed",
    "Daily snapshot agro-db-2024-05-28 stored",
    "System",
    "1 hr ago",
    "Success",
  ],
  [
    "Admin action",
    "Station re-provisioned",
    "AWS-ESP-07392 configuration was refreshed",
    "Olivia Bennett",
    "2 hrs ago",
    "Info",
  ],
  [
    "User",
    "New user registered",
    "Nora Singh joined Harvest Lab as Agronomist",
    "Daniel Kim",
    "3 hrs ago",
    "Info",
  ],
  [
    "Infrastructure",
    "Container health check recovered",
    "agro-cache-01 returned to healthy state",
    "Docker monitor",
    "5 hrs ago",
    "Warning",
  ],
]

function AuditPage() {
  const [query, setQuery] = useState("")
  const filtered = logs.filter((l) =>
    l.join(" ").toLowerCase().includes(query.toLowerCase()),
  )
  return (
    <>
      <PageTitle
        page="audit"
        action={
          <Button kind="secondary" icon="download">
            Export CSV
          </Button>
        }
      />
      <Card>
        <div className="table-toolbar audit-toolbar">
          <Search
            placeholder="Search logs, actors, IP addresses..."
            value={query}
            onChange={setQuery}
          />
          <div>
            <select aria-label="Event type">
              <option>All event types</option>
              <option>Admin action</option>
              <option>Authentication</option>
              <option>Infrastructure</option>
            </select>
            <select aria-label="Severity">
              <option>All severities</option>
              <option>Critical</option>
              <option>Warning</option>
              <option>Info</option>
            </select>
            <select aria-label="Date">
              <option>Last 24 hours</option>
              <option>Last 7 days</option>
              <option>Last 30 days</option>
            </select>
          </div>
        </div>
        <div className="log-list">
          {filtered.map((l, i) => (
            <div className="log-row" key={l[1] + i}>
              <div className={`log-icon ${l[5].toLowerCase()}`}>
                <Icon
                  name={
                    l[5] === "Critical"
                      ? "shield"
                      : l[5] === "Warning"
                        ? "alert"
                        : l[5] === "Success"
                          ? "check"
                          : "log"
                  }
                />
              </div>
              <div className="log-main">
                <div>
                  <Badge tone={l[5].toLowerCase()}>{l[0]}</Badge>
                  <span className="log-time-mobile">{l[4]}</span>
                </div>
                <strong>{l[1]}</strong>
                <p>{l[2]}</p>
              </div>
              <div className="log-actor">
                <small>Actor / source</small>
                <strong>{l[3]}</strong>
              </div>
              <div className="log-time">
                <strong>{l[4]}</strong>
                <Badge tone={l[5].toLowerCase()}>{l[5]}</Badge>
              </div>
            </div>
          ))}
        </div>
        <div className="pagination">
          <span>Showing 1–7 of 8,492 events</span>
          <div>
            <button disabled>Previous</button>
            <button className="active">1</button>
            <button>2</button>
            <button>3</button>
            <span>…</span>
            <button>1214</button>
            <button>Next</button>
          </div>
        </div>
      </Card>
    </>
  )
}

function Toggle({ checked = false }: { checked?: boolean }) {
  const [on, setOn] = useState(checked)
  return (
    <button
      aria-label={on ? "Disable setting" : "Enable setting"}
      aria-pressed={on}
      className={`toggle ${on ? "on" : ""}`}
      onClick={() => setOn(!on)}
    >
      <i />
    </button>
  )
}

function SettingsPage() {
  return (
    <>
      <PageTitle page="settings" action={<Button>Save changes</Button>} />
      <div className="settings-layout">
        <div className="settings-nav">
          <button className="active">
            <Icon name="settings" />
            General
          </button>
          <button>
            <Icon name="shield" />
            Security
          </button>
          <button>
            <Icon name="bell" />
            Notifications
          </button>
          <button>
            <Icon name="database" />
            Data & retention
          </button>
          <button>
            <Icon name="key" />
            API access
          </button>
        </div>
        <div className="settings-content">
          <Card
            title="General settings"
            sub="Organization and platform preferences"
          >
            <div className="form-grid">
              <label>
                <span>Organization name</span>
                <input defaultValue="AgroWeather Operations" />
              </label>
              <label>
                <span>Support email</span>
                <input defaultValue="support@agroweather.io" />
              </label>
              <label>
                <span>Default timezone</span>
                <select defaultValue="utc">
                  <option value="utc">UTC (Coordinated Universal Time)</option>
                  <option>Europe/London</option>
                  <option>America/New_York</option>
                </select>
              </label>
              <label>
                <span>Default unit system</span>
                <select>
                  <option>Metric (°C, mm, km/h)</option>
                  <option>Imperial (°F, in, mph)</option>
                </select>
              </label>
            </div>
          </Card>
          <Card
            title="Platform preferences"
            sub="System-wide behavior and monitoring"
          >
            <div className="setting-row">
              <div>
                <strong>Station offline alerts</strong>
                <p>
                  Notify administrators when a station is unreachable for 15
                  minutes.
                </p>
              </div>
              <Toggle checked />
            </div>
            <div className="setting-row">
              <div>
                <strong>Automatic station provisioning</strong>
                <p>
                  Apply the current default configuration when new hardware is
                  paired.
                </p>
              </div>
              <Toggle checked />
            </div>
            <div className="setting-row">
              <div>
                <strong>Maintenance mode</strong>
                <p>
                  Restrict platform access to administrators during maintenance.
                </p>
              </div>
              <Toggle />
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}

function Modal({
  children,
  onClose,
  className = "",
}: {
  children: ReactNode
  onClose: () => void
  className?: string
}) {
  useEffect(() => {
    const close = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    document.addEventListener("keydown", close)
    return () => document.removeEventListener("keydown", close)
  }, [onClose])
  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={`modal ${className}`} role="dialog" aria-modal="true">
        {children}
      </div>
    </div>
  )
}

function RegisterModal({ close }: { close: () => void }) {
  return (
    <Modal onClose={close}>
      <div className="modal-head">
        <div>
          <span className="modal-icon">
            <Icon name="user" />
          </span>
          <div>
            <h2>Register new user</h2>
            <p>Create access to the AgroWeather platform.</p>
          </div>
        </div>
        <button aria-label="Close" onClick={close}>
          <Icon name="x" />
        </button>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          close()
        }}
      >
        <div className="modal-body form-grid">
          <label>
            <span>First name</span>
            <input required placeholder="e.g. Elena" />
          </label>
          <label>
            <span>Last name</span>
            <input required placeholder="e.g. Gilbert" />
          </label>
          <label className="wide">
            <span>Email address</span>
            <input type="email" required placeholder="name@farm.com" />
          </label>
          <label className="wide">
            <span>Farm or organization</span>
            <input placeholder="Organization name" />
          </label>
          <label>
            <span>Role</span>
            <select>
              <option>Farm owner</option>
              <option>Agronomist</option>
              <option>Viewer</option>
            </select>
          </label>
          <label>
            <span>Account status</span>
            <select>
              <option>Active</option>
              <option>Pending</option>
            </select>
          </label>
          <label className="wide checkbox">
            <input type="checkbox" defaultChecked />
            <span>
              Send an account setup email with a secure password link.
            </span>
          </label>
        </div>
        <div className="modal-foot">
          <Button kind="secondary" onClick={close}>
            Cancel
          </Button>
          <Button type="submit" icon="plus">
            Register user
          </Button>
        </div>
      </form>
    </Modal>
  )
}

function RestartModal({
  service,
  close,
}: {
  service: string
  close: () => void
}) {
  const [value, setValue] = useState("")
  return (
    <Modal onClose={close}>
      <div className="modal-head danger-head">
        <div>
          <span className="modal-icon danger">
            <Icon name="alert" />
          </span>
          <div>
            <h2>Restart {service}?</h2>
            <p>This is a privileged infrastructure action.</p>
          </div>
        </div>
        <button aria-label="Close" onClick={close}>
          <Icon name="x" />
        </button>
      </div>
      <div className="modal-body">
        <div className="warning-box">
          <Icon name="alert" />
          <p>
            Active connections may be interrupted for up to 60 seconds. Station
            messages will queue and reconnect automatically.
          </p>
        </div>
        <label className="confirm-label">
          <span>
            Type <strong>RESTART</strong> to confirm
          </span>
          <input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="RESTART"
          />
        </label>
      </div>
      <div className="modal-foot">
        <Button kind="secondary" onClick={close}>
          Cancel
        </Button>
        <Button
          kind="danger"
          disabled={value !== "RESTART"}
          onClick={close}
          icon="refresh"
        >
          Restart service
        </Button>
      </div>
    </Modal>
  )
}

function StationManagementModal({
  station,
  close,
}: {
  station: string[]
  close: () => void
}) {
  const [tab, setTab] = useState<"users" | "hardware" | "details">("users")
  const [pairCode, setPairCode] = useState(station[1])
  const isUnassigned = station[2] === "Unassigned"

  return (
    <Modal onClose={close} className="station-management-modal">
      <div className="station-modal-shell">
        <div className="modal-head station-modal-head">
          <div>
            <span className="modal-icon">
              <Icon name="station" />
            </span>
            <div>
              <span className="station-modal-kicker">Manage station</span>
              <h2>
                {station[1]} · {station[3]}
              </h2>
              <p>
                {station[0]} · {station[2]}
              </p>
            </div>
          </div>
          <button aria-label="Close station management" onClick={close}>
            <Icon name="x" />
          </button>
        </div>

        <div
          className="station-tabs"
          role="tablist"
          aria-label="Station management"
        >
          <button
            role="tab"
            aria-selected={tab === "users"}
            className={tab === "users" ? "active" : ""}
            onClick={() => setTab("users")}
          >
            <Icon name="users" size={16} />
            User management
          </button>
          <button
            role="tab"
            aria-selected={tab === "hardware"}
            className={tab === "hardware" ? "active" : ""}
            onClick={() => setTab("hardware")}
          >
            <Icon name="cpu" size={16} />
            Hardware management
          </button>
          <button
            role="tab"
            aria-selected={tab === "details"}
            className={tab === "details" ? "active" : ""}
            onClick={() => setTab("details")}
          >
            <Icon name="settings" size={16} />
            Station details
          </button>
        </div>

        <div className="modal-body station-modal-body">
          {tab === "users" && (
            <div className="station-tab-panel">
              <div className="panel-title">
                <div>
                  <h3>Assigned users</h3>
                  <p>Control who can view and manage this station.</p>
                </div>
                <Button icon="plus">Add user</Button>
              </div>
              {isUnassigned ? (
                <div className="empty-assignment">
                  <span>
                    <Icon name="users" />
                  </span>
                  <strong>No users assigned</strong>
                  <p>
                    Assign an owner or operator to begin managing this station.
                  </p>
                  <Button icon="plus">Assign first user</Button>
                </div>
              ) : (
                <div className="assigned-user">
                  <span className="avatar">
                    {station[2]
                      .split(" ")
                      .slice(0, 2)
                      .map((word) => word[0])
                      .join("")}
                  </span>
                  <div>
                    <strong>{station[2]}</strong>
                    <p>Primary owner · Full station access</p>
                  </div>
                  <Badge tone="success" dot>
                    Active
                  </Badge>
                  <button
                    className="user-action"
                    aria-label="Edit assigned user"
                  >
                    <Icon name="pencil" size={14} />
                    Edit
                  </button>
                  <button
                    className="user-action danger-text"
                    aria-label="Remove assigned user"
                  >
                    <Icon name="x" size={14} />
                    Remove
                  </button>
                </div>
              )}
              <div className="permission-note">
                <Icon name="shield" />
                <p>
                  <strong>Station access</strong>
                  <span>
                    Assigned users can view telemetry, alerts, and station
                    history. Only administrators can change hardware settings.
                  </span>
                </p>
              </div>
            </div>
          )}

          {tab === "hardware" && (
            <div className="station-tab-panel">
              <div className="hardware-summary">
                <div>
                  <small>Connection</small>
                  <Badge
                    dot
                    tone={
                      station[5] === "Online"
                        ? "success"
                        : station[5] === "Warning"
                          ? "warning"
                          : "danger"
                    }
                  >
                    {station[5]}
                  </Badge>
                </div>
                <div>
                  <small>Last ping</small>
                  <strong>{station[4]}</strong>
                </div>
                <div>
                  <small>Firmware</small>
                  <strong>v2.8.4</strong>
                </div>
                <div>
                  <small>Hardware</small>
                  <strong>ESP32-S3</strong>
                </div>
              </div>
              <div className="hardware-action">
                <span className="control-icon">
                  <Icon name="download" />
                </span>
                <div>
                  <strong>Firmware & configuration</strong>
                  <p>
                    Deploy the latest stable firmware and station configuration.
                  </p>
                </div>
                <Button kind="secondary" icon="download">
                  Update station
                </Button>
              </div>
              <div className="hardware-action">
                <span className="control-icon">
                  <Icon name="refresh" />
                </span>
                <div>
                  <strong>Restart hardware</strong>
                  <p>
                    Remotely reboot the ESP32 controller and reconnect sensors.
                  </p>
                </div>
                <Button kind="secondary" icon="refresh">
                  Restart station
                </Button>
              </div>
              <div className="hardware-action">
                <span className="control-icon">
                  <Icon name="key" />
                </span>
                <div>
                  <strong>Assign new pair code</strong>
                  <p>
                    Invalidate the current code and generate a new secure
                    pairing code.
                  </p>
                </div>
                <Button kind="secondary" icon="key">
                  Generate code
                </Button>
              </div>
              <div className="danger-zone">
                <div>
                  <strong>Delete station</strong>
                  <p>
                    Remove this hardware and all of its platform associations.
                  </p>
                </div>
                <Button kind="danger-outline">Delete station</Button>
              </div>
            </div>
          )}

          {tab === "details" && (
            <div className="station-tab-panel">
              <div className="panel-title">
                <div>
                  <h3>Station details</h3>
                  <p>Edit deployment details and identifying information.</p>
                </div>
              </div>
              <div className="form-grid station-form">
                <label>
                  <span>Station ID</span>
                  <input value={station[0]} disabled />
                </label>
                <label>
                  <span>Pair code</span>
                  <input
                    value={pairCode}
                    onChange={(event) => setPairCode(event.target.value)}
                  />
                </label>
                <label>
                  <span>Deployment location</span>
                  <input defaultValue={station[3]} />
                </label>
                <label>
                  <span>Owner</span>
                  <select defaultValue={station[2]}>
                    <option>{station[2]}</option>
                    <option>Cedar Field Farm</option>
                    <option>Greenrise Organics</option>
                    <option>Harvest Lab</option>
                  </select>
                </label>
                <label className="wide">
                  <span>Internal notes</span>
                  <input placeholder="Add an optional note for administrators" />
                </label>
              </div>
            </div>
          )}
        </div>

        <div className="modal-foot station-modal-foot">
          <span>Changes are recorded in the audit log.</span>
          <div>
            <Button kind="secondary" onClick={close}>
              Close
            </Button>
            <Button icon="check" onClick={close}>
              Save changes
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default function App() {
  const [page, setPage] = useState<Page>("overview")
  const [mobileNav, setMobileNav] = useState(false)
  const [profile, setProfile] = useState(false)
  const [modal, setModal] = useState<"register" | string | null>(null)
  const setCurrent = (p: Page) => {
    setPage(p)
    setMobileNav(false)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }
  return (
    <div className="app-shell">
      {mobileNav && (
        <div className="nav-scrim" onClick={() => setMobileNav(false)} />
      )}
      <aside className={mobileNav ? "open" : ""}>
        <div className="brand">
          <div className="brand-mark">
            <img src="/logo.webp" alt="" />
          </div>
          <div>
            <strong>AgroWeather</strong>
            <span>ADMIN CONSOLE</span>
          </div>
          <button
            aria-label="Close navigation"
            onClick={() => setMobileNav(false)}
          >
            <Icon name="x" />
          </button>
        </div>
        <nav>
          <span>Workspace</span>
          {nav.slice(0, 4).map((n) => (
            <button
              key={n.id}
              className={page === n.id ? "active" : ""}
              onClick={() => setCurrent(n.id)}
            >
              <Icon name={n.icon} />
              <span>{n.label}</span>
              {n.id === "infrastructure" && <i className="nav-status" />}
            </button>
          ))}
          <span>Administration</span>
          {nav.slice(4).map((n) => (
            <button
              key={n.id}
              className={page === n.id ? "active" : ""}
              onClick={() => setCurrent(n.id)}
            >
              <Icon name={n.icon} />
              <span>{n.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-foot">
          <div className="status-card">
            <div>
              <span>
                <i />
                System status
              </span>
              <strong>All systems operational</strong>
            </div>
            <Icon name="chevron" size={16} />
          </div>
          <p>
            AgroWeather Admin <span>v2.4.1</span>
          </p>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <button
            className="mobile-menu"
            aria-label="Open navigation"
            onClick={() => setMobileNav(true)}
          >
            <Icon name="menu" />
          </button>
          <div className="global-search">
            <Icon name="search" />
            <input placeholder="Search users, stations, logs..." />
            <kbd>⌘ K</kbd>
          </div>
          <div className="header-right">
            <div className="health-indicator">
              <i />
              <span>Systems healthy</span>
            </div>
            <button className="icon-button" aria-label="Help">
              <Icon name="help" />
            </button>
            <button
              className="icon-button notification"
              aria-label="Notifications"
            >
              <Icon name="bell" />
              <i />
            </button>
            <div className="profile-wrap">
              <button className="profile" onClick={() => setProfile(!profile)}>
                <span>OB</span>
                <div>
                  <strong>Olivia Bennett</strong>
                  <small>Super Admin</small>
                </div>
                <Icon name="chevron" size={14} />
              </button>
              {profile && (
                <div className="profile-menu">
                  <button>
                    <Icon name="user" />
                    My profile
                  </button>
                  <button>
                    <Icon name="settings" />
                    Preferences
                  </button>
                  <hr />
                  <button className="danger-text">Sign out</button>
                </div>
              )}
            </div>
          </div>
        </header>
        <main>
          {page === "overview" && <Overview go={setCurrent} />}
          {page === "users" && (
            <UsersPage onRegister={() => setModal("register")} />
          )}
          {page === "stations" && <StationsPage />}
          {page === "infrastructure" && <Infrastructure confirm={setModal} />}
          {page === "audit" && <AuditPage />}
          {page === "settings" && <SettingsPage />}
        </main>
      </div>
      {modal === "register" && <RegisterModal close={() => setModal(null)} />}
      {modal && modal !== "register" && (
        <RestartModal service={modal} close={() => setModal(null)} />
      )}
    </div>
  )
}
