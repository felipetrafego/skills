import { Fuel } from "@prisma/client";

export interface CatalogEntry {
  model: string;
  version: string;
  segment: string;
  bodyType: string;
  fuel: Fuel;
  doors: number;
  yearFrom: number;
}

/**
 * Linha BMW atual comercializada no Brasil (referência de catálogo).
 * Sem imagens embutidas — `imageUrl` fica como placeholder (fotos licenciadas depois).
 */
export const BMW_LINEUP: CatalogEntry[] = [
  // Hatch
  { model: "Série 1", version: "118i M Sport", segment: "Hatch", bodyType: "Hatch", fuel: Fuel.GASOLINE, doors: 5, yearFrom: 2020 },
  { model: "Série 1", version: "M135i xDrive", segment: "Hatch Esportivo", bodyType: "Hatch", fuel: Fuel.GASOLINE, doors: 5, yearFrom: 2020 },

  // Sedã / Gran Coupé de entrada
  { model: "Série 2", version: "218i Gran Coupé", segment: "Sedã", bodyType: "Gran Coupé", fuel: Fuel.GASOLINE, doors: 4, yearFrom: 2020 },
  { model: "Série 2", version: "220i Coupé", segment: "Coupé", bodyType: "Coupé", fuel: Fuel.GASOLINE, doors: 2, yearFrom: 2022 },
  { model: "Série 2", version: "M235i xDrive Gran Coupé", segment: "Sedã Esportivo", bodyType: "Gran Coupé", fuel: Fuel.GASOLINE, doors: 4, yearFrom: 2020 },

  // Série 3
  { model: "Série 3", version: "320i M Sport", segment: "Sedã", bodyType: "Sedã", fuel: Fuel.GASOLINE, doors: 4, yearFrom: 2019 },
  { model: "Série 3", version: "330e (híbrido plug-in)", segment: "Sedã Híbrido", bodyType: "Sedã", fuel: Fuel.HYBRID, doors: 4, yearFrom: 2020 },
  { model: "Série 3", version: "M340i xDrive", segment: "Sedã Esportivo", bodyType: "Sedã", fuel: Fuel.GASOLINE, doors: 4, yearFrom: 2020 },

  // Série 4
  { model: "Série 4", version: "430i Coupé", segment: "Coupé", bodyType: "Coupé", fuel: Fuel.GASOLINE, doors: 2, yearFrom: 2021 },
  { model: "Série 4", version: "430i Cabrio", segment: "Conversível", bodyType: "Conversível", fuel: Fuel.GASOLINE, doors: 2, yearFrom: 2021 },
  { model: "Série 4", version: "430i Gran Coupé", segment: "Sedã", bodyType: "Gran Coupé", fuel: Fuel.GASOLINE, doors: 4, yearFrom: 2022 },

  // Série 5
  { model: "Série 5", version: "520i M Sport", segment: "Sedã", bodyType: "Sedã", fuel: Fuel.GASOLINE, doors: 4, yearFrom: 2024 },
  { model: "Série 5", version: "530e (híbrido plug-in)", segment: "Sedã Híbrido", bodyType: "Sedã", fuel: Fuel.HYBRID, doors: 4, yearFrom: 2024 },

  // Série 7
  { model: "Série 7", version: "740i", segment: "Sedã de Luxo", bodyType: "Sedã", fuel: Fuel.GASOLINE, doors: 4, yearFrom: 2023 },
  { model: "Série 7", version: "760i xDrive", segment: "Sedã de Luxo", bodyType: "Sedã", fuel: Fuel.GASOLINE, doors: 4, yearFrom: 2023 },

  // Série 8
  { model: "Série 8", version: "840i Coupé", segment: "Grand Tourer", bodyType: "Coupé", fuel: Fuel.GASOLINE, doors: 2, yearFrom: 2019 },
  { model: "Série 8", version: "840i Gran Coupé", segment: "Grand Tourer", bodyType: "Gran Coupé", fuel: Fuel.GASOLINE, doors: 4, yearFrom: 2020 },

  // Z4
  { model: "Z4", version: "sDrive20i", segment: "Roadster", bodyType: "Roadster", fuel: Fuel.GASOLINE, doors: 2, yearFrom: 2019 },
  { model: "Z4", version: "M40i", segment: "Roadster Esportivo", bodyType: "Roadster", fuel: Fuel.GASOLINE, doors: 2, yearFrom: 2020 },

  // SUVs (X)
  { model: "X1", version: "sDrive20i", segment: "SUV", bodyType: "SUV", fuel: Fuel.GASOLINE, doors: 5, yearFrom: 2023 },
  { model: "X2", version: "sDrive20i", segment: "SUV Coupé", bodyType: "SUV Coupé", fuel: Fuel.GASOLINE, doors: 5, yearFrom: 2024 },
  { model: "X3", version: "xDrive30i", segment: "SUV", bodyType: "SUV", fuel: Fuel.GASOLINE, doors: 5, yearFrom: 2022 },
  { model: "X3", version: "M50 xDrive", segment: "SUV Esportivo", bodyType: "SUV", fuel: Fuel.GASOLINE, doors: 5, yearFrom: 2025 },
  { model: "X4", version: "xDrive30i", segment: "SUV Coupé", bodyType: "SUV Coupé", fuel: Fuel.GASOLINE, doors: 5, yearFrom: 2022 },
  { model: "X5", version: "xDrive40i", segment: "SUV", bodyType: "SUV", fuel: Fuel.GASOLINE, doors: 5, yearFrom: 2023 },
  { model: "X5", version: "xDrive45e (híbrido plug-in)", segment: "SUV Híbrido", bodyType: "SUV", fuel: Fuel.HYBRID, doors: 5, yearFrom: 2023 },
  { model: "X6", version: "xDrive40i", segment: "SUV Coupé", bodyType: "SUV Coupé", fuel: Fuel.GASOLINE, doors: 5, yearFrom: 2023 },
  { model: "X7", version: "xDrive40i", segment: "SUV de Luxo", bodyType: "SUV", fuel: Fuel.GASOLINE, doors: 5, yearFrom: 2023 },
  { model: "XM", version: "(híbrido plug-in)", segment: "SUV Esportivo Híbrido", bodyType: "SUV", fuel: Fuel.HYBRID, doors: 5, yearFrom: 2023 },

  // Linha M
  { model: "M2", version: "Coupé", segment: "Esportivo", bodyType: "Coupé", fuel: Fuel.GASOLINE, doors: 2, yearFrom: 2023 },
  { model: "M3", version: "Competition", segment: "Sedã Esportivo", bodyType: "Sedã", fuel: Fuel.GASOLINE, doors: 4, yearFrom: 2021 },
  { model: "M4", version: "Competition", segment: "Esportivo", bodyType: "Coupé", fuel: Fuel.GASOLINE, doors: 2, yearFrom: 2021 },
  { model: "M5", version: "(híbrido plug-in)", segment: "Sedã Esportivo Híbrido", bodyType: "Sedã", fuel: Fuel.HYBRID, doors: 4, yearFrom: 2025 },
  { model: "M8", version: "Competition Coupé", segment: "Grand Tourer Esportivo", bodyType: "Coupé", fuel: Fuel.GASOLINE, doors: 2, yearFrom: 2020 },

  // Elétricos (i)
  { model: "iX1", version: "xDrive30", segment: "SUV Elétrico", bodyType: "SUV", fuel: Fuel.ELECTRIC, doors: 5, yearFrom: 2024 },
  { model: "iX2", version: "xDrive30", segment: "SUV Coupé Elétrico", bodyType: "SUV Coupé", fuel: Fuel.ELECTRIC, doors: 5, yearFrom: 2024 },
  { model: "iX3", version: "M Sport", segment: "SUV Elétrico", bodyType: "SUV", fuel: Fuel.ELECTRIC, doors: 5, yearFrom: 2022 },
  { model: "i4", version: "eDrive40 Gran Coupé", segment: "Sedã Elétrico", bodyType: "Gran Coupé", fuel: Fuel.ELECTRIC, doors: 4, yearFrom: 2022 },
  { model: "i5", version: "eDrive40", segment: "Sedã Elétrico", bodyType: "Sedã", fuel: Fuel.ELECTRIC, doors: 4, yearFrom: 2024 },
  { model: "i7", version: "xDrive60", segment: "Sedã de Luxo Elétrico", bodyType: "Sedã", fuel: Fuel.ELECTRIC, doors: 4, yearFrom: 2023 },
  { model: "iX", version: "xDrive50", segment: "SUV Elétrico", bodyType: "SUV", fuel: Fuel.ELECTRIC, doors: 5, yearFrom: 2022 },
];
