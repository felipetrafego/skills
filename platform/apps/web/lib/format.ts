export function brl(value: string | number): string {
  const n = typeof value === "string" ? Number(value) : value;
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

export function km(value: number): string {
  return `${value.toLocaleString("pt-BR")} km`;
}

const FUEL: Record<string, string> = {
  FLEX: "Flex",
  GASOLINE: "Gasolina",
  ETHANOL: "Etanol",
  DIESEL: "Diesel",
  ELECTRIC: "Elétrico",
  HYBRID: "Híbrido",
  GNV: "GNV",
};

const TRANSMISSION: Record<string, string> = {
  MANUAL: "Manual",
  AUTOMATIC: "Automático",
  CVT: "CVT",
  AUTOMATED: "Automatizado",
};

export const fuelLabel = (f: string) => FUEL[f] ?? f;
export const transmissionLabel = (t: string) => TRANSMISSION[t] ?? t;
