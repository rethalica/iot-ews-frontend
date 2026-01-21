import 'server-only'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const key = new TextEncoder().encode(process.env.JWT_SECRET)

const cookieName = 'session_token'

export async function encrypt(payload: any) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d')
    .sign(key)
}

export async function decrypt(input: string): Promise<any> {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ['HS256'],
  })
  return payload
}

export async function createSession(token: string) {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
  const cookieStore = await cookies()
  
  // In a real app, you might want to encrypt the backend token into your own session token,
  // or just store the backend token directly if it's safe.
  // Here we store the backend token directly as 'session_token'.
  
  cookieStore.set(cookieName, token, {
    httpOnly: true,
    secure: true,
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  })
}

export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete(cookieName)
  redirect('/login') // Make sure this is called in a way that supports redirection
}

export async function getSession() {
    const cookieStore = await cookies()
    const token = cookieStore.get(cookieName)?.value
    if (!token) return null
    try {
        // If we were signing our own token, we'd verify it here.
        // Since we are storing the backend token, we can just return it,
        // or decoding it to check expiry (without verify if we don't share secret).
        // However, user requested 'jose', so let's try to verify if we share secret.
        // If the backend secret is shared, we can verify.
        // Let's assume we copy the secret to frontend .env
        const { payload } = await jwtVerify(token, key)
        return payload
    } catch (error) {
        return null
    }
}
