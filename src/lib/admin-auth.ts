import { cookies } from 'next/headers'
import crypto from 'crypto'

export async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin_session')?.value
  if (!token) return false

  const secret = process.env.ADMIN_PASSWORD
  if (!secret) return false

  const [payloadB64, signature] = token.split('.')
  if (!payloadB64 || !signature) return false

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString())
    const expected = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify({ admin: payload.admin, exp: payload.exp }))
      .digest('hex')
    if (signature !== expected) return false
    if (payload.exp < Date.now()) return false
    return true
  } catch {
    return false
  }
}
