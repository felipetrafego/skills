"use client";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";
const TOKEN_KEY = "motora-token";

export class AuthError extends Error {}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}
export function setToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
}
export function clearToken() {
  window.localStorage.removeItem(TOKEN_KEY);
}

export async function login(email: string, password: string) {
  const res = await fetch(`${API}/api/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error("E-mail ou senha inválidos");
  const data = (await res.json()) as { accessToken: string };
  setToken(data.accessToken);
  return data;
}

export async function authFetch<T>(path: string): Promise<T> {
  const token = getToken();
  if (!token) throw new AuthError("Sem sessão");
  const res = await fetch(`${API}/api${path}`, {
    headers: { authorization: `Bearer ${token}` },
  });
  if (res.status === 401 || res.status === 403) {
    throw new AuthError("Sessão expirada");
  }
  if (!res.ok) throw new Error(`Erro ${res.status}`);
  return (await res.json()) as T;
}

// ---- Tipos das respostas usadas no painel ----
export interface DashboardSummary {
  period: string;
  kpis: {
    leads: number;
    views: number;
    activeVehicles: number;
    sold: number;
    conversion: number;
    revenue: number;
  };
  leadsBySource: { source: string; count: number }[];
  funnel: { stage: string; count: number }[];
}

export interface PipelineColumn {
  stage: string;
  count: number;
  total: number;
  deals: {
    id: string;
    value: string | number | null;
    lead: { name: string };
    vehicle: { title: string } | null;
    createdAt: string;
  }[];
}
