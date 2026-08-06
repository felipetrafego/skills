export interface VehicleListItem {
  id: string;
  title: string;
  make: string;
  model: string;
  yearModel: number;
  yearFab: number;
  price: string | number;
  mileageKm: number;
  fuel: string;
  transmission: string;
  city?: string | null;
  state?: string | null;
  featuredTier?: "NONE" | "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";
}

export interface SearchResult {
  items: VehicleListItem[];
  total: number;
  page: number;
  pageSize: number;
}
