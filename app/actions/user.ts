'use server'

import { getRawToken } from '@/lib/session'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

interface CreateUserData {
  email: string;
  password: string;
  role?: 'admin' | 'officer';
}

interface UpdateUserData {
  email?: string;
  password?: string;
  role?: 'admin' | 'officer';
}

async function getAuthHeaders() {
  const token = await getRawToken();

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
    const response = await fetch(`${API_BASE_URL}/api/users`, {
      headers: await getAuthHeaders(),
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

export async function createUserAction(userData: CreateUserData) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users`, {
      method: 'POST',
      headers: await getAuthHeaders(),
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

export async function updateUserAction(id: number, userData: UpdateUserData) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
      method: 'PUT',
      headers: await getAuthHeaders(),
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
    const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
      method: 'DELETE',
      headers: await getAuthHeaders(),
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
