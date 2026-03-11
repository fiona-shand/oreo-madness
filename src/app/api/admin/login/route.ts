import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import crypto from 'crypto'

const SESSION_DURATION = 60 * 60 * 24 // 24 hours

function createSignedToken(): string {
  const secret = process.env.ADMIN_PASSWORD
  if (!secret) throw new Error('ADMIN_PASSWORD not set')
  const payload = JSON.stringify({ admin: true, exp: Date.now() + SESSION_DURATION * 1000 })
  const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex')
  return Buffer.from(payload).toString('base64url') + '.' + signature
}

function verifyToken(token: string): boolean {
  const secret = process.env.ADMIN_PASSWORD
  if (!secret) return false
  const [payloadB64, signature] = token.split('.')
  if (!payloadB64 || !signature) return false
  try {
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString())
    const expected = crypto.createHmac('sha256', secret).update(JSON.stringify({ admin: payload.admin, exp: payload.exp })).digest('hex')
    if (signature !== expected) return false
    if (payload.exp < Date.now()) return false
    return true
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  const { password } = await req.json()
  const adminPassword = process.env.ADMIN_PASSWORD?.trim()

  if (!adminPassword) {
    return NextResponse.json({ error: 'Admin not configured' }, { status: 500 })
  }

  if (typeof password !== 'string' || password.trim() !== adminPassword) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  const token = createSignedToken()
  const cookieStore = await cookies()
  cookieStore.set('admin_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION,
    path: '/',
  })

  return NextResponse.json({ success: true })
}
