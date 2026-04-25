'use client'

import { Bell, CircleCheckBig } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const notifications = [
  {
    id: '1',
    title: 'New scene from @velvetvixen',
    text: 'Late Night Tease - Bedroom POV',
    time: '2h ago',
  },
  {
    id: '2',
    title: 'Your comment got a reply',
    text: 'Velvet Vixen replied on Midnight Hotel Roleplay',
    time: '6h ago',
  },
  {
    id: '3',
    title: 'Trending now',
    text: 'Couples Afterparty POV is climbing fast',
    time: '1d ago',
  },
]

export function NotificationsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100">
          <Bell className="h-5 w-5 text-sky-700" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-950">Notifications</h1>
          <p className="text-sm text-slate-600">Recent activity and updates</p>
        </div>
      </div>

      <div className="space-y-3">
        {notifications.map((item) => (
          <Card key={item.id} className="border-slate-200 bg-white text-slate-950 shadow-sm">
            <CardContent className="pt-5 flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-slate-950">{item.title}</p>
                <p className="mt-1 text-sm text-slate-600">{item.text}</p>
                <p className="mt-2 text-xs text-slate-500">{item.time}</p>
              </div>
              <Button variant="ghost" size="icon" title="Mark as read" className="text-slate-600 hover:bg-slate-100 hover:text-slate-950">
                <CircleCheckBig className="h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
