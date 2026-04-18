'use client'

import { useState, useCallback, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { CloudUpload, X, ImageIcon, FileVideo, CheckCircle2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import type { Category } from '@/types'
import { useNavigation } from '@/store/navigation'

type UploadStage = 'idle' | 'uploading' | 'form' | 'done'

export function UploadPage() {
  const { navigate } = useNavigation()
  const [stage, setStage] = useState<UploadStage>('idle')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [privacy, setPrivacy] = useState('public')
  const [category, setCategory] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data } = useQuery<{ categories: Category[] }>({
    queryKey: ['categories'],
    queryFn: () => fetch('/api/categories').then((r) => r.json()),
  })

  const categories = data?.categories ?? []

  const simulateUpload = useCallback(() => {
    setStage('uploading')
    setUploadProgress(0)
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => setStage('form'), 300)
          return 100
        }
        return prev + Math.random() * 15 + 5
      })
    }, 200)
  }, [])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files.length > 0 && files[0].type.startsWith('video/')) {
      simulateUpload()
    } else {
      toast.error('Please drop a scene file')
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      simulateUpload()
    }
  }

  const addTag = () => {
    const tag = tagInput.trim()
    if (tag && !tags.includes(tag) && tags.length < 10) {
      setTags([...tags, tag])
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  const handleSubmit = () => {
    if (!title.trim()) {
      toast.error('Please enter a title')
      return
    }
    setStage('done')
    toast.success('Scene uploaded successfully!')
  }

  const handleReset = () => {
    setStage('idle')
    setTitle('')
    setDescription('')
    setTags([])
    setTagInput('')
    setPrivacy('public')
    setCategory('')
    setUploadProgress(0)
  }

  if (stage === 'done') {
    return (
      <div className="max-w-xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="h-20 w-20 rounded-full bg-green-500/20 flex items-center justify-center mb-6">
            <CheckCircle2 className="h-10 w-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Upload Complete!</h2>
          <p className="text-muted-foreground mb-8">
            Your scene &quot;{title}&quot; has been uploaded and is being processed.
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={handleReset}>
              Upload Another
            </Button>
            <Button onClick={() => navigate({ type: 'home' })}>
              Go Home
            </Button>
          </div>
        </motion.div>
      </div>
    )
  }

  if (stage === 'uploading') {
    return (
      <div className="max-w-xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center mb-6">
            <FileVideo className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold mb-4">Uploading your scene...</h2>
          <div className="w-full max-w-md">
            <Progress value={Math.min(uploadProgress, 100)} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2">
              {Math.min(Math.round(uploadProgress), 100)}% uploaded
            </p>
          </div>
        </motion.div>
      </div>
    )
  }

  if (stage === 'form') {
    return (
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold mb-6">Scene Details</h1>
          <Card>
            <CardContent className="pt-6 space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Enter your scene title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={100}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {title.length}/100
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Tell viewers about your scene"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  maxLength={5000}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground text-right">
                  {description.length}/5000
                </p>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a tag"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    maxLength={30}
                  />
                  <Button type="button" variant="secondary" onClick={addTag}>
                    Add
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1 px-2.5 py-1">
                        {tag}
                        <button onClick={() => removeTag(tag)} className="ml-0.5">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Up to 10 tags. Press Enter or click Add.
                </p>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.slug}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Privacy */}
              <div className="space-y-3">
                <Label>Privacy</Label>
                <RadioGroup value={privacy} onValueChange={setPrivacy}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="public" id="public" />
                    <Label htmlFor="public" className="font-normal">
                      Public - Anyone can see this scene
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="unlisted" id="unlisted" />
                    <Label htmlFor="unlisted" className="font-normal">
                      Unlisted - Only people with the link can see
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="private" id="private" />
                    <Label htmlFor="private" className="font-normal">
                      Private - Only you can see this scene
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Thumbnail Preview */}
              <div className="space-y-2">
                <Label>Thumbnail</Label>
                <div className="flex gap-4">
                  <div className="w-40 aspect-video rounded-lg bg-secondary border border-dashed border-border flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <Button variant="secondary" size="sm" className="self-end">
                    Change Thumbnail
                  </Button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="ghost" onClick={handleReset}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>Publish</Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  // Idle stage - drag & drop area
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Upload Scene</h1>
      <div
        className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer ${
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-muted-foreground/50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={handleFileSelect}
        />
        <motion.div
          animate={isDragging ? { scale: 1.05 } : { scale: 1 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col items-center"
        >
          <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center mb-4">
            <CloudUpload className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-1">
            Drag and drop scene files to upload
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Your scenes will be private until you publish them.
          </p>
          <Button variant="secondary">SELECT FILES</Button>
        </motion.div>
      </div>
    </div>
  )
}
