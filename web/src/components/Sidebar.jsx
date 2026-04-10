import { cn } from '@/lib/utils'

const ERAS = ['1960s', '1980s', '2000s', '2020s']

// Placeholder icon — replace with real SVG when ready
function IconPlaceholder() {
  return <span className="w-5 h-5 rounded-sm bg-stone-500 shrink-0" />
}

export default function Sidebar({ section, era, onSectionChange, onEraChange }) {
  return (
    <aside className="w-[120px] shrink-0 flex flex-col justify-between pl-5 pt-12 pb-12 pr-4 h-screen bg-stone-800">
      {/* Top nav — fully rounded icon buttons */}
      <div className="flex flex-col items-start gap-1 w-full">
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

      {/* Era button group — visible only in Explore */}
      <div className={cn('flex flex-col w-full', section !== 'explore' && 'invisible')}>
        {ERAS.map((e, i) => (
          <button
            key={e}
            onClick={() => onEraChange(e)}
            className={cn(
              'w-full h-8 flex items-center justify-center text-sm font-medium border px-2.5',
              i === 0 && 'rounded-t-[10px]',
              i === ERAS.length - 1 ? 'rounded-b-[10px]' : 'border-b-0',
              era === e
                ? 'bg-stone-50 text-stone-900 border-stone-50'
                : 'bg-transparent text-stone-400 border-stone-600 hover:text-stone-50'
            )}
          >
            {e}
          </button>
        ))}
      </div>

      {/* Invisible spacer — mirrors nav height for balance */}
      <div className="flex flex-col gap-1 w-full opacity-0 pointer-events-none" aria-hidden>
        <div className="h-10 w-10" />
        <div className="h-10 w-10" />
      </div>
    </aside>
  )
}
