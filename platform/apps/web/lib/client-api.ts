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

export async function login(
  email: string,
  password: string,
): Promise<{ require2fa?: boolean; challenge?: string }> {
  const res = await fetch(`${API}/api/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error("E-mail ou senha inválidos");
  const data = (await res.json()) as { accessToken?: string; require2fa?: boolean; challenge?: string };
  if (data.accessToken) {
    setToken(data.accessToken);
    return {};
  }
  return { require2fa: true, challenge: data.challenge };
}

export interface OAuthProviderStatus {
  provider: string;
  configured: boolean;
}
export async function oauthProviders(): Promise<OAuthProviderStatus[]> {
  try {
    const res = await fetch(`${API}/api/auth/oauth/providers`);
    if (!res.ok) return [];
    return (await res.json()) as OAuthProviderStatus[];
  } catch {
    return [];
  }
}
export function oauthStart(provider: string) {
  window.location.href = `${API}/api/auth/oauth/${provider}`;
}
export function storeToken(token: string) {
  setToken(token);
}

export async function twofaLogin(challenge: string, code: string) {
  const res = await fetch(`${API}/api/auth/2fa/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ challenge, code }),
  });
  if (!res.ok) throw new Error("Código de verificação inválido");
  const data = (await res.json()) as { accessToken: string };
  setToken(data.accessToken);
}

export const twofaStatus = () => authFetch<{ enabled: boolean }>("/auth/2fa/status");
export const twofaSetup = () => authPost<{ secret: string; otpauth: string }>("/auth/2fa/setup", {});
export const twofaEnable = (code: string) => authPost<{ enabled: boolean }>("/auth/2fa/enable", { code });
export const twofaDisable = (code: string) => authPost<{ enabled: boolean }>("/auth/2fa/disable", { code });

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

// ---- Inteligência Artificial ----
export interface AiScore {
  score: number;
  breakdown: { fotos: number; descricao: number; preco: number; completude: number };
  suggestions: string[];
}
export interface AiPrice {
  sampleSize: number;
  current: number;
  suggested: number;
  verdict: "BELOW" | "AT" | "ABOVE" | "NO_DATA";
  diffPct?: number;
  market?: { median: number; min: number; max: number };
}
export interface AiDescription {
  text: string;
  source: "llm" | "template";
  llmConfigured: boolean;
}

export const aiScore = (id: string) => authFetch<AiScore>(`/vehicles/${id}/ai/score`);
export const aiPrice = (id: string) => authFetch<AiPrice>(`/vehicles/${id}/ai/price`);
export const aiDescription = (id: string) => authPost<AiDescription>(`/vehicles/${id}/ai/description`, {});

// ---- Publicidade (patrocinados) ----
export interface Ad {
  id: string;
  advertiser: string;
  category: string;
  title: string;
  description: string | null;
  ctaText: string;
  ctaUrl: string;
}

// ---- CRM: leads, atendimento, agenda ----
export interface Lead {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  source: string;
  vehicle: { title: string } | null;
}
export interface Message {
  id: string;
  direction: "IN" | "OUT";
  channel: string;
  body: string;
  status: string | null;
  createdAt: string;
}
export interface Template {
  id: string;
  name: string;
  channel: string;
  body: string;
}
export interface Activity {
  id: string;
  type: string;
  title: string;
  dueAt: string | null;
  done: boolean;
  deal: { lead: { name: string } } | null;
}

export const fetchLeads = () => authFetch<Lead[]>("/crm/leads");
export const fetchMessages = (leadId: string) => authFetch<Message[]>(`/crm/messages?leadId=${leadId}`);
export const sendMessage = (b: { leadId: string; channel: string; body: string; templateId?: string }) =>
  authPost<Message>("/crm/messages", b);
export const fetchTemplates = () => authFetch<Template[]>("/crm/templates");
export const fetchAgenda = () => authFetch<Activity[]>("/crm/agenda");
export const createActivity = (b: { type: string; title: string; dueAt?: string }) =>
  authPost<Activity>("/crm/activities", b);
export const completeActivity = (id: string) => authPatch<Activity>(`/crm/activities/${id}/done`, {});

// ---- Automações ----
export interface Automation {
  id: string;
  name: string;
  trigger: { type: string };
  actions: { type: string; body?: string; activityType?: string; title?: string };
  active: boolean;
}

export const fetchAutomations = () => authFetch<Automation[]>("/automations");
export const createAutomation = (b: {
  name: string; trigger: string; action: string; body?: string; activityType?: string; activityTitle?: string;
}) => authPost<Automation>("/automations", b);
export const toggleAutomation = (id: string) => authPatch<Automation>(`/automations/${id}/toggle`, {});
export const deleteAutomation = (id: string) => authDelete(`/automations/${id}`);

// ---- Relatórios ----
export interface ReportSummary {
  kpis: { leads: number; sales: number; sold: number; revenue: number; conversion: number; activeVehicles: number; avgTicket: number };
  leadsBySource: { source: string; count: number }[];
  dealsByStage: { stage: string; count: number }[];
  topVehicles: { title: string; views: number; leadsCount: number; status: string }[];
}

export const fetchReport = () => authFetch<ReportSummary>("/reports/summary");

export async function downloadCsv(type: "leads" | "deals", filename: string) {
  const token = getToken();
  if (!token) throw new AuthError("Sem sessão");
  const res = await fetch(`${API}/api/reports/export/${type}`, {
    headers: { authorization: `Bearer ${token}` },
  });
  if (res.status === 401 || res.status === 403) throw new AuthError("Sessão expirada");
  if (!res.ok) throw new Error("Falha ao exportar");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// ---- Marketing ----
export interface Campaign {
  id: string;
  name: string;
  channel: string;
  budget: string | number | null;
  status: string;
  utm: { source?: string; medium?: string; campaign?: string };
}
export interface LandingContent {
  headline: string;
  subheadline?: string;
  ctaText?: string;
  ctaUrl?: string;
}
export interface Landing {
  id: string;
  slug: string;
  title: string;
  published: boolean;
  content: LandingContent;
}

export const fetchCampaigns = () => authFetch<Campaign[]>("/marketing/campaigns");
export const createCampaign = (b: { name: string; channel: string; budget?: number; utmCampaign?: string }) =>
  authPost<Campaign>("/marketing/campaigns", b);
export const fetchLanding = () => authFetch<Landing[]>("/marketing/landing");
export const createLanding = (b: { slug: string; title: string; headline: string; subheadline?: string; ctaText?: string }) =>
  authPost<Landing>("/marketing/landing", b);
export const updateLanding = (id: string, b: { published?: boolean }) =>
  authPatch<Landing>(`/marketing/landing/${id}`, b);

export async function fetchAds(placement = "HOME"): Promise<Ad[]> {
  try {
    const res = await fetch(`${API}/api/ads?placement=${placement}`);
    if (!res.ok) return [];
    return (await res.json()) as Ad[];
  } catch {
    return [];
  }
}

export function adClick(id: string): void {
  // fire-and-forget (não bloqueia a navegação para o anunciante)
  void fetch(`${API}/api/ads/${id}/click`, { method: "POST", keepalive: true }).catch(() => undefined);
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
  revenue: { subscriptions: number; commissions: number; featured: number; advertising: number; total: number };
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
