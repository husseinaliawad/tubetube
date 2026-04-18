export interface Video {
  id: string
  title: string
  description: string | null
  thumbnailUrl: string
  videoUrl: string
  duration: number
  views: number
  likes: number
  dislikes: number
  isPublished: boolean
  privacy: string
  isShort: boolean
  categoryId: string | null
  createdAt: string
  uploaderId: string
  category?: Category
  uploader: User
  tags: VideoTag[]
  _count?: { comments: number; likedBy: number; dislikedBy: number }
}

export interface User {
  id: string
  email?: string
  name: string | null
  avatar: string | null
  banner: string | null
  bio: string | null
  handle: string
  subscribers: number
  createdAt: string
}

export interface Comment {
  id: string
  content: string
  createdAt: string
  userId: string
  videoId: string
  parentId: string | null
  user: User
  replies?: Comment[]
}

export interface Category {
  id: string
  name: string
  slug: string
  _count?: { videos: number }
}

export interface VideoTag {
  id?: string
  name: string
  videoId?: string
}

export interface Playlist {
  id: string
  title: string
  description: string | null
  isPublic: boolean
  createdAt: string
  userId: string
  items: PlaylistItem[]
  _count?: { items: number }
}

export interface PlaylistItem {
  id: string
  position: number
  createdAt: string
  playlistId: string
  videoId: string
  video: {
    id: string
    title: string
    thumbnailUrl: string
    duration: number
    views: number
  }
}

export interface ChannelData {
  id: string
  name: string | null
  handle: string
  avatar: string | null
  banner: string | null
  bio: string | null
  subscribers: number
  createdAt: string
  videos: Video[]
  playlists: Playlist[]
  _count: { videos: number; playlists: number }
}
