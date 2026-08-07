import { Fuel, type MakeCatalog } from "./types";

export const CHEVROLET: MakeCatalog = {
  make: "Chevrolet",
  entries: [
    { model: "Onix", version: "1.0 LT", segment: "Hatch", bodyType: "Hatch", fuel: Fuel.FLEX, doors: 5, yearFrom: 2020 },
    { model: "Onix", version: "RS Turbo", segment: "Hatch Esportivo", bodyType: "Hatch", fuel: Fuel.FLEX, doors: 5, yearFrom: 2022 },
    { model: "Onix Plus", version: "LTZ Turbo", segment: "Sedã", bodyType: "Sedã", fuel: Fuel.FLEX, doors: 4, yearFrom: 2020 },
    { model: "Onix Plus", version: "Premier Turbo", segment: "Sedã", bodyType: "Sedã", fuel: Fuel.FLEX, doors: 4, yearFrom: 2020 },
    { model: "Tracker", version: "1.0 Turbo LT", segment: "SUV", bodyType: "SUV", fuel: Fuel.FLEX, doors: 5, yearFrom: 2021 },
    { model: "Tracker", version: "Premier Turbo", segment: "SUV", bodyType: "SUV", fuel: Fuel.FLEX, doors: 5, yearFrom: 2021 },
    { model: "Tracker", version: "RS Turbo", segment: "SUV Esportivo", bodyType: "SUV", fuel: Fuel.FLEX, doors: 5, yearFrom: 2023 },
    { model: "Montana", version: "1.2 Turbo LT", segment: "Picape", bodyType: "Picape", fuel: Fuel.FLEX, doors: 4, yearFrom: 2023 },
    { model: "Montana", version: "Premier Turbo", segment: "Picape", bodyType: "Picape", fuel: Fuel.FLEX, doors: 4, yearFrom: 2023 },
    { model: "Spin", version: "1.8 LTZ", segment: "Minivan", bodyType: "Minivan", fuel: Fuel.FLEX, doors: 5, yearFrom: 2019 },
    { model: "Spin", version: "Activ", segment: "Minivan", bodyType: "Minivan", fuel: Fuel.FLEX, doors: 5, yearFrom: 2019 },
    { model: "S10", version: "LTZ 2.8 Diesel 4x4", segment: "Picape", bodyType: "Picape", fuel: Fuel.DIESEL, doors: 4, yearFrom: 2021 },
    { model: "S10", version: "High Country Diesel", segment: "Picape", bodyType: "Picape", fuel: Fuel.DIESEL, doors: 4, yearFrom: 2021 },
    { model: "Trailblazer", version: "Premier 2.8 Diesel", segment: "SUV", bodyType: "SUV", fuel: Fuel.DIESEL, doors: 5, yearFrom: 2021 },
    { model: "Equinox", version: "RS Turbo", segment: "SUV", bodyType: "SUV", fuel: Fuel.GASOLINE, doors: 5, yearFrom: 2023 },
  ],
};
