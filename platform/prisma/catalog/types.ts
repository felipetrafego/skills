import { Fuel } from "@prisma/client";

export { Fuel };

export interface CatalogEntry {
  model: string;
  version: string;
  segment: string;
  bodyType: string;
  fuel: Fuel;
  doors: number;
  yearFrom: number;
}

export interface MakeCatalog {
  make: string;
  entries: CatalogEntry[];
}
