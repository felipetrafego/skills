"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CMP_KEY, toggle, useBuyerList } from "@/lib/buyer-store";
import { getVehicle } from "@/lib/api";
import type { VehicleDetail } from "@/lib/types";
import { brl, km, fuelLabel, transmissionLabel } from "@/lib/format";

type Row = { label: string; get: (v: VehicleDetail) => string; highlight?: "min" | "max" };

const ROWS: Row[] = [
  { label: "Preço", get: (v) => brl(v.price), highlight: "min" },
  { label: "Ano", get: (v) => `${v.yearFab}/${v.yearModel}` },
  { label: "Quilometragem", get: (v) => km(v.mileageKm), highlight: "min" },
  { label: "Câmbio", get: (v) => transmissionLabel(v.transmission) },
  { label: "Combustível", get: (v) => fuelLabel(v.fuel) },
  { label: "Cor", get: (v) => v.color ?? "—" },
  { label: "Cidade", get: (v) => (v.city ? `${v.city}, ${v.state ?? ""}` : "—") },
  { label: "Vendedor", get: (v) => v.tenant?.name ?? "Particular" },
];

const NUM: Record<string, (v: VehicleDetail) => number> = {
  Preço: (v) => Number(v.price),
  Quilometragem: (v) => v.mileageKm,
};

export default function CompararPage() {
  const ids = useBuyerList(CMP_KEY);
  const [vehicles, setVehicles] = useState<VehicleDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    Promise.all(ids.map((id) => getVehicle(id)))
      .then((list) => {
        if (alive) setVehicles(list.filter((v): v is VehicleDetail => !!v));
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [ids]);

  return (
    <main className="max-w-[1100px] mx-auto px-6 py-8">
      <div className="text-[12.5px] text-muted mb-3">
        <Link href="/" className="hover:text-text">Marketplace</Link> › Comparar
      </div>
      <h1 className="text-[24px] font-semibold mb-6">Comparar veículos</h1>

      {loading ? (
        <p className="text-muted text-sm">Carregando…</p>
      ) : vehicles.length < 2 ? (
        <div className="border border-dashed border-border rounded-xl py-16 text-center">
          <p className="text-[15px] font-medium">Selecione ao menos 2 veículos</p>
          <p className="text-muted text-[13px] mt-1">Use o ícone de comparar (⇄) nos cards do marketplace.</p>
          <Link href="/" className="inline-block mt-4 text-brand text-[13.5px] font-medium hover:underline">Ir ao marketplace</Link>
        </div>
      ) : (
        <div className="overflow-x-auto border border-border rounded-xl">
          <table className="w-full border-collapse text-[13.5px] min-w-[560px]">
            <thead>
              <tr>
                <th className="w-[150px] p-3 text-left align-bottom border-b border-border bg-surface-2 text-[12px] uppercase tracking-wide text-faint">
                  Atributo
                </th>
                {vehicles.map((v) => (
                  <th key={v.id} className="p-3 text-left border-b border-border bg-surface-2 min-w-[170px]">
                    <div className="flex items-start justify-between gap-2">
                      <Link href={`/veiculo/${v.id}`} className="font-semibold hover:text-brand leading-snug">{v.title}</Link>
                      <button
                        onClick={() => toggle(CMP_KEY, v.id)}
                        aria-label="Remover"
                        className="text-faint hover:text-danger flex-none"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => {
                const numFn = NUM[row.label];
                let best: number | null = null;
                if (numFn && row.highlight) {
                  const vals = vehicles.map(numFn);
                  best = row.highlight === "min" ? Math.min(...vals) : Math.max(...vals);
                }
                return (
                  <tr key={row.label} className="border-b border-border last:border-0">
                    <td className="p-3 text-muted font-medium bg-surface">{row.label}</td>
                    {vehicles.map((v) => {
                      const isBest = numFn && best !== null && numFn(v) === best;
                      return (
                        <td key={v.id} className={`p-3 ${isBest ? "text-success font-semibold" : ""}`}>
                          {row.get(v)}
                          {isBest && <span className="ml-1.5 text-[10px] uppercase tracking-wide">melhor</span>}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
