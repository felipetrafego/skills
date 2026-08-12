import { Fuel, type MakeCatalog } from "./types";

export const VOLKSWAGEN: MakeCatalog = {
  make: "Volkswagen",
  entries: [
    { model: "Polo", version: "Track", segment: "Hatch", bodyType: "Hatch", fuel: Fuel.FLEX, doors: 5, yearFrom: 2023 },
    { model: "Polo", version: "TSI Comfortline", segment: "Hatch", bodyType: "Hatch", fuel: Fuel.FLEX, doors: 5, yearFrom: 2022 },
    { model: "Polo", version: "GTS", segment: "Hatch Esportivo", bodyType: "Hatch", fuel: Fuel.FLEX, doors: 5, yearFrom: 2022 },
    { model: "Virtus", version: "Comfortline TSI", segment: "Sedã", bodyType: "Sedã", fuel: Fuel.FLEX, doors: 4, yearFrom: 2022 },
    { model: "Virtus", version: "Exclusive TSI", segment: "Sedã", bodyType: "Sedã", fuel: Fuel.FLEX, doors: 4, yearFrom: 2022 },
    { model: "Nivus", version: "Comfortline", segment: "SUV Coupé", bodyType: "SUV Coupé", fuel: Fuel.FLEX, doors: 5, yearFrom: 2021 },
    { model: "Nivus", version: "Highline", segment: "SUV Coupé", bodyType: "SUV Coupé", fuel: Fuel.FLEX, doors: 5, yearFrom: 2021 },
    { model: "T-Cross", version: "Sense", segment: "SUV", bodyType: "SUV", fuel: Fuel.FLEX, doors: 5, yearFrom: 2020 },
    { model: "T-Cross", version: "Highline", segment: "SUV", bodyType: "SUV", fuel: Fuel.FLEX, doors: 5, yearFrom: 2020 },
    { model: "Taos", version: "Highline", segment: "SUV", bodyType: "SUV", fuel: Fuel.FLEX, doors: 5, yearFrom: 2021 },
    { model: "Saveiro", version: "Robust", segment: "Picape", bodyType: "Picape", fuel: Fuel.FLEX, doors: 2, yearFrom: 2021 },
    { model: "Saveiro", version: "Cross CD", segment: "Picape", bodyType: "Picape", fuel: Fuel.FLEX, doors: 4, yearFrom: 2021 },
    { model: "Amarok", version: "V6 Highline Diesel", segment: "Picape", bodyType: "Picape", fuel: Fuel.DIESEL, doors: 4, yearFrom: 2021 },
    { model: "Jetta", version: "GLI", segment: "Sedã Esportivo", bodyType: "Sedã", fuel: Fuel.GASOLINE, doors: 4, yearFrom: 2022 },
  ],
};
