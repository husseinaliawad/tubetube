'use client'

interface VideoStoryboardProps {
  thumbnailUrl: string
  duration: number
}

function formatTimestamp(totalSeconds: number) {
  const seconds = Math.max(0, Math.floor(totalSeconds))
  const minutes = Math.floor(seconds / 60)
  const rem = seconds % 60
  return `${minutes}:${String(rem).padStart(2, '0')}`
}

export function VideoStoryboard({ thumbnailUrl, duration }: VideoStoryboardProps) {
  const frameCount = 10
  const safeDuration = Math.max(1, duration)
  const step = safeDuration / frameCount

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-sm font-semibold text-slate-950">Storyboard</h2>
        <p className="text-xs text-slate-600">
          Quick timeline preview frames
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {Array.from({ length: frameCount }).map((_, index) => {
          const position = Math.round((index / Math.max(1, frameCount - 1)) * 100)
          const time = formatTimestamp(Math.floor(index * step))

          return (
            <div key={index} className="overflow-hidden rounded border border-slate-200 bg-white shadow-sm">
              <div className="relative aspect-video">
                <img
                  src={thumbnailUrl}
                  alt={`Storyboard frame ${index + 1}`}
                  className="h-full w-full object-cover"
                  style={{ objectPosition: `${position}% 50%` }}
                />
                <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1.5 py-0.5 text-[10px] text-white">
                  {time}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
