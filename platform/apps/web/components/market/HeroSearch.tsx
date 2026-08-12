"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchMakes } from "@/lib/client-api";
import { buildQuery, type SP } from "@/lib/query";

const PRICE_PRESETS: [string, string][] = [
  ["", "Qualquer preço"],
  ["50000", "Até R$ 50 mil"],
  ["90000", "Até R$ 90 mil"],
  ["150000", "Até R$ 150 mil"],
  ["300000", "Até R$ 300 mil"],
];

export function HeroSearch({ sp }: { sp: SP }) {
  const router = useRouter();
  const [makes, setMakes] = useState<{ make: string }[]>([]);
  const [q, setQ] = useState(sp.q ?? "");
  const [make, setMake] = useState(sp.make ?? "");
  const [maxPrice, setMaxPrice] = useState(sp.maxPrice ?? "");

  useEffect(() => {
    fetchMakes().then(setMakes).catch(() => setMakes([]));
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    router.push(buildQuery(sp, { q, make, maxPrice }));
  }

  const cell = "flex-1 min-w-[140px] flex flex-col gap-1 px-2.5 py-1";
  const cap = "text-[11px] font-semibold tracking-[0.05em] uppercase text-faint";
  const ctrl = "bg-transparent text-[14px] font-medium text-text outline-none";

  return (
    <form onSubmit={submit} className="flex gap-2.5 flex-wrap mt-5 bg-surface border border-border rounded-2xl p-3 shadow-md max-w-[840px]">
      <label className={cell}>
        <span className={cap}>Busca</span>
        <input className={ctrl} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Modelo, versão…" />
      </label>
      <label className={`${cell} border-l border-border`}>
        <span className={cap}>Marca</span>
        <select className={`${ctrl} cursor-pointer`} value={make} onChange={(e) => setMake(e.target.value)}>
          <option value="">Todas</option>
          {makes.map((m) => (
            <option key={m.make} value={m.make}>{m.make}</option>
          ))}
        </select>
      </label>
      <label className={`${cell} border-l border-border`}>
        <span className={cap}>Faixa de preço</span>
        <select className={`${ctrl} cursor-pointer`} value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}>
          {PRICE_PRESETS.map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </label>
      <button type="submit" className="self-stretch px-6 rounded-xl bg-brand hover:bg-brand-strong text-white font-medium text-[14px] flex items-center gap-2 transition-colors">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" /></svg>
        Buscar
      </button>
    </form>
  );
}
