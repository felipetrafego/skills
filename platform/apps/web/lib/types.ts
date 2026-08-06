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

export interface VehicleMedia {
  id: string;
  type: "PHOTO" | "VIDEO" | "VIEW_360" | "DOCUMENT";
  url: string;
  thumbUrl?: string | null;
  position: number;
}

export interface VehicleDetail extends VehicleListItem {
  description?: string | null;
  version?: string | null;
  color?: string | null;
  doors?: number | null;
  fipeCode?: string | null;
  fipePrice?: string | number | null;
  status: string;
  media: VehicleMedia[];
  options: { option: { id: string; name: string } }[];
  tenant?: { name: string; slug: string } | null;
}
