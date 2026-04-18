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
        <div className="h-10 w-10 rounded-full bg-primary/15 flex items-center justify-center">
          <Bell className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Notifications</h1>
          <p className="text-sm text-muted-foreground">Recent activity and updates</p>
        </div>
      </div>

      <div className="space-y-3">
        {notifications.map((item) => (
          <Card key={item.id}>
            <CardContent className="pt-5 flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-foreground">{item.title}</p>
                <p className="text-sm text-muted-foreground mt-1">{item.text}</p>
                <p className="text-xs text-muted-foreground mt-2">{item.time}</p>
              </div>
              <Button variant="ghost" size="icon" title="Mark as read">
                <CircleCheckBig className="h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
