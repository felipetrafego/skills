import { Fuel, type MakeCatalog } from "./types";

export const HYUNDAI: MakeCatalog = {
  make: "Hyundai",
  entries: [
    { model: "HB20", version: "Sense 1.0", segment: "Hatch", bodyType: "Hatch", fuel: Fuel.FLEX, doors: 5, yearFrom: 2020 },
    { model: "HB20", version: "Comfort 1.0", segment: "Hatch", bodyType: "Hatch", fuel: Fuel.FLEX, doors: 5, yearFrom: 2020 },
    { model: "HB20", version: "Platinum Turbo", segment: "Hatch", bodyType: "Hatch", fuel: Fuel.FLEX, doors: 5, yearFrom: 2020 },
    { model: "HB20S", version: "Comfort 1.0", segment: "Sedã", bodyType: "Sedã", fuel: Fuel.FLEX, doors: 4, yearFrom: 2020 },
    { model: "HB20S", version: "Platinum Turbo", segment: "Sedã", bodyType: "Sedã", fuel: Fuel.FLEX, doors: 4, yearFrom: 2020 },
    { model: "Creta", version: "Comfort 1.0 Turbo", segment: "SUV", bodyType: "SUV", fuel: Fuel.FLEX, doors: 5, yearFrom: 2022 },
    { model: "Creta", version: "Limited 1.0 Turbo", segment: "SUV", bodyType: "SUV", fuel: Fuel.FLEX, doors: 5, yearFrom: 2022 },
    { model: "Creta", version: "N Line Turbo", segment: "SUV Esportivo", bodyType: "SUV", fuel: Fuel.FLEX, doors: 5, yearFrom: 2023 },
    { model: "Creta", version: "Ultimate 2.0", segment: "SUV", bodyType: "SUV", fuel: Fuel.FLEX, doors: 5, yearFrom: 2022 },
  ],
};
