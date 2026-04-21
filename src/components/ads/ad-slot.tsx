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
        'relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-r from-[#12151d] via-[#181c27] to-[#11131a] px-4 py-4',
        className
      )}
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-red-600/20 blur-2xl" />
      <span className="absolute right-3 top-2 rounded bg-red-600/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
        Ad
      </span>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">{title}</p>
      <p className="mt-1 text-sm font-medium text-zinc-100">
        Featured sponsor placement with high visibility across the feed.
      </p>
      <button className="mt-3 rounded-lg border border-red-500/50 bg-red-600/15 px-3 py-1.5 text-xs font-semibold text-red-300 transition hover:bg-red-600/30">
        Learn More
      </button>
    </aside>
  )
}
