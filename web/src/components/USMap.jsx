import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { cn } from '@/lib/utils'
import cities from '@/data/cities_geo.json'
import results from '@/data/results.json'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN

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

function fmt$(n) {
  return n >= 1_000_000
    ? `$${(n / 1_000_000).toFixed(2)}M`
    : `$${(n / 1_000).toFixed(0)}K`
}

function buildGeoJSON(year, occupationId, householdId, homeKey) {
  return {
    type: 'FeatureCollection',
    features: cities.map(city => {
      const entry   = year ? results.find(r => r.city === city.name && r.year === year) : null
      const profile = entry?.profiles.find(
        p => p.occupation_id === occupationId && p.household_id === householdId
      )
      const status  = profile?.[homeKey]?.affordability_status ?? null

      return {
        type: 'Feature',
        properties: {
          name:            city.name,
          status,
          color:           STATUS_COLORS[status] ?? '#94a3b8',
          effective_income: profile?.effective_income ?? null,
          mortgage_rate:   entry?.market?.mortgage_rate ?? null,
          price_to_income: profile?.[homeKey]?.price_to_income ?? null,
          burden_pct:      profile?.[homeKey]?.burden_pct ?? null,
          home_price:      homeKey === 'starter_home'
            ? entry?.market?.starter_home_price ?? null
            : entry?.market?.median_home_price ?? null,
          confidence:      entry?.market?.confidence ?? null,
        },
        geometry: { type: 'Point', coordinates: [city.lng, city.lat] },
      }
    }),
  }
}

export default function USMap({ era, occupationId, dualIncome }) {
  const containerRef  = useRef(null)
  const mapRef        = useRef(null)
  const [homeType, setHomeType] = useState('starter')
  const [tooltip, setTooltip]  = useState(null)
  const tooltipRef    = useRef(null)

  const homeKey     = homeType === 'starter' ? 'starter_home' : 'median_home'
  const year        = ERA_TO_YEAR[era] ?? null
  const householdId = dualIncome ? 'dual' : 'single'

  // ── Init map once ──────────────────────────────────────────────────────────
  useEffect(() => {
    const map = new mapboxgl.Map({
      container:        containerRef.current,
      style:            'mapbox://styles/mapbox/light-v11',
      center:           [-98.5795, 39.8283],
      zoom:             3.5,
      dragPan:          false,
      dragRotate:       false,
      scrollZoom:       false,
      boxZoom:          false,
      doubleClickZoom:  false,
      touchZoomRotate:  false,
      keyboard:         false,
      attributionControl: false,
    })

    mapRef.current = map

    map.on('load', () => {
      // Hide non-US country/place labels
      map.getStyle().layers.forEach(layer => {
        if (
          (layer.type === 'symbol' && layer['source-layer'] === 'place_label') ||
          (layer.type === 'symbol' && layer['source-layer'] === 'country_label')
        ) {
          map.setFilter(layer.id, ['==', ['get', 'iso_3166_1'], 'US'])
        }
      })

      const geojson = buildGeoJSON(year, occupationId, householdId, homeKey)

      // City dots
      map.addSource('cities', { type: 'geojson', data: geojson })

      map.addLayer({
        id:     'city-dots',
        type:   'circle',
        source: 'cities',
        paint: {
          'circle-radius':       8,
          'circle-color':        ['get', 'color'],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        },
      })

      // City name labels
      map.addLayer({
        id:     'city-labels',
        type:   'symbol',
        source: 'cities',
        layout: {
          'text-field':  ['get', 'name'],
          'text-size':   12,
          'text-offset': [0, 1.5],
          'text-anchor': 'top',
          'text-font':   ['DIN Pro Regular', 'Arial Unicode MS Regular'],
        },
        paint: {
          'text-color':      '#1c1917',
          'text-halo-color': '#ffffff',
          'text-halo-width': 1,
        },
      })

      // Tooltip on hover
      map.on('mouseenter', 'city-dots', e => {
        map.getCanvas().style.cursor = 'pointer'
        const props  = e.features[0].properties
        const rect   = containerRef.current.getBoundingClientRect()
        const mouseX = e.originalEvent.clientX - rect.left
        const mouseY = e.originalEvent.clientY - rect.top
        setTooltip({
          props,
          mouseX,
          mouseY,
          flipX: mouseX > rect.width  - 256,
          flipY: mouseY > rect.height - 240,
        })
      })

      map.on('mousemove', 'city-dots', e => {
        const props  = e.features[0].properties
        const rect   = containerRef.current.getBoundingClientRect()
        const mouseX = e.originalEvent.clientX - rect.left
        const mouseY = e.originalEvent.clientY - rect.top
        setTooltip({
          props,
          mouseX,
          mouseY,
          flipX: mouseX > rect.width  - 256,
          flipY: mouseY > rect.height - 240,
        })
      })

      map.on('mouseleave', 'city-dots', () => {
        map.getCanvas().style.cursor = ''
        setTooltip(null)
      })
    })

    return () => map.remove()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Update dot colors on prop/homeType change ─────────────────────────────
  useEffect(() => {
    const map = mapRef.current
    if (!map || !map.isStyleLoaded() || !map.getSource('cities')) return
    const geojson = buildGeoJSON(year, occupationId, householdId, homeKey)
    map.getSource('cities').setData(geojson)
  }, [year, occupationId, householdId, homeKey])

  return (
    <div className="relative w-full h-full overflow-hidden">

      {/* Mapbox container */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Home type tabs */}
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

      {/* Tooltip */}
      {tooltip && (
        <div
          ref={tooltipRef}
          className="absolute z-20 w-56 bg-background border border-border rounded-lg shadow-lg p-3 pointer-events-none text-sm"
          style={{
            left: tooltip.flipX ? tooltip.mouseX - 244 : tooltip.mouseX + 12,
            top:  tooltip.flipY ? tooltip.mouseY - 228 : tooltip.mouseY + 12,
          }}
        >
          <TooltipContent props={tooltip.props} homeType={homeType} />
        </div>
      )}
    </div>
  )
}

function TooltipContent({ props, homeType }) {
  const status = props.status
  const color  = STATUS_COLORS[status] ?? null

  return (
    <>
      <p className="font-semibold text-foreground mb-2.5">{props.name}</p>
      {props.home_price ? (
        <div className="flex flex-col gap-1">
          <Row label={homeType === 'starter' ? 'Starter home' : 'Median home'} value={fmt$(props.home_price)} />
          {props.effective_income && <Row label="Annual income" value={fmt$(props.effective_income)} />}
          {props.mortgage_rate    && <Row label="Mortgage rate" value={`${props.mortgage_rate}%`} />}
          {props.price_to_income  && <Row label="Price / income" value={`${props.price_to_income}×`} />}
          {status && (
            <>
              <div className="my-1 border-t border-border" />
              {props.burden_pct && <Row label="Burden" value={`${props.burden_pct}%`} />}
              <div className="flex justify-between items-center gap-2">
                <span className="text-muted-foreground shrink-0">Status</span>
                <span className="font-medium capitalize text-right" style={{ color: color ?? 'inherit' }}>
                  {status}
                </span>
              </div>
            </>
          )}
          {props.confidence && (
            <>
              <div className="my-1 border-t border-border" />
              <Row label="Confidence" value={props.confidence} valueClass="capitalize text-muted-foreground" />
            </>
          )}
        </div>
      ) : (
        <p className="text-muted-foreground text-xs">No data for this selection.</p>
      )}
    </>
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
