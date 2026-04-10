import { cn } from '@/lib/utils'

const ERAS = ['1960s', '1980s', '2000s', '2020s']

// Placeholder icon — replace with real SVG when ready
function IconPlaceholder() {
  return <span className="w-5 h-5 rounded-sm bg-stone-500 shrink-0" />
}

export default function Sidebar({ section, era, onSectionChange, onEraChange }) {
  return (
    <aside className="w-[86px] shrink-0 flex flex-col justify-between pt-12 pb-12 pr-4 h-screen bg-stone-800">
      {/* Top nav — fully rounded icon buttons */}
      <div className="flex flex-col items-start gap-1 w-full pl-5">
        {[
          { id: 'about',   label: 'About'   },
          { id: 'explore', label: 'Explore' },
        ].map(({ id, label }) => (
          <button
            key={id}
            onClick={() => onSectionChange(id)}
            className={cn(
              'flex items-center justify-center w-10 h-10 rounded-full',
              section === id
                ? 'bg-stone-600'
                : 'hover:bg-stone-700'
            )}
            title={label}
          >
            <IconPlaceholder />
          </button>
        ))}
      </div>

      {/* Era scale — tick marks from left edge, visible only in Explore */}
      <div className={cn('flex flex-col gap-3 w-full', section !== 'explore' && 'invisible')}>
        {ERAS.map((e) => (
          <button
            key={e}
            onClick={() => onEraChange(e)}
            className="relative flex items-center pl-6 group"
          >
            <div className={cn(
              'absolute left-0 h-px',
              era === e
                ? 'w-4 bg-red-500'
                : 'w-3 bg-stone-500 group-hover:bg-stone-400'
            )} />
            <span className={cn(
              'text-sm leading-normal',
              era === e
                ? 'text-stone-50'
                : 'text-stone-400 group-hover:text-stone-300'
            )}>
              {e}
            </span>
          </button>
        ))}
      </div>

      {/* Invisible spacer — mirrors nav height for balance */}
      <div className="flex flex-col gap-1 w-full pl-5 opacity-0 pointer-events-none" aria-hidden>
        <div className="h-10 w-10" />
        <div className="h-10 w-10" />
      </div>
    </aside>
  )
}
