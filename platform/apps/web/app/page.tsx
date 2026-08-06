import { Button } from "@motora/ui";
import { ThemeToggle } from "@/components/ThemeToggle";
import { VehicleCard } from "@/components/VehicleCard";
import { searchVehicles } from "@/lib/api";

export default async function MarketplacePage() {
  const { items, total } = await searchVehicles();

  return (
    <main>
      {/* Header */}
      <header className="flex items-center gap-4 px-6 py-3.5 border-b border-border bg-surface">
        <div className="flex items-center gap-2 font-bold text-[15px] tracking-tight">
          <span className="w-[26px] h-[26px] rounded-lg grid place-items-center bg-brand text-white">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 13l1.5-4.5A2 2 0 0 1 8.4 7h7.2a2 2 0 0 1 1.9 1.5L19 13" />
              <path d="M5 13h14v4H5z" />
            </svg>
          </span>
          Motora
        </div>
        <nav className="hidden md:flex gap-1 ml-2 text-[13.5px] text-muted">
          <a className="px-3 py-1.5 rounded-lg hover:bg-surface-2 hover:text-text" href="#">Comprar</a>
          <a className="px-3 py-1.5 rounded-lg hover:bg-surface-2 hover:text-text" href="#">Vender grátis</a>
          <a className="px-3 py-1.5 rounded-lg hover:bg-surface-2 hover:text-text" href="#">Lojas</a>
        </nav>
        <div className="ml-auto flex items-center gap-2.5">
          <ThemeToggle />
          <Button variant="ghost" size="sm">Entrar</Button>
          <Button size="sm">Anunciar grátis</Button>
        </div>
      </header>

      {/* Hero */}
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
      </section>

      {/* Resultados */}
      <section className="max-w-[1240px] mx-auto px-6 pb-16">
        <div className="flex items-center justify-between mb-4">
          <div className="text-[14px]">
            <b className="tabular-nums">{total.toLocaleString("pt-BR")}</b>{" "}
            <span className="text-muted">veículos encontrados</span>
          </div>
        </div>
        <div className="grid gap-[18px] [grid-template-columns:repeat(auto-fill,minmax(232px,1fr))]">
          {items.map((v) => (
            <VehicleCard key={v.id} v={v} />
          ))}
        </div>
      </section>
    </main>
  );
}
