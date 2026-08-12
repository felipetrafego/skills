import { Fuel, type MakeCatalog } from "./types";

export const HONDA: MakeCatalog = {
  make: "Honda",
  entries: [
    { model: "City Hatchback", version: "EX", segment: "Hatch", bodyType: "Hatch", fuel: Fuel.FLEX, doors: 5, yearFrom: 2022 },
    { model: "City Hatchback", version: "Touring", segment: "Hatch", bodyType: "Hatch", fuel: Fuel.FLEX, doors: 5, yearFrom: 2022 },
    { model: "City Sedan", version: "EXL", segment: "Sedã", bodyType: "Sedã", fuel: Fuel.FLEX, doors: 4, yearFrom: 2022 },
    { model: "City Sedan", version: "Touring", segment: "Sedã", bodyType: "Sedã", fuel: Fuel.FLEX, doors: 4, yearFrom: 2022 },
    { model: "HR-V", version: "EX", segment: "SUV", bodyType: "SUV", fuel: Fuel.FLEX, doors: 5, yearFrom: 2022 },
    { model: "HR-V", version: "EXL", segment: "SUV", bodyType: "SUV", fuel: Fuel.FLEX, doors: 5, yearFrom: 2022 },
    { model: "HR-V", version: "Advance Turbo", segment: "SUV", bodyType: "SUV", fuel: Fuel.FLEX, doors: 5, yearFrom: 2022 },
    { model: "ZR-V", version: "Touring", segment: "SUV", bodyType: "SUV", fuel: Fuel.FLEX, doors: 5, yearFrom: 2024 },
    { model: "Civic", version: "e:HEV Touring", segment: "Sedã Híbrido", bodyType: "Sedã", fuel: Fuel.HYBRID, doors: 4, yearFrom: 2022 },
    { model: "CR-V", version: "Advance e:HEV", segment: "SUV Híbrido", bodyType: "SUV", fuel: Fuel.HYBRID, doors: 5, yearFrom: 2023 },
  ],
};
