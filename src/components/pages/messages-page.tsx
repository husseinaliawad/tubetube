'use client'

import { useQuery } from '@tanstack/react-query'
import { MessageSquare } from 'lucide-react'
import { useNavigation } from '@/store/navigation'
import { formatDate } from '@/lib/format'

type MessageItem = {
  id: string
  content: string
  createdAt: string
  user: {
    handle: string
    name: string | null
    avatar: string | null
  }
  video: {
    id: string
    title: string
  }
}

export function MessagesPage() {
  const { navigate } = useNavigation()
  const { data, isLoading } = useQuery<{ messages: MessageItem[] }>({
    queryKey: ['messages-feed'],
    queryFn: () => fetch('/api/messages').then((r) => r.json()),
    staleTime: 1000 * 30,
  })

  const messages = data?.messages ?? []

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100">
          <MessageSquare className="h-5 w-5 text-sky-700" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-950">Messages</h1>
          <p className="text-sm text-slate-600">Recent conversation feed from backend comments</p>
        </div>
      </div>

      {isLoading ? (
        <p className="text-slate-600">Loading messages...</p>
      ) : messages.length === 0 ? (
        <p className="text-slate-600">No messages yet.</p>
      ) : (
        <div className="space-y-3">
          {messages.map((message) => (
            <button
              key={message.id}
              onClick={() => navigate({ type: 'watch', videoId: message.video.id })}
              className="w-full rounded border border-slate-200 bg-white p-4 text-left shadow-sm transition-colors hover:bg-slate-50"
            >
              <p className="text-sm text-slate-950">{message.content}</p>
              <p className="mt-1 text-xs text-slate-600">
                {(message.user.name || message.user.handle)} on {message.video.title}
              </p>
              <p className="mt-2 text-xs text-slate-500">{formatDate(message.createdAt)}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
