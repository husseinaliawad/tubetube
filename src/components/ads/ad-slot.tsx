'use client'

import { cn } from '@/lib/utils'

interface AdSlotProps {
  title?: string
  className?: string
}

export function AdSlot({ title = 'Sponsored Placement', className }: AdSlotProps) {
  return (
    <aside
      className={cn(
        'relative overflow-hidden rounded border border-slate-200 bg-white px-4 py-4 shadow-sm',
        className
      )}
    >
      <span className="absolute right-3 top-2 rounded bg-red-600/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
        Ad
      </span>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{title}</p>
      <p className="mt-1 text-sm font-medium text-slate-700">
        Featured sponsor placement with high visibility across the feed.
      </p>
      <button className="mt-3 rounded border border-sky-600 bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-sky-700">
        Learn More
      </button>
    </aside>
  )
}
