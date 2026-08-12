import { Fuel, type MakeCatalog } from "./types";

export const TOYOTA: MakeCatalog = {
  make: "Toyota",
  entries: [
    { model: "Yaris", version: "XL Plus", segment: "Hatch", bodyType: "Hatch", fuel: Fuel.FLEX, doors: 5, yearFrom: 2019 },
    { model: "Yaris", version: "XLS Connect Sedan", segment: "Sedã", bodyType: "Sedã", fuel: Fuel.FLEX, doors: 4, yearFrom: 2019 },
    { model: "Corolla", version: "XEi 2.0", segment: "Sedã", bodyType: "Sedã", fuel: Fuel.FLEX, doors: 4, yearFrom: 2020 },
    { model: "Corolla", version: "Altis Premium Hybrid", segment: "Sedã Híbrido", bodyType: "Sedã", fuel: Fuel.HYBRID, doors: 4, yearFrom: 2020 },
    { model: "Corolla", version: "GR-Sport", segment: "Sedã Esportivo", bodyType: "Sedã", fuel: Fuel.FLEX, doors: 4, yearFrom: 2022 },
    { model: "Corolla Cross", version: "XRE", segment: "SUV", bodyType: "SUV", fuel: Fuel.FLEX, doors: 5, yearFrom: 2021 },
    { model: "Corolla Cross", version: "XRX Hybrid", segment: "SUV Híbrido", bodyType: "SUV", fuel: Fuel.HYBRID, doors: 5, yearFrom: 2021 },
    { model: "Corolla Cross", version: "GR-Sport", segment: "SUV Esportivo", bodyType: "SUV", fuel: Fuel.HYBRID, doors: 5, yearFrom: 2022 },
    { model: "Hilux", version: "SR 2.8 Diesel 4x4", segment: "Picape", bodyType: "Picape", fuel: Fuel.DIESEL, doors: 4, yearFrom: 2021 },
    { model: "Hilux", version: "SRV 2.8 Diesel 4x4", segment: "Picape", bodyType: "Picape", fuel: Fuel.DIESEL, doors: 4, yearFrom: 2021 },
    { model: "Hilux", version: "SRX 2.8 Diesel 4x4", segment: "Picape", bodyType: "Picape", fuel: Fuel.DIESEL, doors: 4, yearFrom: 2021 },
    { model: "Hilux", version: "GR-Sport 2.8 Diesel", segment: "Picape Esportiva", bodyType: "Picape", fuel: Fuel.DIESEL, doors: 4, yearFrom: 2022 },
    { model: "SW4", version: "SRX 2.8 Diesel 7 lugares", segment: "SUV", bodyType: "SUV", fuel: Fuel.DIESEL, doors: 5, yearFrom: 2021 },
    { model: "RAV4", version: "SX Connect Hybrid", segment: "SUV Híbrido", bodyType: "SUV", fuel: Fuel.HYBRID, doors: 5, yearFrom: 2022 },
    { model: "Camry", version: "XSE Hybrid", segment: "Sedã Híbrido", bodyType: "Sedã", fuel: Fuel.HYBRID, doors: 4, yearFrom: 2023 },
  ],
};
