type TaxonomyCategory = {
  id: string
  slug: string
  name: string
}

type TagInput = string | null | undefined

const TAG_ALIASES: Record<string, string> = {
  'point-of-view': 'pov',
  povs: 'pov',
  'real-couple': 'couples',
  couple: 'couples',
  milfes: 'milf',
  homemade: 'amateur',
  'home-made': 'amateur',
}

const STOP_WORDS = new Set([
  'the',
  'and',
  'for',
  'with',
  'from',
  'this',
  'that',
  'video',
  'scene',
  'full',
  'best',
  'new',
  'hot',
  'free',
  'watch',
  'official',
])

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  amateur: ['amateur', 'real', 'verified', 'homemade', 'raw'],
  pov: ['pov', 'point-of-view', 'first-person'],
  milf: ['milf', 'mature'],
  couples: ['couples', 'couple', 'romance', 'romantic', 'chemistry'],
  bdsm: ['bdsm', 'kink', 'dominant', 'submissive', 'latex', 'bondage'],
  lesbian: ['lesbian', 'duo', 'sapphic'],
  latina: ['latina', 'latin'],
  roleplay: ['roleplay', 'fantasy', 'story', 'character', 'cosplay'],
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .replace(/[_/]+/g, ' ')
    .replace(/[^a-z0-9#\-\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function canonicalizeTag(rawTag: TagInput): string | null {
  if (!rawTag) return null

  let value = rawTag.trim().toLowerCase()
  if (!value) return null

  value = value.replace(/^#+/, '')
  value = value.replace(/[_\s]+/g, '-')
  value = value.replace(/[^a-z0-9-]/g, '')
  value = value.replace(/-+/g, '-')
  value = value.replace(/^-|-$/g, '')

  if (!value || value.length < 2 || value.length > 32) return null
  if (STOP_WORDS.has(value)) return null

  return TAG_ALIASES[value] ?? value
}

function collectTextTokens(title?: string | null, description?: string | null) {
  const text = normalizeText(`${title || ''} ${description || ''}`)
  if (!text) return []

  return text
    .split(' ')
    .map((part) => part.trim())
    .filter((part) => part.length >= 2 && !STOP_WORDS.has(part))
}

export function buildPreciseTags(input: {
  title?: string | null
  description?: string | null
  tags?: string[]
  max?: number
}) {
  const max = Math.min(30, Math.max(1, input.max ?? 20))
  const uniq = new Set<string>()

  for (const raw of input.tags ?? []) {
    const normalized = canonicalizeTag(raw)
    if (normalized) uniq.add(normalized)
  }

  const textTokens = collectTextTokens(input.title, input.description)
  for (const token of textTokens) {
    const normalized = canonicalizeTag(token)
    if (normalized) uniq.add(normalized)
    if (uniq.size >= max) break
  }

  return Array.from(uniq).slice(0, max)
}

export function inferCategoryFromVideo(input: {
  title?: string | null
  description?: string | null
  tags?: string[]
  categories: TaxonomyCategory[]
}) {
  const normalizedTags = new Set((input.tags ?? []).map((tag) => canonicalizeTag(tag)).filter(Boolean) as string[])
  const tokens = collectTextTokens(input.title, input.description)
  const tokenSet = new Set(tokens)

  let winner: { slug: string; score: number } | null = null

  for (const category of input.categories) {
    const slug = category.slug.toLowerCase()
    const scoreKeywords = new Set<string>([
      slug,
      ...normalizeText(category.name).split(' ').filter(Boolean),
      ...(CATEGORY_KEYWORDS[slug] ?? []),
    ])

    let score = 0
    for (const keyword of scoreKeywords) {
      const tagKeyword = canonicalizeTag(keyword)
      if (tagKeyword && normalizedTags.has(tagKeyword)) score += 6
      if (tokenSet.has(keyword)) score += 2
    }

    if (!winner || score > winner.score) {
      winner = { slug, score }
    }
  }

  if (!winner || winner.score < 4) return null
  return winner.slug
}

export type SimilarityProfile = {
  categorySlug: string | null
  tagSet: Set<string>
  tokenSet: Set<string>
}

export function buildSimilarityProfile(input: {
  title?: string | null
  description?: string | null
  categorySlug?: string | null
  tags: Array<{ name: string }>
}) {
  const tagSet = new Set<string>()
  for (const tag of input.tags) {
    const normalized = canonicalizeTag(tag.name)
    if (normalized) tagSet.add(normalized)
  }

  const tokenSet = new Set<string>(collectTextTokens(input.title, input.description))
  const categorySlug = input.categorySlug?.toLowerCase() || null

  return { categorySlug, tagSet, tokenSet } satisfies SimilarityProfile
}

function overlapCount<T>(first: Set<T>, second: Set<T>) {
  let shared = 0
  for (const item of first) {
    if (second.has(item)) shared += 1
  }
  return shared
}

export function scoreRelatedVideo(input: {
  current: SimilarityProfile
  candidate: SimilarityProfile
  views: number
  createdAt: Date
  sameUploader: boolean
}) {
  let score = 0

  if (input.current.categorySlug && input.candidate.categorySlug === input.current.categorySlug) {
    score += 14
  }

  const sharedTags = overlapCount(input.current.tagSet, input.candidate.tagSet)
  score += Math.min(5, sharedTags) * 4

  const sharedTokens = overlapCount(input.current.tokenSet, input.candidate.tokenSet)
  score += Math.min(8, sharedTokens) * 1.5

  const popularity = Math.min(4, Math.log10(Math.max(10, input.views)))
  score += popularity

  const ageHours = Math.max(1, (Date.now() - input.createdAt.getTime()) / (1000 * 60 * 60))
  score += Math.max(0, 2 - ageHours / (24 * 14))

  if (input.sameUploader) {
    score += 1
  }

  if (
    sharedTags === 0 &&
    sharedTokens === 0 &&
    input.current.categorySlug &&
    input.candidate.categorySlug &&
    input.current.categorySlug !== input.candidate.categorySlug
  ) {
    score -= 4
  }

  return score
}
