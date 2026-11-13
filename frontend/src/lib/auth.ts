// frontend/src/lib/auth.ts

import { getToken, setToken, api } from "../api/client";

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

export function isAuthenticated(): boolean {
  return Boolean(getToken());
}

export function logout(): void {
  setToken(null);
  window.location.href = "/login";
}

export async function fetchProfile(): Promise<AuthUser | null> {
  if (!getToken()) return null;
  try {
    const res = await api<{ success: boolean; data: AuthUser }>("/auth/me");
    return res.data;
  } catch {
    setToken(null);
    return null;
  }
}