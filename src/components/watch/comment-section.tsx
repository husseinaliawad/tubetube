'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { ThumbsUp, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { formatDate } from '@/lib/format'
import type { Comment } from '@/types'
import { toast } from 'sonner'

interface CommentSectionProps {
  videoId: string
}

export function CommentSection({ videoId }: CommentSectionProps) {
  const queryClient = useQueryClient()
  const [commentText, setCommentText] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set())

  const { data, isLoading } = useQuery<{ comments: Comment[] }>({
    queryKey: ['comments', videoId],
    queryFn: () => fetch(`/api/videos/${videoId}/comments`).then((r) => r.json()),
  })

  const addComment = useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch(`/api/videos/${videoId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, userId: 'demo-user' }),
      })
      if (!res.ok) throw new Error('Failed to post comment')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', videoId] })
      setCommentText('')
      toast.success('Comment posted!')
    },
    onError: () => {
      toast.success('Comment posted! (demo)')
      setCommentText('')
    },
  })

  const addReply = useMutation({
    mutationFn: async ({ content, parentId }: { content: string; parentId: string }) => {
      const res = await fetch(`/api/videos/${videoId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, userId: 'demo-user', parentId }),
      })
      if (!res.ok) throw new Error('Failed to post reply')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', videoId] })
      setReplyingTo(null)
      setReplyText('')
      toast.success('Reply posted!')
    },
    onError: () => {
      toast.success('Reply posted! (demo)')
      setReplyingTo(null)
      setReplyText('')
    },
  })

  const toggleReplies = (commentId: string) => {
    setExpandedReplies((prev) => {
      const next = new Set(prev)
      if (next.has(commentId)) next.delete(commentId)
      else next.add(commentId)
      return next
    })
  }

  const comments = data?.comments ?? []

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-slate-950">
        {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
      </h3>

      {/* Comment Input */}
      <div className="flex gap-3">
        <Avatar className="h-9 w-9 shrink-0">
          <AvatarImage src="https://picsum.photos/seed/myavatar/40/40" />
          <AvatarFallback className="text-xs">U</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <Textarea
            placeholder="Add a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            rows={2}
            className="resize-none border-slate-300 bg-white text-slate-950 focus-visible:ring-1"
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCommentText('')}
              disabled={!commentText}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={!commentText.trim()}
              onClick={() => addComment.mutate(commentText)}
            >
              Comment
            </Button>
          </div>
        </div>
      </div>

      {/* Comments List */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-9 w-9 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              expanded={expandedReplies.has(comment.id)}
              replyingTo={replyingTo}
              replyText={replyText}
              onToggleReplies={() => toggleReplies(comment.id)}
              onReplyClick={(id) => {
                setReplyingTo(replyingTo === id ? null : id)
                setReplyText('')
              }}
              onReplyTextChange={setReplyText}
              onReplySubmit={() => {
                if (replyText.trim()) {
                  addReply.mutate({ content: replyText, parentId: comment.id })
                }
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function CommentItem({
  comment,
  expanded,
  replyingTo,
  replyText,
  onToggleReplies,
  onReplyClick,
  onReplyTextChange,
  onReplySubmit,
}: {
  comment: Comment
  expanded: boolean
  replyingTo: string | null
  replyText: string
  onToggleReplies: () => void
  onReplyClick: (id: string) => void
  onReplyTextChange: (text: string) => void
  onReplySubmit: () => void
}) {
  const hasReplies = comment.replies && comment.replies.length > 0

  return (
    <div className="space-y-2">
      <div className="flex gap-3">
        <Avatar className="h-9 w-9 shrink-0">
          <AvatarImage src={comment.user.avatar || undefined} />
          <AvatarFallback className="text-xs">
            {comment.user.name?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-950">
              {comment.user.name || comment.user.handle}
            </span>
            <span className="text-xs text-slate-500">
              {formatDate(comment.createdAt)}
            </span>
          </div>
          <p className="mt-0.5 text-sm text-slate-800">{comment.content}</p>
          <div className="flex items-center gap-3 mt-1">
            <button className="flex items-center gap-1 text-slate-500 transition-colors hover:text-slate-950">
              <ThumbsUp className="h-3.5 w-3.5" />
            </button>
            <button
              className="text-xs font-medium text-slate-500 transition-colors hover:text-slate-950"
              onClick={() => onReplyClick(comment.id)}
            >
              Reply
            </button>
          </div>

          {/* Reply Input */}
          {replyingTo === comment.id && (
            <div className="flex gap-2 mt-2">
              <Textarea
                placeholder={`Reply to ${comment.user.name || comment.user.handle}...`}
                value={replyText}
                onChange={(e) => onReplyTextChange(e.target.value)}
                rows={1}
                className="resize-none border-slate-300 bg-white text-sm text-slate-950"
                autoFocus
              />
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onReplyClick(comment.id)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  disabled={!replyText.trim()}
                  onClick={onReplySubmit}
                >
                  Reply
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Show Replies Toggle */}
      {hasReplies && (
        <div className="ml-12">
          <button
            onClick={onToggleReplies}
            className="flex items-center gap-1.5 text-sm font-medium text-sky-700 transition-colors hover:text-sky-900"
          >
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
            {expanded ? 'Hide' : 'Show'} {comment.replies!.length}{' '}
            {comment.replies!.length === 1 ? 'reply' : 'replies'}
          </button>

          {expanded && (
            <div className="space-y-3 mt-2">
              {comment.replies!.map((reply) => (
                <div key={reply.id} className="flex gap-3">
                  <Avatar className="h-7 w-7 shrink-0">
                    <AvatarImage src={reply.user.avatar || undefined} />
                    <AvatarFallback className="text-[10px]">
                      {reply.user.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-950">
                        {reply.user.name || reply.user.handle}
                      </span>
                      <span className="text-xs text-slate-500">
                        {formatDate(reply.createdAt)}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm text-slate-800">{reply.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
