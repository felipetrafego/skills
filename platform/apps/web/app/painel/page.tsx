"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, StatCard, Badge } from "@motora/ui";
import { authFetch, AuthError, type DashboardSummary } from "@/lib/client-api";
import { brl } from "@/lib/format";

const SOURCE_LABEL: Record<string, string> = {
  MARKETPLACE: "Marketplace",
  WHATSAPP: "WhatsApp",
  ADS: "Anúncios",
  LANDING: "Landing page",
  MANUAL: "Manual",
};
const STAGE_LABEL: Record<string, string> = {
  NEW: "Novo",
  CONTACTED: "Contatado",
  VISIT: "Visita",
  PROPOSAL: "Proposta",
  NEGOTIATION: "Negociação",
  WON: "Ganho",
  LOST: "Perdido",
};

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    authFetch<DashboardSummary>("/dashboard/summary")
      .then(setData)
      .catch((e) => {
        if (e instanceof AuthError) router.replace("/entrar");
        else setError("Não foi possível carregar o dashboard");
      });
  }, [router]);

  if (error) return <p className="text-danger text-sm">{error}</p>;
  if (!data) return <DashboardSkeleton />;

  const k = data.kpis;
  const funnelMax = Math.max(1, ...data.funnel.map((f) => f.count));
  const sourceTotal = Math.max(1, data.leadsBySource.reduce((s, r) => s + r.count, 0));

  return (
    <div>
      <div className="mb-5">
        <p className="text-[11px] font-semibold tracking-[0.08em] uppercase text-faint">Painel do Lojista</p>
        <h1 className="text-[21px] font-semibold">Dashboard</h1>
        <p className="text-muted text-[13px] mt-0.5">Resumo do mês · dados em tempo real da sua loja</p>
      </div>

      <div className="grid [grid-template-columns:repeat(auto-fit,minmax(165px,1fr))] gap-3.5 mb-5">
        <StatCard label="Novos leads" value={String(k.leads)} trend="flat" />
        <StatCard label="Visualizações" value={k.views.toLocaleString("pt-BR")} trend="flat" />
        <StatCard label="Estoque ativo" value={String(k.activeVehicles)} trend="flat" />
        <StatCard label="Vendas no mês" value={String(k.sold)} trend="flat" />
        <StatCard label="Conversão" value={`${(k.conversion * 100).toFixed(1)}%`} trend="flat" />
        <StatCard label="Receita (ganhos)" value={brl(k.revenue)} trend="flat" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center justify-between px-[18px] py-3.5 border-b border-border">
            <h3 className="text-[15px] font-semibold">Funil de vendas</h3>
            <Badge tone="muted">{data.funnel.reduce((s, f) => s + f.count, 0)} negociações</Badge>
          </div>
          <div className="p-[18px] flex flex-col gap-2">
            {data.funnel.length === 0 && <EmptyLine text="Sem negociações ainda" />}
            {data.funnel.map((f) => (
              <div key={f.stage} className="flex items-center gap-3">
                <div
                  className="h-9 rounded-[9px] flex items-center px-3 text-white text-[13px] font-semibold min-w-[60px]"
                  style={{ width: `${Math.max(18, (f.count / funnelMax) * 100)}%`, background: "linear-gradient(90deg,var(--brand),var(--brand-strong))" }}
                >
                  {STAGE_LABEL[f.stage] ?? f.stage}
                </div>
                <span className="text-[12.5px] text-muted tabular-nums">{f.count}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between px-[18px] py-3.5 border-b border-border">
            <h3 className="text-[15px] font-semibold">Origem dos leads</h3>
          </div>
          <div className="p-[18px] flex flex-col gap-3">
            {data.leadsBySource.length === 0 && <EmptyLine text="Sem leads no período" />}
            {data.leadsBySource.map((r) => (
              <div key={r.source}>
                <div className="flex items-center justify-between text-[13px] mb-1">
                  <span>{SOURCE_LABEL[r.source] ?? r.source}</span>
                  <b className="tabular-nums">{r.count}</b>
                </div>
                <div className="h-2 rounded-full bg-surface-2 overflow-hidden">
                  <span className="block h-full rounded-full bg-brand" style={{ width: `${(r.count / sourceTotal) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function EmptyLine({ text }: { text: string }) {
  return <p className="text-muted text-[13px] py-4 text-center">{text}</p>;
}

function DashboardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-6 w-40 bg-surface-2 rounded mb-5" />
      <div className="grid [grid-template-columns:repeat(auto-fit,minmax(165px,1fr))] gap-3.5 mb-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-24 bg-surface-2 rounded-lg" />
        ))}
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="h-64 bg-surface-2 rounded-lg" />
        <div className="h-64 bg-surface-2 rounded-lg" />
      </div>
    </div>
  );
}
