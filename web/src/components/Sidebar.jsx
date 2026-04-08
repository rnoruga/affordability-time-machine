import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const ERAS = ['1960s', '1980s', '2000s', '2020s']

export default function Sidebar({ section, era, onSectionChange, onEraChange }) {
  return (
    <aside className="w-[120px] shrink-0 flex flex-col justify-between p-4 h-screen">
      {/* Top nav */}
      <div className="flex flex-col items-start w-full">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onSectionChange('about')}
        >
          About
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onSectionChange('explore')}
        >
          Explore
        </Button>
      </div>

      {/* Era button group — visible only in Explore */}
      <div className={cn('flex flex-col w-full', section !== 'explore' && 'invisible')}>
        {ERAS.map((e, i) => (
          <button
            key={e}
            onClick={() => onEraChange(e)}
            className={cn(
              'w-full h-8 flex items-center justify-center text-sm font-medium border border-border px-2.5',
              i === 0 && 'rounded-t-[10px]',
              i === ERAS.length - 1 ? 'rounded-b-[10px]' : 'border-b-0',
              era === e ? 'bg-muted text-accent-foreground' : 'bg-background text-foreground'
            )}
          >
            {e}
          </button>
        ))}
      </div>

      {/* Invisible spacer — mirrors nav height for visual balance */}
      <div className="flex flex-col w-full opacity-0 pointer-events-none" aria-hidden>
        <div className="h-8 w-full" />
        <div className="h-8 w-full" />
      </div>
    </aside>
  )
}
