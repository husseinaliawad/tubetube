import type { Prisma } from '@prisma/client'

function normalizeHost(value: string) {
  return value.trim().toLowerCase()
}

export function getAllowedVideoHosts() {
  const configured = (
    process.env.VIDEO_SOURCE_WHITELIST ||
    process.env.NEXT_PUBLIC_VIDEO_SOURCE_WHITELIST ||
    ''
  )
    .split(',')
    .map(normalizeHost)
    .filter(Boolean)

  const defaults = ['localhost', '127.0.0.1']
  const browserHost =
    typeof window !== 'undefined' ? [window.location.hostname.toLowerCase()] : []

  return [...new Set([...configured, ...defaults, ...browserHost])]
}

export function isAllowedVideoSource(rawUrl: string) {
  if (!rawUrl) return false

  if (rawUrl.startsWith('/')) return true

  try {
    const url = new URL(rawUrl)
    const host = url.hostname.toLowerCase()
    return getAllowedVideoHosts().includes(host)
  } catch {
    return false
  }
}

export function buildAllowedVideoUrlWhere(): Prisma.VideoWhereInput {
  const hosts = getAllowedVideoHosts()
  const hostFilters = hosts.flatMap((host) => [
    { videoUrl: { startsWith: `https://${host}/` } },
    { videoUrl: { startsWith: `http://${host}/` } },
  ])

  return {
    OR: [{ videoUrl: { startsWith: '/' } }, ...hostFilters],
  }
}

