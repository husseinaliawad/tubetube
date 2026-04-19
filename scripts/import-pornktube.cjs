/* eslint-disable no-console */
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const BASE_URL = 'https://pornktube.st'
const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'

const MAX_PAGES = Math.max(1, Number(process.argv[2] || 200))
const START_PAGE = Math.max(1, Number(process.argv[3] || 1))
const REQUEST_DELAY_MS = Math.max(0, Number(process.argv[4] || 120))

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function normalizeWhitespace(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
}

function toSeconds(duration) {
  if (!duration) return 0
  const parts = String(duration)
    .split(':')
    .map((v) => Number(v.trim()))
  if (parts.some((v) => Number.isNaN(v))) return 0
  if (parts.length === 2) return parts[0] * 60 + parts[1]
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
  return 0
}

function toInt(value) {
  const cleaned = String(value || '').replace(/[^\d]/g, '')
  return cleaned ? Number(cleaned) : 0
}

async function fetchHtml(url) {
  const response = await fetch(url, {
    headers: {
      'user-agent': USER_AGENT,
      referer: BASE_URL,
      accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
  })

  const text = await response.text()
  return {
    ok: response.ok,
    status: response.status,
    html: text,
  }
}

function parsePageItems(html) {
  const pattern =
    /<a\s+href="(https:\/\/pornktube\.st\/view\/(\d+)\/[^"]*)"[^>]*>\s*<img[^>]+src="([^"]+)"[^>]+alt="([^"]*)"[^>]*><\/a>[\s\S]*?<div\s+class="vlength">([^<]+)<\/div>[\s\S]*?<div\s+class="likes">([^<]*)<\/div>[\s\S]*?<div\s+class="dislikes">([^<]*)<\/div>/gi

  const items = []
  let match
  while ((match = pattern.exec(html)) !== null) {
    const watchUrl = match[1]
    const sourceId = match[2]
    const thumbnailUrl = match[3]
    const title = normalizeWhitespace(match[4])
    const durationRaw = normalizeWhitespace(match[5])
    const likesRaw = normalizeWhitespace(match[6])
    const dislikesRaw = normalizeWhitespace(match[7])

    if (!sourceId || !watchUrl || !title || !thumbnailUrl) continue

    items.push({
      sourceId,
      watchUrl,
      thumbnailUrl,
      title,
      durationRaw,
      duration: toSeconds(durationRaw),
      likes: toInt(likesRaw),
      dislikes: toInt(dislikesRaw),
    })
  }

  return items
}

async function ensureBaseEntities() {
  const uploader =
    (await prisma.user.findUnique({ where: { handle: 'pornktube' } })) ||
    (await prisma.user.create({
      data: {
        email: 'pornktube@tubetube.local',
        name: 'PornkTube',
        handle: 'pornktube',
        subscribers: 0,
      },
    }))

  const category =
    (await prisma.category.findUnique({ where: { slug: 'amateur' } })) ||
    (await prisma.category.create({ data: { name: 'Amateur', slug: 'amateur' } }))

  return { uploader, category }
}

async function upsertVideo(item, uploaderId, categoryId) {
  const sourceTag = `Source: ${item.watchUrl}`

  const existing = await prisma.video.findFirst({
    where: {
      OR: [{ videoUrl: item.watchUrl }, { description: { contains: sourceTag } }],
    },
    select: { id: true },
  })

  const payload = {
    title: item.title,
    description: sourceTag,
    thumbnailUrl: item.thumbnailUrl,
    videoUrl: item.watchUrl,
    duration: item.duration,
    views: 0,
    likes: item.likes,
    dislikes: item.dislikes,
    isPublished: true,
    privacy: 'public',
    isShort: false,
    uploaderId,
    categoryId,
  }

  if (existing) {
    await prisma.videoTag.deleteMany({ where: { videoId: existing.id } })
    await prisma.video.update({
      where: { id: existing.id },
      data: {
        ...payload,
        tags: {
          create: [{ name: 'pornktube' }],
        },
      },
    })
    return 'updated'
  }

  await prisma.video.create({
    data: {
      ...payload,
      tags: {
        create: [{ name: 'pornktube' }],
      },
    },
  })
  return 'created'
}

async function run() {
  console.log(
    `Starting PornkTube import: startPage=${START_PAGE}, maxPages=${MAX_PAGES}, delayMs=${REQUEST_DELAY_MS}`
  )

  const { uploader, category } = await ensureBaseEntities()

  const collectedById = new Map()
  let page = START_PAGE
  let scannedPages = 0

  while (scannedPages < MAX_PAGES) {
    const pageUrl = page === 1 ? `${BASE_URL}/` : `${BASE_URL}/${page}/`
    const { ok, status, html } = await fetchHtml(pageUrl)
    scannedPages += 1

    if (!ok) {
      console.log(`Stop at page ${page}: HTTP ${status}`)
      break
    }

    const items = parsePageItems(html)
    if (items.length === 0) {
      console.log(`Stop at page ${page}: no view links found`)
      break
    }

    for (const item of items) {
      if (!collectedById.has(item.sourceId)) {
        collectedById.set(item.sourceId, item)
      }
    }

    console.log(
      `Scanned page ${page}: found=${items.length}, unique_total=${collectedById.size}`
    )

    page += 1
    if (REQUEST_DELAY_MS > 0) await sleep(REQUEST_DELAY_MS)
  }

  let created = 0
  let updated = 0

  const allItems = [...collectedById.values()]
  for (let index = 0; index < allItems.length; index += 1) {
    const item = allItems[index]
    const result = await upsertVideo(item, uploader.id, category.id)
    if (result === 'created') created += 1
    if (result === 'updated') updated += 1

    if ((index + 1) % 50 === 0 || index + 1 === allItems.length) {
      console.log(`Synced ${index + 1}/${allItems.length}`)
    }
  }

  const totalVideos = await prisma.video.count()
  console.log(
    `Done: scanned_pages=${scannedPages}, imported_links=${allItems.length}, created=${created}, updated=${updated}, total_videos=${totalVideos}`
  )
}

run()
  .catch((error) => {
    console.error('Import failed:', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

