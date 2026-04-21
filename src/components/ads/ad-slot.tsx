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
        'relative overflow-hidden rounded-xl border border-zinc-300 bg-gradient-to-r from-zinc-100 to-white px-4 py-3',
        className
      )}
    >
      <span className="absolute right-3 top-2 rounded bg-zinc-900 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
        Ad
      </span>
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{title}</p>
      <p className="mt-1 text-sm font-medium text-zinc-800">
        Your promotional banner can appear in this section.
      </p>
    </aside>
  )
}

