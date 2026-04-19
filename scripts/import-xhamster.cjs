/* eslint-disable no-console */
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const BASE_URL = 'https://xhamster2.com'
const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'

const MAX_PAGES = Math.max(1, Number(process.argv[2] || 50))
const START_PAGE = Math.max(1, Number(process.argv[3] || 1))
const REQUEST_DELAY_MS = Math.max(0, Number(process.argv[4] || 80))

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

async function fetchHtml(url) {
  const response = await fetch(url, {
    headers: {
      'user-agent': USER_AGENT,
      referer: BASE_URL,
      accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
  })
  return {
    ok: response.ok,
    status: response.status,
    html: await response.text(),
  }
}

function parseListingVideoLinks(html) {
  const matches = [...html.matchAll(/href="(https:\/\/xhamster2\.com\/videos\/[^"]+)"/gi)]
  const links = matches
    .map((m) => m[1].replace(/#.*$/, '').trim())
    .filter(Boolean)
  return [...new Set(links)]
}

function parseVideoDetails(videoUrl, html) {
  const title =
    normalizeWhitespace((html.match(/<title>([^<]+)<\/title>/i) || [])[1]) ||
    normalizeWhitespace(
      (html.match(/property="og:title"\s+content="([^"]+)"/i) || [])[1]
    )

  const thumbnailUrl =
    (html.match(/property="og:image"\s+content="([^"]+)"/i) || [])[1] ||
    (html.match(/"posterUrl":"([^"]+)"/i) || [])[1] ||
    ''

  const embedUrl =
    (html.match(/https?:\/\/xhamster2\.com\/embed\/([a-zA-Z0-9]+)/i) || [])[0] ||
    ''

  let durationSeconds = 0
  const durationClock = (html.match(/"duration":"(\d{1,2}:\d{2}(?::\d{2})?)"/i) || [])[1]
  if (durationClock) {
    durationSeconds = toSeconds(durationClock)
  } else {
    const iso = (html.match(/"duration":"PT(\d+)M(\d+)S"/i) || null)
    if (iso) {
      durationSeconds = Number(iso[1]) * 60 + Number(iso[2])
    }
  }

  const sourceTag = `Source: ${videoUrl}`
  const finalTitle = title.replace(/\s*-\s*xHamster.*$/i, '').trim()
  const finalVideoUrl = embedUrl || videoUrl

  if (!finalTitle || !thumbnailUrl || !finalVideoUrl) return null

  return {
    title: finalTitle,
    thumbnailUrl,
    videoUrl: finalVideoUrl,
    duration: durationSeconds,
    description: sourceTag,
  }
}

async function ensureBaseEntities() {
  const uploader =
    (await prisma.user.findUnique({ where: { handle: 'xhamster' } })) ||
    (await prisma.user.create({
      data: {
        email: 'xhamster@tubetube.local',
        name: 'xHamster',
        handle: 'xhamster',
        subscribers: 0,
      },
    }))

  const category =
    (await prisma.category.findUnique({ where: { slug: 'amateur' } })) ||
    (await prisma.category.create({ data: { name: 'Amateur', slug: 'amateur' } }))

  return { uploader, category }
}

async function upsertVideo(video, uploaderId, categoryId) {
  const existing = await prisma.video.findFirst({
    where: {
      OR: [{ videoUrl: video.videoUrl }, { description: { contains: video.description } }],
    },
    select: { id: true },
  })

  const payload = {
    title: video.title,
    description: video.description,
    thumbnailUrl: video.thumbnailUrl,
    videoUrl: video.videoUrl,
    duration: video.duration,
    views: 0,
    likes: 0,
    dislikes: 0,
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
        tags: { create: [{ name: 'xhamster' }] },
      },
    })
    return 'updated'
  }

  await prisma.video.create({
    data: {
      ...payload,
      tags: { create: [{ name: 'xhamster' }] },
    },
  })
  return 'created'
}

async function run() {
  console.log(
    `Starting xHamster import: startPage=${START_PAGE}, maxPages=${MAX_PAGES}, delayMs=${REQUEST_DELAY_MS}`
  )

  const { uploader, category } = await ensureBaseEntities()
  const linkSet = new Set()

  let scannedPages = 0
  for (let page = START_PAGE; page < START_PAGE + MAX_PAGES; page += 1) {
    const pageUrl = page === 1 ? `${BASE_URL}/` : `${BASE_URL}/?page=${page}`
    const { ok, status, html } = await fetchHtml(pageUrl)
    scannedPages += 1

    if (!ok) {
      console.log(`Stop at page ${page}: HTTP ${status}`)
      break
    }

    const links = parseListingVideoLinks(html)
    if (links.length === 0) {
      console.log(`Stop at page ${page}: no video links`)
      break
    }

    for (const link of links) linkSet.add(link)
    console.log(`Scanned page ${page}: links=${links.length}, unique_total=${linkSet.size}`)

    if (REQUEST_DELAY_MS > 0) await sleep(REQUEST_DELAY_MS)
  }

  const links = [...linkSet]
  let created = 0
  let updated = 0
  let skipped = 0

  for (let i = 0; i < links.length; i += 1) {
    const url = links[i]
    try {
      const { ok, html } = await fetchHtml(url)
      if (!ok) {
        skipped += 1
      } else {
        const details = parseVideoDetails(url, html)
        if (!details) {
          skipped += 1
        } else {
          const result = await upsertVideo(details, uploader.id, category.id)
          if (result === 'created') created += 1
          if (result === 'updated') updated += 1
        }
      }
    } catch {
      skipped += 1
    }

    if ((i + 1) % 50 === 0 || i + 1 === links.length) {
      console.log(`Synced ${i + 1}/${links.length}`)
    }
    if (REQUEST_DELAY_MS > 0) await sleep(REQUEST_DELAY_MS)
  }

  const totalVideos = await prisma.video.count()
  console.log(
    `Done: scanned_pages=${scannedPages}, links=${links.length}, created=${created}, updated=${updated}, skipped=${skipped}, total_videos=${totalVideos}`
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

