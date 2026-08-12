import Link from "next/link";
import { ButtonLink } from "@/components/ButtonLink";
import { ThemeToggle } from "@/components/ThemeToggle";
import { VehicleCard } from "@/components/VehicleCard";
import { HeroSearch } from "@/components/market/HeroSearch";
import { Filters } from "@/components/market/Filters";
import { CompareBar } from "@/components/market/CompareBar";
import { SponsoredBanner } from "@/components/market/SponsoredBanner";
import { searchVehicles } from "@/lib/api";
import { normalizeSearchParams } from "@/lib/query";

const API_KEYS = ["q", "make", "model", "minPrice", "maxPrice", "fuel", "transmission", "minYear", "sort", "page"];

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const sp = normalizeSearchParams(searchParams);
  const apiParams: Record<string, string> = {};
  for (const k of API_KEYS) if (sp[k]) apiParams[k] = sp[k];

  const { items, total } = await searchVehicles(apiParams);

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
        <nav className="hidden md:flex gap-1 ml-2 text-[13.5px] text-muted">
          <Link className="px-3 py-1.5 rounded-lg hover:bg-surface-2 hover:text-text" href="/">Comprar</Link>
          <Link className="px-3 py-1.5 rounded-lg hover:bg-surface-2 hover:text-text" href="/favoritos">Favoritos</Link>
          <Link className="px-3 py-1.5 rounded-lg hover:bg-surface-2 hover:text-text" href="/cadastro">Vender grátis</Link>
        </nav>
        <div className="ml-auto flex items-center gap-2.5">
          <ThemeToggle />
          <ButtonLink href="/entrar" variant="ghost" size="sm">Entrar</ButtonLink>
          <ButtonLink href="/cadastro" size="sm">Anunciar grátis</ButtonLink>
        </div>
      </header>

      <section className="max-w-[1240px] mx-auto px-6 pt-10 pb-6">
        <p className="text-[11px] font-semibold tracking-[0.08em] uppercase text-faint">
          O maior ecossistema automotivo do Brasil
        </p>
        <h1 className="text-[38px] font-semibold tracking-tight max-w-[15ch] mt-2">
          Encontre o carro certo. Ou venda o seu de graça.
        </h1>
        <p className="text-muted text-[16px] mt-3 max-w-[52ch]">
          Milhares de veículos de lojistas verificados e vendedores particulares — com busca
          inteligente, comparador e recomendações por IA.
        </p>
        <HeroSearch sp={sp} />
      </section>

      <section className="max-w-[1240px] mx-auto px-6 pb-4">
        <SponsoredBanner placement="HOME" />
      </section>

      <section className="max-w-[1240px] mx-auto px-6 pb-16 grid md:grid-cols-[236px_1fr] gap-7">
        <Filters sp={sp} />
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="text-[14px]">
              <b className="tabular-nums">{total.toLocaleString("pt-BR")}</b>{" "}
              <span className="text-muted">{total === 1 ? "veículo encontrado" : "veículos encontrados"}</span>
            </div>
          </div>

          {items.length === 0 ? (
            <div className="border border-dashed border-border rounded-xl py-16 grid place-items-center text-center">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="text-faint mb-3">
                <circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" />
              </svg>
              <p className="text-[15px] font-medium">Nenhum veículo com esses filtros</p>
              <p className="text-muted text-[13px] mt-1">Tente ampliar a busca ou limpar os filtros.</p>
              <Link href="/" className="mt-4 text-brand text-[13.5px] font-medium hover:underline">Limpar filtros</Link>
            </div>
          ) : (
            <div className="grid gap-[18px] [grid-template-columns:repeat(auto-fill,minmax(232px,1fr))]">
              {items.map((v) => (
                <VehicleCard key={v.id} v={v} />
              ))}
            </div>
          )}
        </div>
      </section>

      <CompareBar />
    </main>
  );
}
