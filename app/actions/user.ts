'use server'

import { getSession } from '@/lib/session'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

async function getAuthHeaders() {
  const session = await getSession();
  const token = session?.accessToken; // Adjust based on session structure in session.ts

  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  }
}

// In session.ts, it stores the token directly as session_token cookie.
// getSession() returns the payload if verified.
// Looking at createSession(token) in session.ts, it stores the raw token.
// Looking at getSession() in session.ts, it returns the payload.
// Actually, backend needs the RAW token in Authorization header.
// Let's check session.ts again.

export async function getUsersAction() {
  try {
    const session = await getSession();
    // We need the raw token from the cookie, not the decoded payload.
    // However, deleteSession and createSession handle cookies.
    // Let's import cookies from next/headers to get raw token.
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;

    const response = await fetch(`${API_BASE_URL}/api/users`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      next: { revalidate: 0 } // Ensure fresh data
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { success: false, error: errorData.error || 'Failed to fetch users' };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('getUsersAction error:', error);
    return { success: false, error: 'Internal server error' };
  }
}

export async function createUserAction(userData: any) {
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;

    const response = await fetch(`${API_BASE_URL}/api/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { success: false, error: errorData.error || 'Failed to create user' };
    }

    return { success: true };
  } catch (error) {
    console.error('createUserAction error:', error);
    return { success: false, error: 'Internal server error' };
  }
}

export async function updateUserAction(id: number, userData: any) {
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;

    const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { success: false, error: errorData.error || 'Failed to update user' };
    }

    return { success: true };
  } catch (error) {
    console.error('updateUserAction error:', error);
    return { success: false, error: 'Internal server error' };
  }
}

export async function deleteUserAction(id: number) {
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;

    const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { success: false, error: errorData.error || 'Failed to delete user' };
    }

    return { success: true };
  } catch (error) {
    console.error('deleteUserAction error:', error);
    return { success: false, error: 'Internal server error' };
  }
}
