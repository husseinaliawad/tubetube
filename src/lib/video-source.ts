import type { Prisma } from '@prisma/client'

function normalizeHost(value: string) {
  return value.trim().toLowerCase()
}

function getConfiguredVideoHosts() {
  return (
    process.env.VIDEO_SOURCE_WHITELIST ||
    process.env.NEXT_PUBLIC_VIDEO_SOURCE_WHITELIST ||
    ''
  )
    .split(',')
    .map(normalizeHost)
    .filter(Boolean)
}

export function getAllowedVideoHosts() {
  const configured = getConfiguredVideoHosts()
  if (configured.length > 0) {
    return [...new Set(configured)]
  }

  // No whitelist configured: do not block external hosts in production.
  const defaults = ['localhost', '127.0.0.1']
  const browserHost =
    typeof window !== 'undefined' ? [window.location.hostname.toLowerCase()] : []

  return [...new Set([...defaults, ...browserHost])]
}

export function isAllowedVideoSource(rawUrl: string) {
  if (!rawUrl) return false

  if (rawUrl.startsWith('/')) return true

  const configured = getConfiguredVideoHosts()
  if (configured.length === 0) return true

  try {
    const url = new URL(rawUrl)
    const host = url.hostname.toLowerCase()
    return getAllowedVideoHosts().includes(host)
  } catch {
    return false
  }
}

export function buildAllowedVideoUrlWhere(): Prisma.VideoWhereInput {
  const configured = getConfiguredVideoHosts()
  if (configured.length === 0) {
    return {}
  }

  const hosts = getAllowedVideoHosts()
  const hostFilters = hosts.flatMap((host) => [
    { videoUrl: { startsWith: `https://${host}/` } },
    { videoUrl: { startsWith: `http://${host}/` } },
  ])

  return {
    OR: [{ videoUrl: { startsWith: '/' } }, ...hostFilters],
  }
}
