import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import crypto from 'crypto'

function verifyToken(token: string): boolean {
  const secret = process.env.ADMIN_PASSWORD
  if (!secret) return false
  const [payloadB64, signature] = token.split('.')
  if (!payloadB64 || !signature) return false
  try {
    const payloadStr = Buffer.from(payloadB64, 'base64url').toString()
    const payload = JSON.parse(payloadStr)
    const expected = crypto.createHmac('sha256', secret).update(payloadStr).digest('hex')
    if (signature !== expected) return false
    if (payload.exp < Date.now()) return false
    return true
  } catch {
    return false
  }
}

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_session')?.value

  if (!token || !verifyToken(token)) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }

  return NextResponse.json({ authenticated: true })
}
