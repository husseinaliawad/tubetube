import { createHmac, timingSafeEqual } from 'crypto'
import type { NextRequest } from 'next/server'

export const ADMIN_COOKIE_NAME = 'vt_admin_session'
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7

type AdminSessionPayload = {
  email: string
  exp: number
}

function getSecret() {
  return process.env.ADMIN_SESSION_SECRET || 'dev-change-me-admin-session-secret'
}

function getAdminEmail() {
  return process.env.ADMIN_EMAIL || 'admin@velvettube.local'
}

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || 'admin123'
}

function signPayload(payloadBase64: string) {
  return createHmac('sha256', getSecret()).update(payloadBase64).digest('base64url')
}

export function createAdminSessionToken(email: string) {
  const payload: AdminSessionPayload = {
    email,
    exp: Date.now() + SESSION_TTL_SECONDS * 1000,
  }
  const payloadBase64 = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url')
  const signature = signPayload(payloadBase64)
  return `${payloadBase64}.${signature}`
}

export function verifyAdminSessionToken(token: string | undefined | null): AdminSessionPayload | null {
  if (!token) return null
  const [payloadBase64, providedSignature] = token.split('.')
  if (!payloadBase64 || !providedSignature) return null

  const expectedSignature = signPayload(payloadBase64)
  const providedBuffer = Buffer.from(providedSignature)
  const expectedBuffer = Buffer.from(expectedSignature)
  if (providedBuffer.length !== expectedBuffer.length) return null
  if (!timingSafeEqual(providedBuffer, expectedBuffer)) return null

  try {
    const payload = JSON.parse(Buffer.from(payloadBase64, 'base64url').toString('utf8')) as AdminSessionPayload
    if (!payload?.email || !payload?.exp) return null
    if (payload.exp < Date.now()) return null
    if (payload.email !== getAdminEmail()) return null
    return payload
  } catch {
    return null
  }
}

export function isValidAdminCredentials(email: string, password: string) {
  return email === getAdminEmail() && password === getAdminPassword()
}

export function getAdminSessionFromRequest(request: NextRequest) {
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value
  return verifyAdminSessionToken(token)
}

export function isAdminRequest(request: NextRequest) {
  return Boolean(getAdminSessionFromRequest(request))
}

export function getAdminSessionCookieMaxAge() {
  return SESSION_TTL_SECONDS
}

