import ProfilePanel from '@/components/ProfilePanel'
import USMap from '@/components/USMap'

export default function ExploreSection({ era, occupationId, dualIncome, onOccupationChange, onDualIncomeChange }) {
  if (!era) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-base text-muted-foreground">
          Start with selecting era on the left.
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-full">
      {/* Left half — profile selector */}
      <div className="flex-1 min-w-0 h-full">
        <ProfilePanel
          era={era}
          occupationId={occupationId}
          dualIncome={dualIncome}
          onOccupationChange={onOccupationChange}
          onDualIncomeChange={onDualIncomeChange}
        />
      </div>

      {/* Right half — US map */}
      <div className="flex-1 min-w-0 h-full">
        <USMap
          era={era}
          occupationId={occupationId}
          dualIncome={dualIncome}
        />
      </div>
    </div>
  )
}
