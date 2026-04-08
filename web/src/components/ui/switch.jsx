import { cn } from '@/lib/utils'

function Switch({ id, checked, onCheckedChange, className }) {
  return (
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange?.(!checked)}
      className={cn(
        'relative inline-flex h-5 w-8 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent',
        checked ? 'bg-primary' : 'bg-input',
        className
      )}
    >
      <span
        className={cn(
          'pointer-events-none block size-4 rounded-full bg-background shadow-sm',
          checked ? 'translate-x-3' : 'translate-x-0'
        )}
      />
    </button>
  )
}

export { Switch }
