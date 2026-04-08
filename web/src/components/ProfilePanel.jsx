import { useEffect, useRef } from 'react'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import occupations from '@/data/occupations.json'
import profilePlaceholder from '@/assets/profile-placeholder.png'

// Scale geometry — container spans exactly tick min→max
const TICK_MIN = 10
const TICK_MAX = 105
const TICK_RANGE = TICK_MAX - TICK_MIN
const SCALE_W = 228 // total px width

const TICK_OVERRIDES = { dentist: 100 }

function tickX(pos) {
  return ((pos - TICK_MIN) / TICK_RANGE) * SCALE_W
}

function roundToTick(id, pos) {
  return TICK_OVERRIDES[id] ?? Math.round(pos / 5) * 5
}

function avatarLeft(id, incomePosition) {
  return tickX(roundToTick(id, incomePosition)) - 12
}

function tickLeft(pos) {
  return tickX(pos) - 1
}

export default function ProfilePanel({ occupationId, dualIncome, onOccupationChange, onDualIncomeChange }) {
  const carouselRef = useRef(null)
  const currentIndex = occupations.findIndex((o) => o.id === occupationId)
  const current = occupations[currentIndex]
  const scrollLocked = useRef(false)
  const unlockTimer = useRef(null)
  const currentIndexRef = useRef(currentIndex)
  currentIndexRef.current = currentIndex

  useEffect(() => {
    const el = carouselRef.current
    if (!el) return

    function handleWheel(e) {
      e.preventDefault()

      // Reset the quiet-period timer on every event — lock releases only
      // after 20ms of no wheel events (i.e. gesture fully ended)
      clearTimeout(unlockTimer.current)
      unlockTimer.current = setTimeout(() => {
        scrollLocked.current = false
      }, 20)

      if (scrollLocked.current) return
      scrollLocked.current = true

      const dir = e.deltaY > 0 ? 1 : -1
      const next = (currentIndexRef.current + dir + occupations.length) % occupations.length
      onOccupationChange(occupations[next].id)
    }

    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => {
      el.removeEventListener('wheel', handleWheel)
      clearTimeout(unlockTimer.current)
    }
  }, [onOccupationChange])

  return (
    <div className="flex flex-col items-center justify-between h-full pb-4 pt-1.5 px-8 min-w-0">
      {/* Switch — top */}
      <div className="pt-12 w-full flex items-center justify-center">
        <div className="flex items-center gap-2">
          <label
            htmlFor="dual-income"
            className="text-sm font-medium text-foreground cursor-pointer select-none"
          >
            Working spouse
          </label>
          <Switch
            id="dual-income"
            checked={dualIncome}
            onCheckedChange={onDualIncomeChange}
          />
        </div>
      </div>

      {/* Profile carousel — center */}
      <div
        ref={carouselRef}
        className="flex flex-col gap-8 items-center w-full cursor-ns-resize select-none"
      >
        {/* Profile image */}
        <div className="w-full max-w-[256px] aspect-square">
          <img
            src={profilePlaceholder}
            alt={current.label}
            className="w-full h-full object-cover"
            draggable={false}
          />
        </div>

        {/* Name + descriptor */}
        <div className="flex flex-col gap-3 items-center max-w-[320px] w-full text-center">
          <p className="text-2xl font-medium text-foreground w-full">
            {current.label}
          </p>
          <p className="text-sm text-muted-foreground w-full">
            Here should be a descriptor placeholder to explain the result of
            selection in a nutshell. Will be done in a later iteration.
          </p>
        </div>
      </div>

      {/* Income scale — bottom */}
      <div className="flex flex-col gap-2 items-center" style={{ width: SCALE_W }}>
        {/* Avatar row */}
        <div className="relative w-full" style={{ height: 24 }}>
          {occupations.map((occ) => (
            <button
              key={occ.id}
              onClick={() => onOccupationChange(occ.id)}
              className={cn(
                'absolute top-0 w-6 h-6 rounded-full overflow-hidden cursor-pointer',
                occ.id !== occupationId && 'opacity-30'
              )}
              style={{ left: avatarLeft(occ.id, occ.income_position) }}
              title={occ.label}
            >
              <img
                src={profilePlaceholder}
                alt={occ.label}
                className="w-full h-full object-cover"
                draggable={false}
              />
            </button>
          ))}
        </div>

        {/* Tick marks */}
        <div className="relative w-full" style={{ height: 14 }}>
          {Array.from({ length: 20 }, (_, i) => (i + 2) * 5).map((pos) => {
            const isSelected = pos === roundToTick(occupations[currentIndex].id, occupations[currentIndex].income_position)
            return (
              <div
                key={pos}
                className={cn(
                  'absolute bottom-0 w-0.5',
                  isSelected ? 'bg-destructive' : 'bg-muted-foreground/40'
                )}
                style={{ left: tickLeft(pos), height: isSelected ? 14 : 6 }}
              />
            )
          })}
        </div>

        {/* Label */}
        <p className="text-xs text-muted-foreground text-center w-full pt-1">
          Income position
        </p>
      </div>
    </div>
  )
}
