'use client'

import { useState } from 'react'
import { Settings } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function SettingsPage() {
  const [autoplay, setAutoplay] = useState(true)
  const [desktopNotifications, setDesktopNotifications] = useState(true)
  const [safeSearch, setSafeSearch] = useState(false)

  const handleSave = () => {
    toast.success('Settings saved')
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-primary/15 flex items-center justify-center">
          <Settings className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your player and account preferences</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Playback</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="autoplay">Autoplay</Label>
              <p className="text-sm text-muted-foreground">Play the next scene automatically.</p>
            </div>
            <Switch id="autoplay" checked={autoplay} onCheckedChange={setAutoplay} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="safe-search">Content Filter</Label>
              <p className="text-sm text-muted-foreground">Hide explicit scenes from search and feeds.</p>
            </div>
            <Switch id="safe-search" checked={safeSearch} onCheckedChange={setSafeSearch} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="desktop-notifications">Desktop Notifications</Label>
              <p className="text-sm text-muted-foreground">Get updates for new uploads and replies.</p>
            </div>
            <Switch
              id="desktop-notifications"
              checked={desktopNotifications}
              onCheckedChange={setDesktopNotifications}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave}>Save Changes</Button>
      </div>
    </div>
  )
}
