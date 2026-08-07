"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { buildQuery, type SP } from "@/lib/query";

const FUELS: [string, string][] = [
  ["FLEX", "Flex"], ["GASOLINE", "Gasolina"], ["DIESEL", "Diesel"],
  ["HYBRID", "Híbrido"], ["ELECTRIC", "Elétrico"],
];
const TRANSMISSIONS: [string, string][] = [
  ["AUTOMATIC", "Automático"], ["MANUAL", "Manual"], ["CVT", "CVT"],
];

export function Filters({ sp }: { sp: SP }) {
  const router = useRouter();
  const go = (changes: Record<string, string>) => router.push(buildQuery(sp, changes));
  // clicar de novo no valor ativo remove o filtro (toggle)
  const toggle = (key: string, value: string) => go({ [key]: sp[key] === value ? "" : value });

  const hasFilters = ["make", "q", "fuel", "transmission", "maxPrice", "minPrice"].some((k) => sp[k]);

  const opt = (active: boolean) =>
    `flex items-center gap-2.5 py-1.5 text-[13.5px] cursor-pointer transition-colors ${active ? "text-text font-medium" : "text-muted hover:text-text"}`;
  const box = (active: boolean) =>
    `w-[17px] h-[17px] rounded-[5px] border flex-none grid place-items-center ${active ? "bg-brand border-brand" : "border-border-strong"}`;

  return (
    <aside className="flex flex-col gap-5 sticky top-[74px] self-start">
      <div className="flex items-center justify-between">
        <h4 className="text-[13px] font-semibold">Filtros</h4>
        {hasFilters && (
          <Link href="/" className="text-[12px] text-brand hover:underline">Limpar</Link>
        )}
      </div>

      <FilterGroup title="Combustível">
        {FUELS.map(([v, l]) => {
          const active = sp.fuel === v;
          return (
            <div key={v} className={opt(active)} onClick={() => toggle("fuel", v)}>
              <span className={box(active)}>
                {active && (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                )}
              </span>
              {l}
            </div>
          );
        })}
      </FilterGroup>

      <FilterGroup title="Câmbio">
        {TRANSMISSIONS.map(([v, l]) => {
          const active = sp.transmission === v;
          return (
            <div key={v} className={opt(active)} onClick={() => toggle("transmission", v)}>
              <span className={box(active)}>
                {active && (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                )}
              </span>
              {l}
            </div>
          );
        })}
      </FilterGroup>

      <FilterGroup title="Ordenar">
        <select
          className="w-full bg-surface border border-border rounded-[10px] px-3 py-2 text-[13.5px] text-text outline-none focus:border-brand cursor-pointer"
          value={sp.sort ?? "relevance"}
          onChange={(e) => go({ sort: e.target.value === "relevance" ? "" : e.target.value })}
        >
          <option value="relevance">Relevância</option>
          <option value="price_asc">Menor preço</option>
          <option value="price_desc">Maior preço</option>
          <option value="newest">Mais recentes</option>
        </select>
      </FilterGroup>
    </aside>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-[12.5px] font-semibold mb-2">{title}</h4>
      {children}
    </div>
  );
}
