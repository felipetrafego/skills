import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ThemeToggle } from "@/components/ThemeToggle";
import { VehicleCard } from "@/components/VehicleCard";
import { CompareBar } from "@/components/market/CompareBar";
import { fetchStore, searchStoreVehicles } from "@/lib/api";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const store = await fetchStore(params.slug);
  return { title: store ? `${store.name} — Motora` : "Loja — Motora" };
}

export default async function StorePage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const store = await fetchStore(params.slug);
  if (!store) notFound();

  const sort = typeof searchParams.sort === "string" ? searchParams.sort : undefined;
  const { items, total } = await searchStoreVehicles(params.slug, sort ? { sort } : {});
  const initials = store.name.slice(0, 2).toUpperCase();

  return (
    <main>
      <header className="flex items-center gap-4 px-6 py-3.5 border-b border-border bg-surface">
        <Link href="/" className="flex items-center gap-2 font-bold text-[15px] tracking-tight">
          <span className="w-[26px] h-[26px] rounded-lg grid place-items-center bg-brand text-white">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 13l1.5-4.5A2 2 0 0 1 8.4 7h7.2a2 2 0 0 1 1.9 1.5L19 13" />
              <path d="M5 13h14v4H5z" />
            </svg>
          </span>
          Motora
        </Link>
        <div className="ml-auto flex items-center gap-2.5">
          <ThemeToggle />
          <Link href="/" className="text-[13px] text-muted hover:text-text">Ver marketplace</Link>
        </div>
      </header>

      {/* Banner da loja */}
      <div className="border-b border-border" style={{ background: "linear-gradient(120deg,var(--brand-tint),transparent)" }}>
        <div className="max-w-[1240px] mx-auto px-6 py-8 flex items-center gap-5 flex-wrap">
          <span className="w-16 h-16 rounded-2xl grid place-items-center text-white text-[22px] font-bold flex-none" style={{ background: "linear-gradient(135deg,#0d1017,#33405c)" }}>
            {initials}
          </span>
          <div className="flex-1 min-w-[220px]">
            <div className="flex items-center gap-2.5">
              <h1 className="text-[26px] font-semibold tracking-tight">{store.name}</h1>
              <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-brand bg-brand-tint rounded-full px-2.5 py-1">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
                Loja verificada
              </span>
            </div>
            <p className="text-muted text-[13.5px] mt-1.5">
              {store.activeVehicles} {store.activeVehicles === 1 ? "veículo disponível" : "veículos disponíveis"} · vitrine oficial na Motora
            </p>
          </div>
          <a href="#estoque" className="rounded-[10px] bg-brand hover:bg-brand-strong text-white px-5 py-2.5 text-[13.5px] font-medium transition-colors">
            Ver estoque
          </a>
        </div>
      </div>

      {/* Estoque da loja */}
      <section id="estoque" className="max-w-[1240px] mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[18px] font-semibold">Estoque</h2>
          <span className="text-[13px] text-muted"><b className="text-text tabular-nums">{total}</b> veículo(s)</span>
        </div>

        {items.length === 0 ? (
          <div className="border border-dashed border-border rounded-xl py-16 text-center">
            <p className="text-[15px] font-medium">Esta loja ainda não tem veículos publicados</p>
            <Link href="/" className="inline-block mt-3 text-brand text-[13.5px] font-medium hover:underline">Ver outros anúncios</Link>
          </div>
        ) : (
          <div className="grid gap-[18px] [grid-template-columns:repeat(auto-fill,minmax(232px,1fr))]">
            {items.map((v) => (
              <VehicleCard key={v.id} v={v} />
            ))}
          </div>
        )}
      </section>

      <CompareBar />
    </main>
  );
}
