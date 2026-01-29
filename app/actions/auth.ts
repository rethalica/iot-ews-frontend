'use server'

import { createSession, deleteSession, getSession } from '@/lib/session'
import { redirect } from 'next/navigation'

const API_Base_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

interface LoginState {
  message?: string;
  errors?: Record<string, string[]>;
}

export async function login(currentState: LoginState | undefined, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  try {
    const response = await fetch(`${API_Base_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
        const errorData = await response.json();
        return { message: errorData.message || 'Invalid credentials', errors: errorData.errors }
    }

    const data = await response.json()
    
    // Assuming backend returns { accessToken: "..." } or similar
    // Based on authRoutes, it calls `login` controller.
    // Let's check `login` controller return shape if needed, but usually it returns token.
    if (data.accessToken) {
        await createSession(data.accessToken)
    } else {
        return { message: 'Token not found in response' }
    }
  } catch (error) {
    console.error('Login error:', error)
    return { message: 'Something went wrong. Please try again.' }
  }
  
  redirect('/')
}

export async function getUserSession() {
  return await getSession()
}

export async function logout() {
  await deleteSession()
  redirect('/login')
}
