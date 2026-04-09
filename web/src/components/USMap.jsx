import { useRef, useState, useMemo } from 'react'
import * as d3 from 'd3'
import { feature } from 'topojson-client'
import { cn } from '@/lib/utils'
import us from 'us-atlas/states-10m.json'
import cities from '@/data/cities_geo.json'
import results from '@/data/results.json'

const ERA_TO_YEAR = { '1960s': 1960, '1980s': 1980, '2000s': 2000, '2020s': 2020 }

const STATUS_COLORS = {
  comfortable:  '#65a30d',
  stretch:      '#f97316',
  unaffordable: '#ef4444',
}

const HOME_TYPES = [
  { id: 'starter', label: 'Starter home' },
  { id: 'median',  label: 'Median home'  },
]

const W = 960
const H = 560

const projection = d3.geoAlbersUsa().scale(1280).translate([W / 2, H / 2])
const pathGen    = d3.geoPath().projection(projection)
const statesGeo  = feature(us, us.objects.states)

function fmt$(n) {
  return n >= 1_000_000
    ? `$${(n / 1_000_000).toFixed(2)}M`
    : `$${(n / 1_000).toFixed(0)}K`
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function USMap({ era, occupationId, dualIncome }) {
  const containerRef = useRef(null)
  const [tooltip, setTooltip]   = useState(null)
  const [homeType, setHomeType] = useState('starter')

  const year        = ERA_TO_YEAR[era] ?? null
  const householdId = dualIncome ? 'dual' : 'single'
  const homeKey     = homeType === 'starter' ? 'starter_home' : 'median_home'

  const cityData = useMemo(() => {
    return cities.map(city => {
      const projected = projection([city.lng, city.lat])
      if (!projected) return null

      const entry   = year ? results.find(r => r.city === city.name && r.year === year) : null
      const profile = entry?.profiles.find(
        p => p.occupation_id === occupationId && p.household_id === householdId
      )

      return { ...city, px: projected[0], py: projected[1], entry, profile }
    }).filter(Boolean)
  }, [year, occupationId, householdId])

  function handleMouseEnter(e, city) {
    const rect   = containerRef.current.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    setTooltip({
      city,
      mouseX,
      mouseY,
      flipX: mouseX > rect.width  - 256,
      flipY: mouseY > rect.height - 240,
    })
  }

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden bg-[#f0f4f8]">

      {/* Tab bar — centered at top, mirrors Working Spouse position */}
      <div className="absolute top-0 left-0 right-0 pt-12 flex justify-center z-10 pointer-events-none">
        <div className="pointer-events-auto flex">
          {HOME_TYPES.map((ht, i) => (
            <button
              key={ht.id}
              onClick={() => setHomeType(ht.id)}
              className={cn(
                'h-8 px-3 text-sm font-medium border border-border',
                i === 0 ? 'rounded-l-[10px]' : 'rounded-r-[10px] border-l-0',
                homeType === ht.id
                  ? 'bg-muted text-accent-foreground'
                  : 'bg-background text-foreground'
              )}
            >
              {ht.label}
            </button>
          ))}
        </div>
      </div>

      {/* Map */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full"
      >
        {statesGeo.features.map(s => (
          <path
            key={s.id}
            d={pathGen(s)}
            fill="#dde3ec"
            stroke="#ffffff"
            strokeWidth={1}
          />
        ))}

        {cityData.map(city => {
          const status = city.profile?.[homeKey]?.affordability_status ?? null
          return (
            <circle
              key={city.name}
              cx={city.px}
              cy={city.py}
              r={7}
              fill={status ? STATUS_COLORS[status] : '#94a3b8'}
              stroke="#ffffff"
              strokeWidth={2}
              className="cursor-pointer"
              onMouseEnter={e => handleMouseEnter(e, city)}
              onMouseLeave={() => setTooltip(null)}
            />
          )
        })}
      </svg>

      {tooltip && (
        <Tooltip
          tooltip={tooltip}
          homeType={homeType}
        />
      )}
    </div>
  )
}

// ─── Tooltip ─────────────────────────────────────────────────────────────────

function Tooltip({ tooltip, homeType }) {
  const { city, mouseX, mouseY, flipX, flipY } = tooltip
  const { entry, profile } = city
  const market  = entry?.market
  const homeKey = homeType === 'starter' ? 'starter_home' : 'median_home'
  const home    = profile?.[homeKey]
  const status  = home?.affordability_status ?? null

  return (
    <div
      className="absolute z-20 w-56 bg-background border border-border rounded-lg shadow-lg p-3 pointer-events-none text-sm"
      style={{
        left: flipX ? mouseX - 244 : mouseX + 12,
        top:  flipY ? mouseY - 228 : mouseY + 12,
      }}
    >
      <p className="font-semibold text-foreground mb-2.5">{city.name}</p>

      {market ? (
        <div className="flex flex-col gap-1">
          {/* Home price — only the selected type */}
          {homeType === 'starter' && (
            <Row label="Starter home" value={fmt$(market.starter_home_price)} />
          )}
          {homeType === 'median' && (
            <Row label="Median home" value={fmt$(market.median_home_price)} />
          )}

          <Row label="Median income" value={fmt$(market.median_household_income)} />
          <Row label="Mortgage rate" value={`${market.mortgage_rate}%`} />
          <Row label="Price / income" value={`${market.price_to_income}×`} />

          {home && (
            <>
              <div className="my-1 border-t border-border" />
              <Row label="Burden" value={`${home.burden_pct}%`} />
              <div className="flex justify-between items-center gap-2">
                <span className="text-muted-foreground shrink-0">Status</span>
                <span
                  className="font-medium capitalize text-right"
                  style={{ color: STATUS_COLORS[status] ?? 'inherit' }}
                >
                  {status ?? '—'}
                </span>
              </div>
            </>
          )}

          <div className="my-1 border-t border-border" />
          <Row
            label="Confidence"
            value={market.confidence}
            valueClass="capitalize text-muted-foreground"
          />
        </div>
      ) : (
        <p className="text-muted-foreground text-xs">No data for this selection.</p>
      )}
    </div>
  )
}

function Row({ label, value, valueClass = 'text-foreground' }) {
  return (
    <div className="flex justify-between items-center gap-2">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className={`${valueClass} text-right`}>{value}</span>
    </div>
  )
}
