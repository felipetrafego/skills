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

export async function authPost<T>(path: string, body: unknown): Promise<T> {
  return authSend<T>("POST", path, body);
}
export async function authPatch<T>(path: string, body: unknown): Promise<T> {
  return authSend<T>("PATCH", path, body);
}
export async function authDelete(path: string): Promise<void> {
  await authSend<unknown>("DELETE", path);
}

async function authSend<T>(method: string, path: string, body?: unknown): Promise<T> {
  const token = getToken();
  if (!token) throw new AuthError("Sem sessão");
  const res = await fetch(`${API}/api${path}`, {
    method,
    headers: {
      authorization: `Bearer ${token}`,
      ...(body !== undefined ? { "content-type": "application/json" } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (res.status === 401 || res.status === 403) throw new AuthError("Sessão expirada");
  if (!res.ok) throw new Error(`Erro ${res.status}`);
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

// ---- Estoque do lojista ----
export interface MyVehicle {
  id: string;
  title: string;
  price: string | number;
  status: string;
  mileageKm: number;
  yearModel: number;
  yearFab: number;
  views: number;
  featuredTier: string;
  media: { url: string }[];
  _count: { media: number; leads: number };
}

export function fetchMyVehicles(): Promise<MyVehicle[]> {
  return authFetch<MyVehicle[]>("/vehicles/mine");
}

// ---- Destaque (impulsionamento) ----
export interface FeaturedTierInfo {
  tier: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";
  label: string;
  price: number;
  durationDays: number;
  reach: string;
}

export async function fetchTiers(): Promise<FeaturedTierInfo[]> {
  const res = await fetch(`${API}/api/featured/tiers`);
  if (!res.ok) return [];
  return (await res.json()) as FeaturedTierInfo[];
}

// ---- Admin da plataforma ----
export interface AdminOverview {
  mrr: number;
  arr: number;
  activeTenants: number;
  totalTenants: number;
  totalUsers: number;
  churnRate: number;
  ltv: number;
  avgTicket: number;
  revenue: { subscriptions: number; commissions: number; featured: number; total: number };
  catalog: { vehicles: number; soldVehicles: number; leads: number };
}
export interface AdminTenant {
  id: string;
  name: string;
  slug: string;
  status: string;
  subscriptionStatus: string;
  vehicles: number;
  createdAt: string;
}

// ---- Catálogo (público) ----
export interface CatalogModelItem {
  id: string;
  make: string;
  model: string;
  version: string | null;
  segment: string | null;
  bodyType: string | null;
  fuel: string;
  transmission: string | null;
  doors: number | null;
  yearFrom: number;
}

export async function fetchMakes(): Promise<{ make: string; models: number }[]> {
  const res = await fetch(`${API}/api/catalog/makes`);
  if (!res.ok) return [];
  return (await res.json()) as { make: string; models: number }[];
}

export async function fetchModels(make: string): Promise<CatalogModelItem[]> {
  const res = await fetch(`${API}/api/catalog/models?make=${encodeURIComponent(make)}`);
  if (!res.ok) return [];
  return (await res.json()) as CatalogModelItem[];
}

// ---- Upload de foto (presign -> PUT -> confirm) ----
interface Presigned {
  uploadUrl: string;
  publicUrl: string;
  key: string;
}

export async function uploadVehiclePhoto(vehicleId: string, file: File): Promise<void> {
  const pre = await authPost<Presigned>(`/vehicles/${vehicleId}/media/presign`, {
    filename: file.name,
    contentType: file.type || "image/jpeg",
    type: "PHOTO",
  });
  const put = await fetch(pre.uploadUrl, {
    method: "PUT",
    headers: { "content-type": file.type || "image/jpeg" },
    body: file,
  });
  if (!put.ok) throw new Error("Falha ao enviar a imagem");
  await authPost(`/vehicles/${vehicleId}/media`, { url: pre.publicUrl, type: "PHOTO" });
}

export interface CreatedVehicle {
  id: string;
}

// ---- Faturamento ----
export interface SubscriptionInfo {
  state: "NONE" | "TRIALING" | "ACTIVE" | "PAST_DUE" | "CANCELED";
  plan: { name: string; priceMonthly: number };
  paymentMethod: string | null;
  currentPeriodEnd: string | null;
}
export interface InvoiceItem {
  id: string;
  amount: number;
  status: "OPEN" | "PAID" | "VOID" | "UNCOLLECTIBLE";
  method: string | null;
  dueAt: string;
  paidAt: string | null;
  nfUrl: string | null;
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
