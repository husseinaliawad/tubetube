'use client'

import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { useNavigation } from '@/store/navigation'
import { formatDate, formatViews } from '@/lib/format'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import {
  Activity,
  Eye,
  Film,
  LogOut,
  MessageSquare,
  RefreshCcw,
  Shield,
  TrendingUp,
  Users,
  FolderPlus,
  Clapperboard,
  Tag,
} from 'lucide-react'
import { toast } from 'sonner'

type AdminOverviewResponse = {
  stats: {
    totalVideos: number
    publishedVideos: number
    draftVideos: number
    totalUsers: number
    totalComments: number
    totalCategories: number
    totalViews: number
  }
  recentVideos: Array<{
    id: string
    title: string
    views: number
    isPublished: boolean
    privacy: string
    createdAt: string
    uploader: { name: string | null; handle: string }
    category: { name: string } | null
  }>
  recentComments: Array<{
    id: string
    content: string
    createdAt: string
    user: { name: string | null; handle: string }
    video: { id: string; title: string }
  }>
  topCategories: Array<{
    id: string
    name: string
    slug: string
    videos: number
  }>
  topCreators: Array<{
    id: string
    name: string | null
    handle: string
    subscribers: number
    videos: number
    totalViews: number
  }>
}

type AdminVideosResponse = {
  videos: Array<{
    id: string
    title: string
    views: number
    isPublished: boolean
    privacy: string
    createdAt: string
    uploader: { name: string | null; handle: string }
    category: { name: string } | null
    _count: { comments: number }
  }>
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

type AdminUsersResponse = {
  users: Array<{
    id: string
    email: string
    name: string | null
    handle: string
    subscribers: number
    createdAt: string
    totalViews: number
    _count: {
      videos: number
      comments: number
    }
  }>
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

type AdminCommentsResponse = {
  comments: Array<{
    id: string
    content: string
    createdAt: string
    user: { id: string; name: string | null; handle: string }
    video: { id: string; title: string }
    _count: { replies: number }
  }>
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

type AdminAnalyticsResponse = {
  days: number
  points: Array<{
    date: string
    label: string
    uploads: number
    comments: number
    views: number
  }>
}

type AdminMetaResponse = {
  categories: Array<{
    id: string
    name: string
    slug: string
  }>
  creators: Array<{
    id: string
    name: string | null
    handle: string
  }>
}

type AdminCategoriesResponse = {
  categories: Array<{
    id: string
    name: string
    slug: string
    _count: { videos: number }
  }>
}

type VideoAction = 'publish' | 'unpublish' | 'makePublic' | 'makePrivate' | 'makeUnlisted'
type UserAction = 'suspendContent' | 'restoreContent'
type StatusFilter = 'all' | 'published' | 'draft' | 'public' | 'private' | 'unlisted'

const chartConfig = {
  uploads: { label: 'Uploads', color: 'var(--color-chart-1)' },
  comments: { label: 'Comments', color: 'var(--color-chart-2)' },
} as const

function statusBadge(video: { isPublished: boolean; privacy: string }) {
  if (!video.isPublished) return <Badge variant="secondary">Draft</Badge>
  if (video.privacy === 'public') return <Badge>Published</Badge>
  if (video.privacy === 'private') return <Badge variant="outline">Private</Badge>
  return <Badge variant="secondary">Unlisted</Badge>
}

export function DashboardPage() {
  const { navigate } = useNavigation()
  const queryClient = useQueryClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [videoPage, setVideoPage] = useState(1)
  const [videoSearch, setVideoSearch] = useState('')
  const [status, setStatus] = useState<StatusFilter>('all')

  const [userPage, setUserPage] = useState(1)
  const [userSearch, setUserSearch] = useState('')

  const [commentPage, setCommentPage] = useState(1)
  const [commentSearch, setCommentSearch] = useState('')

  const [newSceneTitle, setNewSceneTitle] = useState('')
  const [newSceneDescription, setNewSceneDescription] = useState('')
  const [newSceneThumbnailUrl, setNewSceneThumbnailUrl] = useState('')
  const [newSceneVideoUrl, setNewSceneVideoUrl] = useState('')
  const [newSceneDuration, setNewSceneDuration] = useState('600')
  const [newSceneTags, setNewSceneTags] = useState('')
  const [newScenePrivacy, setNewScenePrivacy] = useState<'public' | 'private' | 'unlisted'>('public')
  const [newScenePublished, setNewScenePublished] = useState(true)
  const [newSceneUploaderId, setNewSceneUploaderId] = useState('')
  const [newSceneCategoryId, setNewSceneCategoryId] = useState('')

  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategorySlug, setNewCategorySlug] = useState('')
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [editingCategoryName, setEditingCategoryName] = useState('')
  const [editingCategorySlug, setEditingCategorySlug] = useState('')

  const meQuery = useQuery<{ authenticated: boolean; admin?: { email: string } }>({
    queryKey: ['admin-auth-me'],
    queryFn: async () => {
      const res = await fetch('/api/admin/auth/me')
      if (!res.ok) throw new Error('Unauthorized')
      return res.json()
    },
    retry: false,
  })

  const isAuthenticated = Boolean(meQuery.data?.authenticated)

  const videoQueryString = useMemo(() => {
    const params = new URLSearchParams()
    params.set('page', String(videoPage))
    params.set('limit', '10')
    params.set('status', status)
    if (videoSearch.trim()) params.set('q', videoSearch.trim())
    return params.toString()
  }, [videoPage, videoSearch, status])

  const userQueryString = useMemo(() => {
    const params = new URLSearchParams()
    params.set('page', String(userPage))
    params.set('limit', '10')
    if (userSearch.trim()) params.set('q', userSearch.trim())
    return params.toString()
  }, [userPage, userSearch])

  const commentQueryString = useMemo(() => {
    const params = new URLSearchParams()
    params.set('page', String(commentPage))
    params.set('limit', '15')
    if (commentSearch.trim()) params.set('q', commentSearch.trim())
    return params.toString()
  }, [commentPage, commentSearch])

  const overviewQuery = useQuery<AdminOverviewResponse>({
    queryKey: ['admin-overview'],
    queryFn: async () => {
      const res = await fetch('/api/admin/overview')
      if (res.status === 401) throw new Error('Unauthorized')
      if (!res.ok) throw new Error('Failed to load overview')
      return res.json()
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 30,
  })

  const analyticsQuery = useQuery<AdminAnalyticsResponse>({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      const res = await fetch('/api/admin/analytics?days=14')
      if (res.status === 401) throw new Error('Unauthorized')
      if (!res.ok) throw new Error('Failed to load analytics')
      return res.json()
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 30,
  })

  const videosQuery = useQuery<AdminVideosResponse>({
    queryKey: ['admin-videos', videoPage, status, videoSearch],
    queryFn: async () => {
      const res = await fetch(`/api/admin/videos?${videoQueryString}`)
      if (res.status === 401) throw new Error('Unauthorized')
      if (!res.ok) throw new Error('Failed to load videos')
      return res.json()
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 15,
  })

  const usersQuery = useQuery<AdminUsersResponse>({
    queryKey: ['admin-users', userPage, userSearch],
    queryFn: async () => {
      const res = await fetch(`/api/admin/users?${userQueryString}`)
      if (res.status === 401) throw new Error('Unauthorized')
      if (!res.ok) throw new Error('Failed to load users')
      return res.json()
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 30,
  })

  const commentsQuery = useQuery<AdminCommentsResponse>({
    queryKey: ['admin-comments', commentPage, commentSearch],
    queryFn: async () => {
      const res = await fetch(`/api/admin/comments?${commentQueryString}`)
      if (res.status === 401) throw new Error('Unauthorized')
      if (!res.ok) throw new Error('Failed to load comments')
      return res.json()
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 15,
  })

  const metaQuery = useQuery<AdminMetaResponse>({
    queryKey: ['admin-meta'],
    queryFn: async () => {
      const res = await fetch('/api/admin/meta')
      if (res.status === 401) throw new Error('Unauthorized')
      if (!res.ok) throw new Error('Failed to load admin meta')
      return res.json()
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60,
  })

  const categoriesQuery = useQuery<AdminCategoriesResponse>({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const res = await fetch('/api/admin/categories')
      if (res.status === 401) throw new Error('Unauthorized')
      if (!res.ok) throw new Error('Failed to load categories')
      return res.json()
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 30,
  })

  const loginMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Login failed' }))
        throw new Error(data.error || 'Login failed')
      }
      return res.json()
    },
    onSuccess: () => {
      toast.success('Logged in successfully')
      setPassword('')
      queryClient.invalidateQueries({ queryKey: ['admin-auth-me'] })
      queryClient.invalidateQueries({ queryKey: ['admin-overview'] })
      queryClient.invalidateQueries({ queryKey: ['admin-analytics'] })
      queryClient.invalidateQueries({ queryKey: ['admin-videos'] })
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      queryClient.invalidateQueries({ queryKey: ['admin-comments'] })
      queryClient.invalidateQueries({ queryKey: ['admin-meta'] })
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/admin/auth/logout', { method: 'POST' })
      if (!res.ok) throw new Error('Failed to logout')
      return res.json()
    },
    onSuccess: () => {
      toast.success('Logged out')
      queryClient.setQueryData(['admin-auth-me'], { authenticated: false })
      queryClient.removeQueries({ queryKey: ['admin-overview'] })
      queryClient.removeQueries({ queryKey: ['admin-analytics'] })
      queryClient.removeQueries({ queryKey: ['admin-videos'] })
      queryClient.removeQueries({ queryKey: ['admin-users'] })
      queryClient.removeQueries({ queryKey: ['admin-comments'] })
      queryClient.removeQueries({ queryKey: ['admin-meta'] })
      queryClient.removeQueries({ queryKey: ['admin-categories'] })
    },
    onError: () => toast.error('Failed to logout'),
  })

  const updateVideoMutation = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: VideoAction }) => {
      const res = await fetch(`/api/admin/videos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      if (!res.ok) throw new Error('Failed to update scene')
      return res.json()
    },
    onSuccess: () => {
      toast.success('Scene updated')
      queryClient.invalidateQueries({ queryKey: ['admin-videos'] })
      queryClient.invalidateQueries({ queryKey: ['admin-overview'] })
      queryClient.invalidateQueries({ queryKey: ['admin-analytics'] })
    },
    onError: () => toast.error('Failed to update scene'),
  })

  const deleteVideoMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/videos/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete scene')
      return res.json()
    },
    onSuccess: () => {
      toast.success('Scene deleted')
      queryClient.invalidateQueries({ queryKey: ['admin-videos'] })
      queryClient.invalidateQueries({ queryKey: ['admin-overview'] })
      queryClient.invalidateQueries({ queryKey: ['admin-analytics'] })
    },
    onError: () => toast.error('Failed to delete scene'),
  })

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: UserAction }) => {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      if (!res.ok) throw new Error('Failed to update user content')
      return res.json()
    },
    onSuccess: () => {
      toast.success('User content status updated')
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      queryClient.invalidateQueries({ queryKey: ['admin-videos'] })
      queryClient.invalidateQueries({ queryKey: ['admin-overview'] })
      queryClient.invalidateQueries({ queryKey: ['admin-analytics'] })
    },
    onError: () => toast.error('Failed to update user content'),
  })

  const deleteCommentMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/comments/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete comment')
      return res.json()
    },
    onSuccess: () => {
      toast.success('Comment deleted')
      queryClient.invalidateQueries({ queryKey: ['admin-comments'] })
      queryClient.invalidateQueries({ queryKey: ['admin-overview'] })
      queryClient.invalidateQueries({ queryKey: ['admin-analytics'] })
    },
    onError: () => toast.error('Failed to delete comment'),
  })

  const createVideoMutation = useMutation({
    mutationFn: async () => {
      if (!newSceneTitle.trim()) throw new Error('Title is required')
      if (!newSceneThumbnailUrl.trim()) throw new Error('Thumbnail URL is required')
      if (!newSceneVideoUrl.trim()) throw new Error('Video URL is required')
      if (!newSceneUploaderId) throw new Error('Please select a creator')

      const tags = newSceneTags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean)

      const res = await fetch('/api/admin/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newSceneTitle,
          description: newSceneDescription,
          thumbnailUrl: newSceneThumbnailUrl,
          videoUrl: newSceneVideoUrl,
          duration: Number(newSceneDuration) || 0,
          uploaderId: newSceneUploaderId,
          categoryId: newSceneCategoryId || null,
          privacy: newScenePrivacy,
          isPublished: newScenePublished,
          tags,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to create scene')
      return data
    },
    onSuccess: () => {
      toast.success('Scene created')
      setNewSceneTitle('')
      setNewSceneDescription('')
      setNewSceneThumbnailUrl('')
      setNewSceneVideoUrl('')
      setNewSceneDuration('600')
      setNewSceneTags('')
      setNewScenePrivacy('public')
      setNewScenePublished(true)
      setNewSceneCategoryId('')
      queryClient.invalidateQueries({ queryKey: ['admin-videos'] })
      queryClient.invalidateQueries({ queryKey: ['admin-overview'] })
      queryClient.invalidateQueries({ queryKey: ['admin-analytics'] })
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const createCategoryMutation = useMutation({
    mutationFn: async () => {
      if (!newCategoryName.trim()) throw new Error('Category name is required')
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCategoryName,
          slug: newCategorySlug,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to create category')
      return data
    },
    onSuccess: () => {
      toast.success('Category created')
      setNewCategoryName('')
      setNewCategorySlug('')
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
      queryClient.invalidateQueries({ queryKey: ['admin-meta'] })
      queryClient.invalidateQueries({ queryKey: ['admin-overview'] })
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const updateCategoryMutation = useMutation({
    mutationFn: async ({
      id,
      name,
      slug,
    }: {
      id: string
      name: string
      slug: string
    }) => {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, slug }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to update category')
      return data
    },
    onSuccess: () => {
      toast.success('Category updated')
      setEditingCategoryId(null)
      setEditingCategoryName('')
      setEditingCategorySlug('')
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
      queryClient.invalidateQueries({ queryKey: ['admin-meta'] })
      queryClient.invalidateQueries({ queryKey: ['admin-overview'] })
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to delete category')
      return data
    },
    onSuccess: () => {
      toast.success('Category deleted')
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
      queryClient.invalidateQueries({ queryKey: ['admin-meta'] })
      queryClient.invalidateQueries({ queryKey: ['admin-overview'] })
    },
    onError: (error: Error) => toast.error(error.message),
  })

  if (meQuery.isLoading) {
    return (
      <div className="max-w-md mx-auto py-16">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Checking admin session...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-10 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Admin Login
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Email</p>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@velvettube.local"
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Password</p>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
              />
            </div>
            <Button
              className="w-full"
              disabled={!email.trim() || !password || loginMutation.isPending}
              onClick={() => loginMutation.mutate()}
            >
              {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const stats = overviewQuery.data?.stats
  const managedVideos = videosQuery.data?.videos ?? []
  const videoPagination = videosQuery.data?.pagination
  const users = usersQuery.data?.users ?? []
  const userPagination = usersQuery.data?.pagination
  const comments = commentsQuery.data?.comments ?? []
  const commentPagination = commentsQuery.data?.pagination
  const studioCategories = categoriesQuery.data?.categories ?? []
  const studioCreators = metaQuery.data?.creators ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Admin Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Full control panel for analytics, creators, scenes, and moderation.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['admin-overview'] })
              queryClient.invalidateQueries({ queryKey: ['admin-analytics'] })
              queryClient.invalidateQueries({ queryKey: ['admin-videos'] })
              queryClient.invalidateQueries({ queryKey: ['admin-users'] })
              queryClient.invalidateQueries({ queryKey: ['admin-comments'] })
              queryClient.invalidateQueries({ queryKey: ['admin-meta'] })
              queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
            }}
          >
            <RefreshCcw className="h-4 w-4 mr-1.5" />
            Refresh
          </Button>
          <Button onClick={() => navigate({ type: 'upload' })}>Upload Scene</Button>
          <Button variant="ghost" onClick={() => logoutMutation.mutate()}>
            <LogOut className="h-4 w-4 mr-1.5" />
            Logout
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Scenes" value={stats?.totalVideos ?? 0} icon={<Film className="h-4 w-4 text-primary" />} />
        <StatCard title="Published" value={stats?.publishedVideos ?? 0} icon={<Activity className="h-4 w-4 text-emerald-500" />} />
        <StatCard title="Creators" value={stats?.totalUsers ?? 0} icon={<Users className="h-4 w-4 text-blue-500" />} />
        <StatCard title="Total Views" value={formatViews(stats?.totalViews ?? 0)} icon={<Eye className="h-4 w-4 text-amber-500" />} />
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="studio">Studio</TabsTrigger>
          <TabsTrigger value="videos">Videos</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="comments">Comments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Last 14 Days Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[320px] w-full">
                <LineChart data={analyticsQuery.data?.points ?? []}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="uploads" stroke="var(--color-uploads)" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="comments" stroke="var(--color-comments)" strokeWidth={2} dot={false} />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {(overviewQuery.data?.topCategories ?? []).map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{cat.name}</p>
                      <p className="text-xs text-muted-foreground">/{cat.slug}</p>
                    </div>
                    <Badge variant="secondary">{cat.videos} scenes</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Creators</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {(overviewQuery.data?.topCreators ?? []).map((creator) => (
                  <div key={creator.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{creator.name || creator.handle}</p>
                      <p className="text-xs text-muted-foreground">@{creator.handle}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatViews(creator.totalViews)}</p>
                      <p className="text-xs text-muted-foreground">{creator.videos} scenes</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="studio" className="space-y-4">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clapperboard className="h-5 w-5 text-primary" />
                  Create New Scene
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  placeholder="Scene title"
                  value={newSceneTitle}
                  onChange={(e) => setNewSceneTitle(e.target.value)}
                />
                <Textarea
                  placeholder="Scene description"
                  value={newSceneDescription}
                  onChange={(e) => setNewSceneDescription(e.target.value)}
                  rows={3}
                />
                <Input
                  placeholder="Thumbnail URL"
                  value={newSceneThumbnailUrl}
                  onChange={(e) => setNewSceneThumbnailUrl(e.target.value)}
                />
                <Input
                  placeholder="Video URL"
                  value={newSceneVideoUrl}
                  onChange={(e) => setNewSceneVideoUrl(e.target.value)}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Input
                    type="number"
                    min={0}
                    placeholder="Duration (seconds)"
                    value={newSceneDuration}
                    onChange={(e) => setNewSceneDuration(e.target.value)}
                  />
                  <Input
                    placeholder="Tags (comma separated)"
                    value={newSceneTags}
                    onChange={(e) => setNewSceneTags(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Select value={newSceneUploaderId} onValueChange={setNewSceneUploaderId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select creator" />
                    </SelectTrigger>
                    <SelectContent>
                      {studioCreators.map((creator) => (
                        <SelectItem key={creator.id} value={creator.id}>
                          {(creator.name || creator.handle) + ` (@${creator.handle})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={newSceneCategoryId} onValueChange={setNewSceneCategoryId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {studioCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Select
                    value={newScenePrivacy}
                    onValueChange={(value) =>
                      setNewScenePrivacy(value as 'public' | 'private' | 'unlisted')
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Privacy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="unlisted">Unlisted</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={newScenePublished ? 'published' : 'draft'}
                    onValueChange={(value) => setNewScenePublished(value === 'published')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Publish status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  className="w-full"
                  onClick={() => createVideoMutation.mutate()}
                  disabled={createVideoMutation.isPending}
                >
                  {createVideoMutation.isPending ? 'Creating...' : 'Create Scene'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderPlus className="h-5 w-5 text-primary" />
                  Categories Manager
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <Input
                    placeholder="Category name"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                  />
                  <Input
                    placeholder="Slug (optional)"
                    value={newCategorySlug}
                    onChange={(e) => setNewCategorySlug(e.target.value)}
                  />
                  <Button
                    onClick={() => createCategoryMutation.mutate()}
                    disabled={createCategoryMutation.isPending}
                  >
                    <Tag className="h-4 w-4 mr-1.5" />
                    Add
                  </Button>
                </div>

                <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                  {studioCategories.map((category) => {
                    const isEditing = editingCategoryId === category.id
                    return (
                      <div
                        key={category.id}
                        className="border border-border rounded-md p-2 space-y-2"
                      >
                        {isEditing ? (
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <Input
                              value={editingCategoryName}
                              onChange={(e) => setEditingCategoryName(e.target.value)}
                              placeholder="Name"
                            />
                            <Input
                              value={editingCategorySlug}
                              onChange={(e) => setEditingCategorySlug(e.target.value)}
                              placeholder="Slug"
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() =>
                                  updateCategoryMutation.mutate({
                                    id: category.id,
                                    name: editingCategoryName,
                                    slug: editingCategorySlug,
                                  })
                                }
                                disabled={updateCategoryMutation.isPending}
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => {
                                  setEditingCategoryId(null)
                                  setEditingCategoryName('')
                                  setEditingCategorySlug('')
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <p className="font-medium text-sm">{category.name}</p>
                              <p className="text-xs text-muted-foreground">
                                /{category.slug} • {category._count.videos} scenes
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => {
                                  setEditingCategoryId(category.id)
                                  setEditingCategoryName(category.name)
                                  setEditingCategorySlug(category.slug)
                                }}
                              >
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  if (
                                    window.confirm(
                                      `Delete category "${category.name}"? It must be empty first.`
                                    )
                                  ) {
                                    deleteCategoryMutation.mutate(category.id)
                                  }
                                }}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="videos" className="space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Input
                  placeholder="Search by title or creator..."
                  value={videoSearch}
                  onChange={(e) => {
                    setVideoPage(1)
                    setVideoSearch(e.target.value)
                  }}
                  className="max-w-sm"
                />
                <Select
                  value={status}
                  onValueChange={(value) => {
                    setVideoPage(1)
                    setStatus(value as StatusFilter)
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="unlisted">Unlisted</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Scene</TableHead>
                    <TableHead>Creator</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Comments</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {managedVideos.map((video) => (
                    <TableRow key={video.id}>
                      <TableCell className="max-w-[360px]">
                        <p className="font-medium truncate">{video.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {video.category?.name || 'Uncategorized'} • {formatDate(video.createdAt)}
                        </p>
                      </TableCell>
                      <TableCell>@{video.uploader.handle}</TableCell>
                      <TableCell>{formatViews(video.views)}</TableCell>
                      <TableCell>{statusBadge(video)}</TableCell>
                      <TableCell>{video._count.comments}</TableCell>
                      <TableCell>
                        <div className="flex gap-1.5">
                          <Button size="sm" variant="secondary" onClick={() => navigate({ type: 'watch', videoId: video.id })}>
                            Watch
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => updateVideoMutation.mutate({ id: video.id, action: video.isPublished ? 'unpublish' : 'publish' })}
                          >
                            {video.isPublished ? 'Unpublish' : 'Publish'}
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => updateVideoMutation.mutate({ id: video.id, action: video.privacy === 'public' ? 'makePrivate' : 'makePublic' })}
                          >
                            {video.privacy === 'public' ? 'Make Private' : 'Make Public'}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              if (window.confirm('Delete this scene permanently?')) {
                                deleteVideoMutation.mutate(video.id)
                              }
                            }}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <PaginationFooter
                page={videoPagination?.page}
                totalPages={videoPagination?.totalPages}
                total={videoPagination?.total}
                label="scenes"
                hasPrev={videoPagination?.hasPrevPage}
                hasNext={videoPagination?.hasNextPage}
                onPrev={() => setVideoPage((p) => Math.max(1, p - 1))}
                onNext={() => setVideoPage((p) => p + 1)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <Input
                placeholder="Search by name, handle, or email..."
                value={userSearch}
                onChange={(e) => {
                  setUserPage(1)
                  setUserSearch(e.target.value)
                }}
                className="max-w-sm"
              />

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Creator</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Subscribers</TableHead>
                    <TableHead>Scenes</TableHead>
                    <TableHead>Total Views</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <p className="font-medium">{user.name || user.handle}</p>
                        <p className="text-xs text-muted-foreground">@{user.handle}</p>
                      </TableCell>
                      <TableCell className="max-w-[220px] truncate">{user.email}</TableCell>
                      <TableCell>{user.subscribers.toLocaleString()}</TableCell>
                      <TableCell>{user._count.videos}</TableCell>
                      <TableCell>{formatViews(user.totalViews)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1.5">
                          <Button size="sm" variant="secondary" onClick={() => navigate({ type: 'channel', handle: user.handle })}>
                            Profile
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => updateUserMutation.mutate({ id: user.id, action: 'suspendContent' })}
                          >
                            Suspend Content
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => updateUserMutation.mutate({ id: user.id, action: 'restoreContent' })}
                          >
                            Restore Content
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <PaginationFooter
                page={userPagination?.page}
                totalPages={userPagination?.totalPages}
                total={userPagination?.total}
                label="users"
                hasPrev={userPagination?.hasPrevPage}
                hasNext={userPagination?.hasNextPage}
                onPrev={() => setUserPage((p) => Math.max(1, p - 1))}
                onNext={() => setUserPage((p) => p + 1)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comments" className="space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <Input
                placeholder="Search comments, creator, or scene..."
                value={commentSearch}
                onChange={(e) => {
                  setCommentPage(1)
                  setCommentSearch(e.target.value)
                }}
                className="max-w-sm"
              />

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Comment</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Scene</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comments.map((comment) => (
                    <TableRow key={comment.id}>
                      <TableCell className="max-w-[440px]">
                        <p className="truncate">{comment.content}</p>
                        {comment._count.replies > 0 ? (
                          <p className="text-xs text-muted-foreground">{comment._count.replies} replies</p>
                        ) : null}
                      </TableCell>
                      <TableCell>@{comment.user.handle}</TableCell>
                      <TableCell className="max-w-[260px] truncate">{comment.video.title}</TableCell>
                      <TableCell>{formatDate(comment.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1.5">
                          <Button size="sm" variant="secondary" onClick={() => navigate({ type: 'watch', videoId: comment.video.id })}>
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              if (window.confirm('Delete this comment and all replies?')) {
                                deleteCommentMutation.mutate(comment.id)
                              }
                            }}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <PaginationFooter
                page={commentPagination?.page}
                totalPages={commentPagination?.totalPages}
                total={commentPagination?.total}
                label="comments"
                hasPrev={commentPagination?.hasPrevPage}
                hasNext={commentPagination?.hasNextPage}
                onPrev={() => setCommentPage((p) => Math.max(1, p - 1))}
                onNext={() => setCommentPage((p) => p + 1)}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Latest Moderation Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(overviewQuery.data?.recentComments ?? []).map((comment) => (
            <div key={comment.id} className="p-3 rounded-lg border border-border">
              <p className="text-sm text-foreground">{comment.content}</p>
              <p className="text-xs text-muted-foreground mt-1">
                @{comment.user.handle} on{' '}
                <button
                  className="text-primary hover:underline"
                  onClick={() => navigate({ type: 'watch', videoId: comment.video.id })}
                >
                  {comment.video.title}
                </button>{' '}
                • {formatDate(comment.createdAt)}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string
  value: string | number
  icon: React.ReactNode
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{title}</p>
          {icon}
        </div>
        <p className="text-2xl font-bold mt-2">{value}</p>
      </CardContent>
    </Card>
  )
}

function PaginationFooter({
  page,
  totalPages,
  total,
  label,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
}: {
  page?: number
  totalPages?: number
  total?: number
  label: string
  hasPrev?: boolean
  hasNext?: boolean
  onPrev: () => void
  onNext: () => void
}) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-muted-foreground">
        {page && totalPages && typeof total === 'number'
          ? `Page ${page} of ${totalPages} • ${total} ${label}`
          : 'Loading...'}
      </p>
      <div className="flex gap-2">
        <Button size="sm" variant="secondary" disabled={!hasPrev} onClick={onPrev}>
          Previous
        </Button>
        <Button size="sm" variant="secondary" disabled={!hasNext} onClick={onNext}>
          Next
        </Button>
      </div>
    </div>
  )
}
