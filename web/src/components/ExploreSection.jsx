import ProfilePanel from '@/components/ProfilePanel'

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
          occupationId={occupationId}
          dualIncome={dualIncome}
          onOccupationChange={onOccupationChange}
          onDualIncomeChange={onDualIncomeChange}
        />
      </div>

      {/* Right half — map placeholder */}
      <div className="flex-1 min-w-0 h-full bg-accent flex items-center justify-center overflow-hidden">
        <p className="text-sm text-muted-foreground text-center">
          Here should be a map in a next iteration.
        </p>
      </div>
    </div>
  )
}
