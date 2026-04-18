import { NextRequest, NextResponse } from 'next/server'

const ALLOWED_PROTOCOLS = new Set(['http:', 'https:'])

function isPrivateHostname(hostname: string) {
  const h = hostname.toLowerCase()
  if (h === 'localhost' || h.endsWith('.local')) return true
  if (h === '127.0.0.1' || h === '::1') return true
  if (/^10\./.test(h)) return true
  if (/^192\.168\./.test(h)) return true
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(h)) return true
  return false
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const rawUrl = searchParams.get('url')

    if (!rawUrl) {
      return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 })
    }

    let target: URL
    try {
      target = new URL(rawUrl)
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
    }

    if (!ALLOWED_PROTOCOLS.has(target.protocol)) {
      return NextResponse.json({ error: 'Unsupported URL protocol' }, { status: 400 })
    }

    if (isPrivateHostname(target.hostname)) {
      return NextResponse.json({ error: 'Blocked target host' }, { status: 400 })
    }

    let upstreamHeaders: HeadersInit = {
      'user-agent':
        request.headers.get('user-agent') ||
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome Safari',
      accept: request.headers.get('accept') || '*/*',
    }

    const range = request.headers.get('range')
    if (range) {
      upstreamHeaders = { ...upstreamHeaders, range }
    }

    const upstream = await fetch(target.toString(), {
      method: 'GET',
      headers: upstreamHeaders,
      redirect: 'follow',
    })

    if (!upstream.ok && upstream.status !== 206) {
      return NextResponse.json(
        { error: `Upstream responded with status ${upstream.status}` },
        { status: upstream.status >= 400 ? upstream.status : 502 }
      )
    }

    const responseHeaders = new Headers()
    const contentType = upstream.headers.get('content-type') || 'video/mp4'
    responseHeaders.set('content-type', contentType)
    responseHeaders.set('accept-ranges', upstream.headers.get('accept-ranges') || 'bytes')

    const passthrough = [
      'content-length',
      'content-range',
      'cache-control',
      'etag',
      'last-modified',
    ]
    for (const key of passthrough) {
      const val = upstream.headers.get(key)
      if (val) responseHeaders.set(key, val)
    }

    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers: responseHeaders,
    })
  } catch (error) {
    console.error('Proxy video error:', error)
    return NextResponse.json({ error: 'Failed to proxy video' }, { status: 500 })
  }
}
