// frontend/src/features/auth/api.ts

import { api, setToken } from "../../api/client";
import type { AuthUser } from "../../lib/auth";

export async function login(email: string, password: string) {
  const res = await api<{
    success: boolean;
    message: string;
    data: { token: string; user?: AuthUser };
  }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  setToken(res.data.token);
  return res.data;
}

export async function register(payload: {
  email: string;
  password: string;
  fullName: string;
  role?: string;
}) {
  return api<{ success: boolean; message: string; data: AuthUser }>(
    "/auth/register",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
}

export async function getMe() {
  return api<{ success: boolean; data: AuthUser }>("/auth/me");
}