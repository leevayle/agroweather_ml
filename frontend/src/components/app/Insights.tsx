import { useState } from 'react'

const crops = [
  { name: 'Corn', field: 'Field B', stage: 'Tasseling', health: 92, icon: '🌽' },
  { name: 'Soybeans', field: 'Field A', stage: 'Pod filling', health: 88, icon: '🫘' },
  { name: 'Tomatoes', field: 'Greenhouse', stage: 'Flowering', health: 95, icon: '🍅' },
]

const allInsights = {
  Corn: [
    {
      type: 'irrigation',
      priority: 'high',
      title: 'Skip Thursday irrigation',
      body: '14mm of rain forecast Thursday 2–5pm. Current soil moisture at 68%. Irrigating before this event would cause oversaturation and root stress. Resume Friday evening if soil moisture drops below 60%.',
      action: 'Skip Sep 25 irrigation',
      icon: '💧',
      impact: 'Save ~$340 and 4,200L water',
      confidence: 94,
    },
    {
      type: 'fertilizer',
      priority: 'medium',
      title: 'Side-dress nitrogen application ideal this week',
      body: 'Growth stage analysis shows V8 corn with active leaf area index of 3.2. Temperature trend supports rapid N uptake. Apply 28% UAN at 80 lbs/acre before predicted rain on Thursday for natural incorporation.',
      action: 'Schedule nitrogen application',
      icon: '🌿',
      impact: 'Optimize yield potential by est. 8%',
      confidence: 81,
    },
  ],
  Soybeans: [
    {
      type: 'harvest',
      priority: 'high',
      title: 'Optimal harvest window: Sep 26–29',
      body: 'Seed moisture content tracking at 15.8% today, projected to reach 13.2% by Sep 26 — ideal for combining without heated air drying. Weather models show dry conditions through Sep 29, a 4-day combine window. After Sep 30, probability of rain increases to 65%.',
      action: 'Schedule harvest Sep 26',
      icon: '🌾',
      impact: 'Avoid costly $1,200/day drying',
      confidence: 88,
    },
    {
      type: 'pest',
      priority: 'low',
      title: 'Watch for soybean aphid pressure',
      body: 'Warm overnight temperatures (>18°C) forecast through the week are favorable for aphid reproduction. Scout Field A rows 15, 30, and 45 for colony establishment. Economic threshold is 250 aphids per plant on 80% of plants.',
      action: 'Add scouting task',
      icon: '🔍',
      impact: 'Early detection prevents yield loss',
      confidence: 67,
    },
  ],
  Tomatoes: [
    {
      type: 'irrigation',
      priority: 'medium',
      title: 'Increase irrigation frequency',
      body: 'Greenhouse soil moisture at 78% but evapotranspiration rate is elevated due to flowering stage demands. Current 2x/day schedule is borderline for fruit set optimization. Add a 3rd brief cycle (8 min drip) at 2pm to maintain 80–85% soil moisture during flower development.',
      action: 'Update irrigation schedule',
      icon: '💧',
      impact: 'Improve fruit set by est. 12%',
      confidence: 89,
    },
    {
      type: 'climate',
      priority: 'warning',
      title: 'Ventilate — afternoon heat stress risk',
      body: 'Forecast highs of 28°C outside. Greenhouse temps may reach 34–36°C between 2–5pm without ventilation. Above 32°C pollen viability drops sharply. Open roof vents at 1:30pm and run circulation fans.',
      action: 'Set ventilation alert',
      icon: '🌡️',
      impact: 'Protect flower pollination',
      confidence: 96,
    },
  ],
}

type CropName = 'Corn' | 'Soybeans' | 'Tomatoes'

function LineChart({ data, color }: { data: number[]; color: string }) {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const w = 200
  const h = 50
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * (h - 8) - 4}`)
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="none">
      <path
        d={`M ${pts.join(' L ')} L ${w} ${h} L 0 ${h} Z`}
        fill="var(--grey1)"
      />
      <path
        d={`M ${pts.join(' L ')}`}
        stroke={color}
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function Insights() {
  const [activeCrop, setActiveCrop] = useState<CropName>('Corn')
  const [added, setAdded] = useState<Record<string, boolean>>({})
  const [dismissed, setDismissed] = useState<Record<string, boolean>>({})
  const crop = crops.find(c => c.name === activeCrop)!
  const insights = allInsights[activeCrop]

  const priorityColor = (p: string) => {
    if (p === 'high') return { bg: 'bg-[var(--warning)]', text: 'text-[var(--accent)]', dot: 'bg-[var(--accent)]', label: 'Act today' }
    if (p === 'warning') return { bg: 'bg-[var(--danger-soft)]', text: 'text-[var(--danger-strong)]', dot: 'bg-[var(--danger)]', label: 'Alert' }
    if (p === 'low') return { bg: 'bg-[var(--muted)]', text: 'text-[var(--muted-foreground)]', dot: 'bg-[var(--muted-foreground)]', label: 'Monitor' }
    return { bg: 'bg-[var(--secondary)]', text: 'text-[var(--primary)]', dot: 'bg-[var(--primary)]', label: 'Plan ahead' }
  }

  return (
    <div className="pb-24 md:pb-8 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">AI Insights</h1>
        <p className="text-sm text-[var(--muted-foreground)]">Powered by Random Forest · Updated 4 min ago</p>
      </div>

      {/* Crop Selector */}
      <div className="flex gap-3 overflow-x-auto hide-scrollbar -mx-1 px-1 pb-1">
        {crops.map(c => (
          <button
            key={c.name}
            onClick={() => setActiveCrop(c.name as CropName)}
            className={`flex-shrink-0 flex items-center gap-2.5 px-4 py-3 rounded-xl border transition-all ${
              activeCrop === c.name
                ? 'bg-[var(--primary)] text-[var(--primary-foreground)] border-[var(--primary)] shadow-sm'
                : 'bg-[var(--background)] text-[var(--muted-foreground)] border-[var(--border)] hover:border-[var(--primary)]'
            }`}
          >
            <span className="text-xl">{c.icon}</span>
            <div className="text-left">
              <p className="text-sm font-semibold leading-none">{c.name}</p>
              <p className={`text-xs mt-0.5 ${activeCrop === c.name ? 'text-[var(--success-soft)]' : 'text-[var(--muted-foreground)]'}`}>{c.field}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Crop Health Card */}
      <div className="bg-[var(--background)] border border-[var(--border)] rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{crop.icon}</div>
            <div>
              <h2 className="font-semibold text-[var(--foreground)]">{crop.name} · {crop.field}</h2>
              <p className="text-xs text-[var(--muted-foreground)]">Growth stage: {crop.stage}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-[var(--primary)]">{crop.health}%</p>
            <p className="text-xs text-[var(--muted-foreground)]">Crop health</p>
          </div>
        </div>
        <div className="h-2 bg-[var(--muted)] rounded-full overflow-hidden mb-4">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${crop.health}%`,
              background: crop.health > 85 ? 'var(--primary)' : crop.health > 70 ? 'var(--accent)' : 'var(--danger)',
            }}
          />
        </div>
        {/* Mini charts row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Soil Moisture', data: [65, 68, 72, 70, 68, 66, 68], color: 'var(--sky)', val: '68%' },
            { label: 'Temperature', data: [21, 22, 24, 26, 25, 23, 24], color: 'var(--accent)', val: '24°C' },
            { label: 'Humidity', data: [64, 66, 70, 68, 67, 69, 68], color: 'var(--primary)', val: '68%' },
          ].map(chart => (
            <div key={chart.label} className="bg-[var(--background)] rounded-xl p-3">
              <p className="text-xs text-[var(--muted-background)] mb-1">{chart.label}</p>
              <p className="text-sm font-bold text-[var(--foreground)] mb-2">{chart.val}</p>
              <LineChart data={chart.data} color={chart.color} />
            </div>
          ))}
        </div>
      </div>

      {/* AI Recommendations */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <h2 className="font-semibold text-[var(--foreground)] text-sm">AI Recommendations</h2>
          <span className="text-xs bg-[var(--warning)] text-[var(--accent)] font-semibold px-2 py-0.5 rounded-full">
            {insights.length}
          </span>
        </div>
        <div className="space-y-3">
          {insights.map((ins, i) => {
            const style = priorityColor(ins.priority)
            const key = `${activeCrop}-${i}`
            if (dismissed[key]) return null
            return (
              <div key={i} className="bg-[var(--background)] border border-[var(--border)] rounded-xl overflow-hidden">
                <div className={`flex items-center gap-2 px-4 py-2.5 ${style.bg}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                  <span className={`text-xs font-semibold ${style.text}`}>{style.label}</span>
                  <span className="ml-auto text-xs text-[var(--muted-foreground)]">
                    {ins.confidence}% confidence
                  </span>
                </div>
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl ${style.bg} flex items-center justify-center text-xl flex-shrink-0`}>
                      {ins.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-[var(--foreground)] mb-1.5">{ins.title}</h3>
                      <p className="text-xs text-[var(--muted-foreground)] leading-relaxed mb-3">{ins.body}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-[var(--success-strong)] font-medium bg-[var(--secondary)] px-2 py-1 rounded-lg">
                          💰 {ins.impact}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4 pt-3 border-t border-[var(--muted)]">
                    <button
                      onClick={() => setAdded(a => ({ ...a, [key]: true }))}
                      className={`flex-1 text-xs font-semibold py-2.5 rounded-xl transition-all ${
                        added[key]
                          ? 'bg-[var(--secondary)] text-[var(--primary)]'
                          : 'bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)]'
                      }`}
                    >
                      {added[key] ? '✓ Added to calendar' : `+ ${ins.action}`}
                    </button>
                    <button onClick={() => setDismissed(current => ({ ...current, [key]: true }))} className="px-3 py-2.5 rounded-xl border border-[var(--border)] text-xs text-[var(--muted-foreground)] hover:border-[var(--primary)] transition-colors">
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Historical Insight Summary */}
      <div className="bg-[var(--background)] border border-[var(--border)] rounded-2xl p-4">
        <h2 className="text-sm font-semibold text-[var(--foreground)] mb-4">This Season · AI Impact</h2>
        <div className="grid grid-cols-3 gap-3">
          {[
            { val: '14', unit: 'actions', label: 'AI suggestions\ntaken', color: 'var(--primary)' },
            { val: '$2,840', unit: 'saved', label: 'Estimated cost\nsavings', color: 'var(--accent)' },
            { val: '94%', unit: 'accuracy', label: 'Forecast\naccuracy', color: 'var(--sky)' },
          ].map(stat => (
            <div key={stat.label} className="bg-[var(--grey)] rounded-xl p-3 text-center">
              <p className="text-xl font-bold" style={{ color: stat.color }}>{stat.val}</p>
              <p className="text-xs text-[var(--muted-foreground)] mt-0.5 whitespace-pre-line leading-tight">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
