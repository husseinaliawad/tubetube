'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Bell,
  Check,
  ChevronDown,
  CircleUserRound,
  LogIn,
  LogOut,
  Play,
  Search,
  Settings,
  ShieldCheck,
  Users,
  Video,
} from 'lucide-react'
import { useNavigation } from '@/store/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

const audienceOptions = [
  { key: 'straight', label: 'Straight', query: 'straight', icon: Users },
  { key: 'trans', label: 'Trans', query: 'trans', icon: ShieldCheck },
  { key: 'gay', label: 'Gay', query: 'gay', icon: Users },
] as const

export function TopBar() {
  const { currentPage, navigate } = useNavigation()
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [loginOpen, setLoginOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = searchQuery.trim()
    if (!trimmed) return
    navigate({ type: 'search', query: trimmed })
  }

  const activeVersion =
    currentPage.type === 'search'
      ? audienceOptions.find((option) =>
          currentPage.query.trim().toLowerCase().includes(option.query)
        )?.key ?? null
      : null

  const activeAudience = audienceOptions.find((option) => option.key === activeVersion)
  const AudienceIcon = activeAudience?.icon ?? Users

  const meQuery = useQuery<{ authenticated: boolean; admin?: { email: string } }>({
    queryKey: ['admin-auth-me'],
    queryFn: async () => {
      const res = await fetch('/api/admin/auth/me')
      if (res.status === 401) return { authenticated: false }
      if (!res.ok) throw new Error('Failed to check session')
      return res.json()
    },
    staleTime: 1000 * 60,
  })

  const loginMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(body.error || 'Failed to sign in')
      return body
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-auth-me'] })
      setLoginOpen(false)
      setPassword('')
      toast.success('Signed in')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to sign in')
    },
  })

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/admin/auth/logout', { method: 'POST' })
      if (!res.ok) throw new Error('Failed to sign out')
    },
    onSuccess: () => {
      queryClient.setQueryData(['admin-auth-me'], { authenticated: false })
      toast.success('Signed out')
      navigate({ type: 'home' })
    },
    onError: () => toast.error('Failed to sign out'),
  })

  const isAuthenticated = Boolean(meQuery.data?.authenticated)

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-zinc-950/95 px-3 py-2.5 shadow-[0_8px_24px_rgba(15,23,42,0.16)] backdrop-blur md:px-5">
        <div className="mx-auto flex max-w-[1600px] items-center gap-3 md:gap-5">
          <button
            onClick={() => navigate({ type: 'home' })}
            className="shrink-0 rounded-lg px-1 py-1 text-left text-white transition hover:bg-white/[0.06] md:px-2"
          >
            <span className="flex items-center gap-2">
              <Play className="h-5 w-5 fill-red-500 text-red-500" />
              <span className="text-lg font-bold md:text-xl">
                <span className="text-red-500">xnaik</span> Tube
              </span>
            </span>
          </button>

          <form onSubmit={handleSearch} className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search videos, tags, categories..."
              className="w-full rounded border border-white/15 bg-white/[0.08] py-3 pl-11 pr-4 text-sm text-white placeholder:text-zinc-400 focus:border-sky-400 focus:bg-white/[0.11] focus:outline-none md:text-base"
            />
          </form>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="hidden min-w-[132px] items-center justify-between gap-2 rounded border border-white/15 bg-white/[0.08] px-3 py-2.5 text-sm font-semibold text-zinc-100 transition hover:bg-white/[0.12] lg:flex">
                <span className="flex items-center gap-2">
                  <AudienceIcon className="h-4 w-4 text-sky-400" />
                  {activeAudience?.label ?? 'Audience'}
                </span>
                <ChevronDown className="h-4 w-4 text-zinc-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 border-slate-200 bg-white text-slate-950 shadow-lg">
              <DropdownMenuLabel className="text-slate-500">Filter audience</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {audienceOptions.map((option) => {
                const Icon = option.icon
                const active = activeVersion === option.key
                return (
                  <DropdownMenuItem
                    key={option.key}
                    onClick={() => navigate({ type: 'search', query: option.query })}
                    className="cursor-pointer focus:bg-slate-100 focus:text-slate-950"
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    <span className="flex-1">{option.label}</span>
                    {active ? <Check className="h-4 w-4 text-sky-700" /> : null}
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center gap-1 text-zinc-200 md:gap-2">
            <button
              onClick={() => navigate({ type: 'upload' })}
              title="Upload"
              className="rounded-lg p-2 transition hover:bg-white/[0.08] hover:text-white"
            >
              <Video className="h-5 w-5" />
            </button>
            <button
              onClick={() => navigate({ type: 'notifications' })}
              title="Notifications"
              className="rounded-lg p-2 transition hover:bg-white/[0.08] hover:text-white"
            >
              <Bell className="h-5 w-5" />
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  title="Account"
                  className="flex items-center gap-1 rounded-lg p-2 transition hover:bg-white/[0.08] hover:text-white"
                >
                  <CircleUserRound className="h-6 w-6" />
                  <ChevronDown className="hidden h-3.5 w-3.5 sm:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60 border-slate-200 bg-white text-slate-950 shadow-lg">
                <DropdownMenuLabel className="text-slate-500">
                  {isAuthenticated ? (
                    <span className="block truncate">{meQuery.data?.admin?.email}</span>
                  ) : (
                    'Account'
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {isAuthenticated ? (
                  <>
                    <DropdownMenuItem onClick={() => navigate({ type: 'dashboard' })} className="cursor-pointer focus:bg-slate-100 focus:text-slate-950">
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate({ type: 'settings' })} className="cursor-pointer focus:bg-slate-100 focus:text-slate-950">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => logoutMutation.mutate()}
                      disabled={logoutMutation.isPending}
                      className="cursor-pointer text-red-700 focus:bg-red-50 focus:text-red-700"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      {logoutMutation.isPending ? 'Signing out...' : 'Sign out'}
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem onClick={() => setLoginOpen(true)} className="cursor-pointer focus:bg-slate-100 focus:text-slate-950">
                      <LogIn className="mr-2 h-4 w-4" />
                      Sign in
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate({ type: 'settings' })} className="cursor-pointer focus:bg-slate-100 focus:text-slate-950">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
        <DialogContent className="border-slate-200 bg-white text-slate-950 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-slate-950">Sign in</DialogTitle>
            <DialogDescription className="text-slate-600">
              Use your admin credentials to manage videos, users, and comments.
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault()
              loginMutation.mutate()
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="admin-email">Email</Label>
              <Input
                id="admin-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                placeholder="admin@example.com"
                className="border-slate-300 bg-white text-slate-950"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-password">Password</Label>
              <Input
                id="admin-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                placeholder="Password"
                className="border-slate-300 bg-white text-slate-950"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setLoginOpen(false)}
                disabled={loginMutation.isPending}
                className="text-slate-700 hover:bg-slate-100 hover:text-slate-950"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!email.trim() || !password || loginMutation.isPending}
                className="bg-sky-600 text-white hover:bg-sky-700"
              >
                {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
