import type { SearchResult, Store, VehicleDetail, VehicleListItem } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";

/** Amostra usada quando a API ainda não está no ar (desenvolvimento inicial). */
const SAMPLE: VehicleListItem[] = [
  { id: "1", title: "Jeep Compass Longitude", make: "Jeep", model: "Compass", yearModel: 2023, yearFab: 2022, price: 128900, mileageKm: 38400, fuel: "FLEX", transmission: "AUTOMATIC", city: "São Paulo", state: "SP", featuredTier: "GOLD" },
  { id: "2", title: "Chevrolet Onix Plus LTZ", make: "Chevrolet", model: "Onix Plus", yearModel: 2023, yearFab: 2023, price: 82500, mileageKm: 24100, fuel: "FLEX", transmission: "AUTOMATIC", city: "Campinas", state: "SP", featuredTier: "SILVER" },
  { id: "3", title: "Toyota Corolla XEi 2.0", make: "Toyota", model: "Corolla", yearModel: 2022, yearFab: 2022, price: 119900, mileageKm: 41000, fuel: "FLEX", transmission: "CVT", city: "Guarulhos", state: "SP", featuredTier: "PLATINUM" },
  { id: "4", title: "Hyundai HB20 Comfort", make: "Hyundai", model: "HB20", yearModel: 2023, yearFab: 2023, price: 74300, mileageKm: 19800, fuel: "FLEX", transmission: "MANUAL", city: "Santo André", state: "SP", featuredTier: "NONE" },
  { id: "5", title: "Volkswagen T-Cross Highline", make: "Volkswagen", model: "T-Cross", yearModel: 2022, yearFab: 2022, price: 129700, mileageKm: 33500, fuel: "FLEX", transmission: "AUTOMATIC", city: "Osasco", state: "SP", featuredTier: "BRONZE" },
  { id: "6", title: "Fiat Strada Volcano", make: "Fiat", model: "Strada", yearModel: 2023, yearFab: 2023, price: 112000, mileageKm: 15200, fuel: "FLEX", transmission: "MANUAL", city: "São Paulo", state: "SP", featuredTier: "NONE" },
  { id: "7", title: "Honda HR-V EXL", make: "Honda", model: "HR-V", yearModel: 2021, yearFab: 2021, price: 138500, mileageKm: 47900, fuel: "FLEX", transmission: "CVT", city: "Jundiaí", state: "SP", featuredTier: "NONE" },
  { id: "8", title: "Renault Kwid Outsider", make: "Renault", model: "Kwid", yearModel: 2024, yearFab: 2024, price: 68900, mileageKm: 8400, fuel: "FLEX", transmission: "MANUAL", city: "Diadema", state: "SP", featuredTier: "SILVER" },
];

export async function searchVehicles(params: Record<string, string> = {}): Promise<SearchResult> {
  try {
    const qs = new URLSearchParams(params).toString();
    const res = await fetch(`${API_URL}/api/vehicles${qs ? `?${qs}` : ""}`, {
      next: { revalidate: 5 },
    });
    if (!res.ok) throw new Error(`API ${res.status}`);
    return (await res.json()) as SearchResult;
  } catch {
    // Fallback offline — permite desenvolver o front sem a API rodando.
    return { items: SAMPLE, total: SAMPLE.length, page: 1, pageSize: 24 };
  }
}

/** Vitrine do lojista: dados da loja resolvidos por `x-tenant` (multi-tenant). */
export async function fetchStore(slug: string): Promise<Store | null> {
  try {
    const res = await fetch(`${API_URL}/api/tenants/current`, {
      headers: { "x-tenant": slug },
      next: { revalidate: 5 },
    });
    if (!res.ok) return null;
    return (await res.json()) as Store;
  } catch {
    return null;
  }
}

/** Estoque ativo de uma loja específica (filtro por tenant via header). */
export async function searchStoreVehicles(
  slug: string,
  params: Record<string, string> = {},
): Promise<SearchResult> {
  try {
    const qs = new URLSearchParams(params).toString();
    const res = await fetch(`${API_URL}/api/vehicles${qs ? `?${qs}` : ""}`, {
      headers: { "x-tenant": slug },
      next: { revalidate: 5 },
    });
    if (!res.ok) throw new Error(`API ${res.status}`);
    return (await res.json()) as SearchResult;
  } catch {
    return { items: [], total: 0, page: 1, pageSize: 24 };
  }
}

export interface PublicLanding {
  store: string;
  slug: string;
  title: string;
  content: { headline: string; subheadline?: string; ctaText?: string; ctaUrl?: string };
}

/** Landing page publicada de um lojista (resolvida por x-tenant). */
export async function fetchLandingPage(tenant: string, slug: string): Promise<PublicLanding | null> {
  try {
    const res = await fetch(`${API_URL}/api/marketing/l/${slug}`, {
      headers: { "x-tenant": tenant },
      next: { revalidate: 5 },
    });
    if (!res.ok) return null;
    return (await res.json()) as PublicLanding;
  } catch {
    return null;
  }
}

export async function getVehicle(id: string): Promise<VehicleDetail | null> {
  try {
    const res = await fetch(`${API_URL}/api/vehicles/${id}`, { next: { revalidate: 30 } });
    if (!res.ok) return null;
    return (await res.json()) as VehicleDetail;
  } catch {
    const sample = SAMPLE.find((v) => v.id === id);
    if (!sample) return null;
    return { ...sample, status: "ACTIVE", media: [], options: [] };
  }
}
