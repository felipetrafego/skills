import { Fuel, type MakeCatalog } from "./types";

export const FIAT: MakeCatalog = {
  make: "Fiat",
  entries: [
    { model: "Mobi", version: "Like", segment: "Hatch", bodyType: "Hatch", fuel: Fuel.FLEX, doors: 5, yearFrom: 2021 },
    { model: "Argo", version: "Drive 1.0", segment: "Hatch", bodyType: "Hatch", fuel: Fuel.FLEX, doors: 5, yearFrom: 2020 },
    { model: "Argo", version: "Trekking 1.3", segment: "Hatch Aventureiro", bodyType: "Hatch", fuel: Fuel.FLEX, doors: 5, yearFrom: 2020 },
    { model: "Cronos", version: "Drive 1.3", segment: "Sedã", bodyType: "Sedã", fuel: Fuel.FLEX, doors: 4, yearFrom: 2020 },
    { model: "Cronos", version: "Precision 1.3", segment: "Sedã", bodyType: "Sedã", fuel: Fuel.FLEX, doors: 4, yearFrom: 2020 },
    { model: "Pulse", version: "Drive 1.3", segment: "SUV", bodyType: "SUV", fuel: Fuel.FLEX, doors: 5, yearFrom: 2021 },
    { model: "Pulse", version: "Impetus Turbo 200", segment: "SUV", bodyType: "SUV", fuel: Fuel.FLEX, doors: 5, yearFrom: 2021 },
    { model: "Pulse", version: "Abarth Turbo 270", segment: "SUV Esportivo", bodyType: "SUV", fuel: Fuel.FLEX, doors: 5, yearFrom: 2023 },
    { model: "Fastback", version: "Audace Turbo 200", segment: "SUV Coupé", bodyType: "SUV Coupé", fuel: Fuel.FLEX, doors: 5, yearFrom: 2022 },
    { model: "Fastback", version: "Abarth Turbo 270", segment: "SUV Coupé Esportivo", bodyType: "SUV Coupé", fuel: Fuel.FLEX, doors: 5, yearFrom: 2023 },
    { model: "Strada", version: "Endurance 1.4", segment: "Picape", bodyType: "Picape", fuel: Fuel.FLEX, doors: 2, yearFrom: 2020 },
    { model: "Strada", version: "Volcano 1.3", segment: "Picape", bodyType: "Picape", fuel: Fuel.FLEX, doors: 4, yearFrom: 2020 },
    { model: "Strada", version: "Ranch 1.3 Turbo", segment: "Picape", bodyType: "Picape", fuel: Fuel.FLEX, doors: 4, yearFrom: 2022 },
    { model: "Toro", version: "Freedom 1.3 Turbo", segment: "Picape", bodyType: "Picape", fuel: Fuel.FLEX, doors: 4, yearFrom: 2022 },
    { model: "Toro", version: "Volcano 2.0 Diesel 4x4", segment: "Picape", bodyType: "Picape", fuel: Fuel.DIESEL, doors: 4, yearFrom: 2022 },
    { model: "Toro", version: "Ultra 2.0 Diesel 4x4", segment: "Picape", bodyType: "Picape", fuel: Fuel.DIESEL, doors: 4, yearFrom: 2022 },
  ],
};
