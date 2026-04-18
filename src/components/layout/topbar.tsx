'use client'

import { useState } from 'react'
import { useNavigation } from '@/store/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Menu,
  Search,
  Upload,
  Bell,
  User,
  Settings,
  Shield,
  LogOut,
  Film,
} from 'lucide-react'
import { toast } from 'sonner'

export function TopBar() {
  const { navigate, setSidebarOpen } = useNavigation()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = searchQuery.trim()
    if (trimmed) {
      navigate({ type: 'search', query: trimmed })
      setSearchQuery('')
    }
  }

  const handleSignOut = () => {
    toast.success('Signed out')
    navigate({ type: 'home' })
  }

  return (
    <header className="sticky top-0 z-40 flex items-center gap-3 h-14 px-4 bg-background/80 backdrop-blur-md border-b border-border shrink-0">
      {/* Left: Hamburger + Logo (mobile) */}
      <div className="flex items-center gap-2 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <button
          onClick={() => navigate({ type: 'home' })}
          className="flex items-center gap-2 lg:hidden"
        >
          <Film className="h-5 w-5 text-red-500" />
          <span className="font-bold text-sm text-foreground">VelvetTube</span>
        </button>
      </div>

      {/* Center: Search */}
      <form onSubmit={handleSearch} className="flex flex-1 max-w-xl mx-auto">
        <div className="flex w-full">
          <Input
            type="search"
            placeholder="Search scenes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-r-none border-r-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-primary bg-secondary border-border"
          />
          <Button
            type="submit"
            variant="secondary"
            className="rounded-l-none border border-input px-5"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </form>

      {/* Right: Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate({ type: 'upload' })}
          title="Upload"
        >
          <Upload className="h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          title="Notifications"
          onClick={() => navigate({ type: 'notifications' })}
        >
          <Bell className="h-5 w-5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-7 w-7">
                <AvatarImage src="https://picsum.photos/seed/myavatar/40/40" />
                <AvatarFallback className="text-xs">U</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => navigate({ type: 'channel', handle: 'velvetvixen' })}>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate({ type: 'dashboard' })}>
              <Shield className="mr-2 h-4 w-4" />
              Dashboard
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate({ type: 'upload' })}>
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate({ type: 'settings' })}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
