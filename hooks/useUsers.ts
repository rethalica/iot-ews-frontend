"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getUsersAction,
  createUserAction,
  updateUserAction,
  deleteUserAction,
} from "@/app/actions/user";

export interface User {
  id: number;
  email: string;
  role: "admin" | "officer";
  createdAt: string;
}

interface UseUsersReturn {
  users: User[];
  loading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
  createUser: (data: {
    email: string;
    password: string;
    role?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  updateUser: (
    id: number,
    data: { email?: string; password?: string; role?: string },
  ) => Promise<{ success: boolean; error?: string }>;
  deleteUser: (id: number) => Promise<{ success: boolean; error?: string }>;
}

/**
 * Custom hook for managing users via Server Actions
 * Handles CRUD operations by proxying through server-side to access httpOnly cookies
 */
export function useUsers(): UseUsersReturn {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getUsersAction();

      if (!result.success) {
        throw new Error(result.error);
      }

      setUsers(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  const createUser = useCallback(
    async (data: { email: string; password: string; role?: string }) => {
      try {
        const result = await createUserAction(data);

        if (!result.success) {
          return { success: false, error: result.error };
        }

        await fetchUsers();
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "An error occurred",
        };
      }
    },
    [fetchUsers],
  );

  const updateUser = useCallback(
    async (
      id: number,
      data: { email?: string; password?: string; role?: string },
    ) => {
      try {
        // Filter out empty password
        const cleanData: any = { ...data };
        if (cleanData.password === "") {
          delete cleanData.password;
        }

        const result = await updateUserAction(id, cleanData);

        if (!result.success) {
          return { success: false, error: result.error };
        }

        await fetchUsers();
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "An error occurred",
        };
      }
    },
    [fetchUsers],
  );

  const deleteUser = useCallback(
    async (id: number) => {
      try {
        const result = await deleteUserAction(id);

        if (!result.success) {
          return { success: false, error: result.error };
        }

        await fetchUsers();
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "An error occurred",
        };
      }
    },
    [fetchUsers],
  );

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
  };
}
