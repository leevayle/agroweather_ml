import { useState } from 'react'

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

type CalendarTask = { title: string; type: string; time?: string; ai?: boolean; color: string; done?: boolean }

const initialTasks: Record<number, CalendarTask[]> = {
  22: [
    { title: 'Fertilizer — Field A', type: 'task', time: '8:00am', color: 'var(--primary)' },
    { title: 'Irrigation run check', type: 'task', time: '5:00pm', color: 'var(--sky)' },
  ],
  23: [
    { title: 'Irrigation lines — South', type: 'task', time: '9:00am', color: 'var(--sky)' },
  ],
  24: [
    { title: 'Scout aphids — Field A', type: 'ai', time: '7:00am', ai: true, color: 'var(--accent)' },
  ],
  25: [
    { title: 'Skip irrigation (AI)', type: 'ai', time: 'All day', ai: true, color: 'var(--accent)' },
    { title: 'Rain expected 2–5pm', type: 'weather', time: '2:00pm', color: 'var(--sky)' },
  ],
  26: [
    { title: 'Harvest window opens', type: 'ai', time: 'All day', ai: true, color: 'var(--accent)' },
    { title: 'Combine prep', type: 'task', time: '6:00am', color: 'var(--primary)' },
  ],
  28: [
    { title: 'Market delivery', type: 'task', time: '7:00am', color: 'var(--muted-foreground)' },
  ],
  30: [
    { title: 'Monthly field review', type: 'task', time: '10:00am', color: 'var(--primary)' },
  ],
}

interface AddTaskModalProps {
  onClose: () => void
  onAdd: (task: { title: string; date: string; time: string; type: string }) => void
}

function AddTaskModal({ onClose, onAdd }: AddTaskModalProps) {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('2026-09-22')
  const [time, setTime] = useState('08:00')
  const [type, setType] = useState('task')

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-[var(--overlay)]/40 backdrop-blur-sm">
      <div className="bg-[var(--background)] rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--muted)]">
          <h3 className="font-semibold text-[var(--foreground)]">Add Task</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-[var(--background)] flex items-center justify-center text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-colors">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Task name</label>
            <input
              type="text"
              placeholder="e.g. Apply herbicide — Field B"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10 transition-all"
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)] transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Time</label>
              <input
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)] transition-all"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Type</label>
            <div className="flex gap-2">
              {['task', 'irrigation', 'harvest', 'scouting'].map(t => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`flex-1 text-xs font-medium py-2 rounded-lg border capitalize transition-all ${
                    type === t ? 'bg-[var(--primary)] text-[var(--primary-foreground)] border-[var(--primary)]' : 'text-[var(--muted-foreground)] border-[var(--border)]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-3 px-5 pb-5">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-[var(--border)] text-sm font-medium text-[var(--muted-foreground)] hover:border-[var(--primary)] transition-colors">
            Cancel
          </button>
          <button
            disabled={!title}
            onClick={() => { onAdd({ title, date, time, type }); onClose() }}
            className="flex-1 py-3 rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] text-sm font-semibold hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-40"
          >
            Add task
          </button>
        </div>
      </div>
    </div>
  )
}

export default function CalendarView() {
  const [tasks, setTasks] = useState(initialTasks)
  const [view, setView] = useState<'month' | 'week'>('month')
  const [showModal, setShowModal] = useState(false)
  const [selectedDay, setSelectedDay] = useState<number | null>(22)
  const [filter, setFilter] = useState<'all' | 'ai' | 'task' | 'weather'>('all')

  // September 2026 starts on Tuesday (index 2)
  const startDow = 2
  const daysInMonth = 30

  const dayTasks = selectedDay ? (tasks[selectedDay] || []) : []
  const filteredTasks = filter === 'all' ? dayTasks : dayTasks.filter(t => t.type === filter || (filter === 'ai' && t.ai))

  return (
    <div className="pb-24 md:pb-8 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Calendar</h1>
          <p className="text-sm text-[var(--muted-foreground)]">September 2026</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-[var(--primary)] text-[var(--primary-foreground)] text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-[var(--primary-hover)] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Add task
        </button>
      </div>

      {/* View Toggle */}
      <div className="flex items-center gap-2">
        <div className="flex bg-[var(--grey1)] rounded-xl p-1 gap-1">
          {(['month', 'week'] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${
                view === v ? 'bg-[var(--background)] text-[var(--foreground)] shadow-sm' : 'text-[var(--muted-foreground)]'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
        <div className="flex gap-2 ml-2 overflow-x-auto hide-scrollbar">
          {(['all', 'ai', 'task', 'weather'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-lg border capitalize transition-all ${
                filter === f ? 'bg-[var(--primary)] text-[var(--primary-foreground)] border-[var(--primary)]' : 'text-[var(--muted-foreground)] border-[var(--border)]'
              }`}
            >
              {f === 'ai' ? '🤖 AI' : f === 'weather' ? '🌦️ Weather' : f === 'task' ? '✅ Tasks' : 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Month View */}
      {view === 'month' && (
        <div className="bg-[var(--background)] border border-[var(--border)] rounded-2xl overflow-hidden">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-[var(--muted)]">
            {daysOfWeek.map(d => (
              <div key={d} className="py-2.5 text-center text-xs font-semibold text-[var(--muted-foreground)]">{d}</div>
            ))}
          </div>
          {/* Days grid */}
          <div className="grid grid-cols-7">
            {/* Empty cells for start offset */}
            {Array.from({ length: startDow }, (_, i) => (
              <div key={`empty-${i}`} className="h-14 border-b border-r border-[var(--muted)] bg-[var(--grey)]/50" />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1
              const dayTasks2 = tasks[day] || []
              const isSelected = selectedDay === day
              const isToday = day === 22
              return (
                <div
                  key={day}
                  onClick={() => setSelectedDay(selectedDay === day ? null : day)}
                  className={`h-14 border-b border-r border-[var(--muted)] p-1.5 cursor-pointer transition-colors relative ${
                    isSelected ? 'bg-[var(--secondary)]' : 'hover:bg-[var(--grey)]'
                  } ${(i + startDow) % 7 === 6 ? 'border-r-0' : ''}`}
                >
                  <span className={`text-xs font-medium block mb-1 w-6 h-6 flex items-center justify-center rounded-full ${
                    isToday ? 'bg-[var(--primary)] text-[var(--primary-foreground)]' : isSelected ? 'text-[var(--primary)] font-semibold' : 'text-[var(--foreground)]'
                  }`}>
                    {day}
                  </span>
                  <div className="flex flex-col gap-0.5">
                    {dayTasks2.slice(0, 2).map((t, ti) => (
                      <div
                        key={ti}
                        className="h-1.5 rounded-full"
                        style={{ backgroundColor: t.color, opacity: t.ai ? 1 : 0.7 }}
                      />
                    ))}
                    {dayTasks2.length > 2 && (
                      <span className="text-[9px] text-[var(--muted-foreground)]">+{dayTasks2.length - 2}</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Week View */}
      {view === 'week' && (
        <div className="bg-[var(--background)] border border-[var(--border)] rounded-2xl overflow-hidden">
          <div className="grid grid-cols-7 border-b border-[var(--muted)]">
            {[22, 23, 24, 25, 26, 27, 28].map((day, i) => (
              <div
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`py-3 text-center cursor-pointer transition-colors ${selectedDay === day ? 'bg-[var(--secondary)]' : 'hover:bg-[var(--grey)]'}`}
              >
                <p className="text-xs text-[var(--muted-foreground)]">{daysOfWeek[i]}</p>
                <p className={`text-sm font-semibold mt-0.5 w-7 h-7 mx-auto flex items-center justify-center rounded-full ${
                  day === 22 ? 'bg-[var(--primary)] text-[var(--primary-foreground)]' : 'text-[var(--foreground)]'
                }`}>
                  {day}
                </p>
                {tasks[day]?.length > 0 && (
                  <div className="flex justify-center gap-0.5 mt-1">
                    {tasks[day].slice(0, 3).map((t, ti) => (
                      <div key={ti} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: t.color }} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          {/* Time slots */}
          <div className="divide-y divide-[var(--muted)] max-h-80 overflow-y-auto">
            {['6am', '7am', '8am', '9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm', '5pm', '6pm'].map(hour => (
              <div key={hour} className="flex">
                <div className="w-12 flex-shrink-0 py-2 px-2 text-xs text-[var(--muted-foreground)]">{hour}</div>
                <div className="flex-1 grid grid-cols-7 divide-x divide-[var(--muted)]">
                  {[22, 23, 24, 25, 26, 27, 28].map(day => {
                    const slotTasks = (tasks[day] || []).filter(t => t.time && t.time.toLowerCase().includes(hour.replace('am','').replace('pm','')))
                    return (
                      <div key={day} className={`min-h-8 p-0.5 ${selectedDay === day ? 'bg-[var(--secondary)]/50' : ''}`}>
                        {slotTasks.map((t, i) => (
                          <div key={i} className="text-xs px-1.5 py-1 rounded-md truncate text-[var(--primary-foreground)]" style={{ backgroundColor: t.color }}>
                            {t.title}
                          </div>
                        ))}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Day Tasks */}
      {selectedDay && (
        <div>
          <h2 className="text-sm font-semibold text-[var(--foreground)] mb-3">
            September {selectedDay} {selectedDay === 22 && '· Today'}
          </h2>
          {filteredTasks.length === 0 ? (
            <div className="bg-[var(--background)] border border-dashed border-[var(--border)] rounded-xl p-8 text-center">
              <p className="text-3xl mb-2">📋</p>
              <p className="text-sm font-medium text-[var(--foreground)]">No tasks this day</p>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">Tap + Add task to schedule something</p>
              <button
                onClick={() => setShowModal(true)}
                className="mt-4 text-xs font-semibold text-[var(--primary)] bg-[var(--secondary)] px-4 py-2 rounded-xl hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] transition-colors"
              >
                + Add task
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTasks.map((task, i) => (
                <div key={`${task.title}-${i}`} className={`bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-3 flex items-center gap-3 ${task.done ? 'opacity-50' : ''}`}>
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: task.color }} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium text-[var(--foreground)] truncate ${task.done ? 'line-through' : ''}`}>{task.title}</p>
                    {task.time && <p className="text-xs text-[var(--muted-foreground)]">{task.time}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    {task.ai && (
                      <span className="text-xs bg-[var(--warning)] text-[var(--accent)] font-semibold px-2 py-0.5 rounded-full">AI</span>
                    )}
                    <button onClick={() => {
                      if (!selectedDay) return
                      setTasks(current => ({
                        ...current,
                        [selectedDay]: current[selectedDay].map(item => item === task ? { ...item, done: !item.done } : item),
                      }))
                    }} className={`w-6 h-6 rounded-full border flex items-center justify-center text-[var(--muted-foreground)] hover:bg-[var(--grey)] transition-colors ${task.done ? 'bg-[var(--primary)] border-[var(--primary)] text-[var(--primary-foreground)]' : 'border-[var(--border)]'}`}>
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M1 5l2.5 2.5 5.5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showModal && (
        <AddTaskModal
          onClose={() => setShowModal(false)}
          onAdd={(task) => {
            const day = Number(task.date.slice(-2))
            const color = task.type === 'irrigation' ? 'var(--sky)' : task.type === 'harvest' ? 'var(--accent)' : 'var(--primary)'
            setTasks(current => ({
              ...current,
              [day]: [...(current[day] || []), { ...task, color }],
            }))
            setSelectedDay(day)
          }}
        />
      )}
    </div>
  )
}
