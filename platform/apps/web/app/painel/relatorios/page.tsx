"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, StatCard, Button, Badge } from "@motora/ui";
import { fetchReport, downloadCsv, AuthError, type ReportSummary } from "@/lib/client-api";
import { brl } from "@/lib/format";

const SOURCE_LABEL: Record<string, string> = { MARKETPLACE: "Marketplace", WHATSAPP: "WhatsApp", ADS: "Anúncios", LANDING: "Landing page", MANUAL: "Manual" };
const STAGE_LABEL: Record<string, string> = { NEW: "Novo", CONTACTED: "Contatado", VISIT: "Visita", PROPOSAL: "Proposta", NEGOTIATION: "Negociação", WON: "Ganho", LOST: "Perdido" };

export default function RelatoriosPage() {
  const router = useRouter();
  const [data, setData] = useState<ReportSummary | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    fetchReport().then(setData).catch((e) => e instanceof AuthError && router.replace("/entrar"));
  }, [router]);

  async function exportCsv(type: "leads" | "deals") {
    setBusy(type);
    try {
      await downloadCsv(type, `motora-${type}-${new Date().toISOString().slice(0, 10)}.csv`);
    } catch (e) {
      if (e instanceof AuthError) router.replace("/entrar");
    } finally {
      setBusy(null);
    }
  }

  if (!data) return <p className="text-muted text-sm">Carregando…</p>;
  const k = data.kpis;

  return (
    <div id="report">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.08em] uppercase text-faint">Relatórios</p>
          <h1 className="text-[21px] font-semibold">Desempenho da loja</h1>
          <p className="text-muted text-[13px] mt-0.5">Leads, conversão e vendas — com exportação.</p>
        </div>
        <div className="flex gap-2 no-print">
          <Button size="sm" variant="ghost" loading={busy === "leads"} onClick={() => exportCsv("leads")}>Exportar leads (Excel)</Button>
          <Button size="sm" variant="ghost" loading={busy === "deals"} onClick={() => exportCsv("deals")}>Exportar negociações</Button>
          <Button size="sm" onClick={() => window.print()}>Imprimir / PDF</Button>
        </div>
      </div>

      <div className="grid [grid-template-columns:repeat(auto-fit,minmax(155px,1fr))] gap-3.5 mb-5">
        <StatCard label="Leads" value={String(k.leads)} />
        <StatCard label="Vendas" value={String(k.sales)} />
        <StatCard label="Veículos vendidos" value={String(k.sold)} />
        <StatCard label="Conversão" value={`${(k.conversion * 100).toFixed(1)}%`} />
        <StatCard label="Receita" value={brl(k.revenue)} />
        <StatCard label="Ticket médio" value={brl(k.avgTicket)} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        <Card>
          <div className="px-[18px] py-3.5 border-b border-border"><h3 className="text-[15px] font-semibold">Origem dos leads</h3></div>
          <table className="w-full text-[13.5px]">
            <tbody>
              {data.leadsBySource.length === 0 && <tr><td className="px-[18px] py-3 text-muted">Sem leads.</td></tr>}
              {data.leadsBySource.map((r) => (
                <tr key={r.source} className="border-b border-border last:border-0">
                  <td className="px-[18px] py-2.5">{SOURCE_LABEL[r.source] ?? r.source}</td>
                  <td className="px-[18px] py-2.5 text-right font-semibold tabular-nums">{r.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        <Card>
          <div className="px-[18px] py-3.5 border-b border-border"><h3 className="text-[15px] font-semibold">Negociações por estágio</h3></div>
          <table className="w-full text-[13.5px]">
            <tbody>
              {data.dealsByStage.length === 0 && <tr><td className="px-[18px] py-3 text-muted">Sem negociações.</td></tr>}
              {data.dealsByStage.map((r) => (
                <tr key={r.stage} className="border-b border-border last:border-0">
                  <td className="px-[18px] py-2.5">{STAGE_LABEL[r.stage] ?? r.stage}</td>
                  <td className="px-[18px] py-2.5 text-right font-semibold tabular-nums">{r.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      <Card>
        <div className="px-[18px] py-3.5 border-b border-border"><h3 className="text-[15px] font-semibold">Veículos mais vistos</h3></div>
        <table className="w-full text-[13.5px]">
          <thead>
            <tr className="text-left text-[11px] font-semibold uppercase tracking-wide text-faint">
              <th className="px-[18px] py-2.5 border-b border-border">Veículo</th>
              <th className="px-[18px] py-2.5 border-b border-border">Views</th>
              <th className="px-[18px] py-2.5 border-b border-border">Leads</th>
              <th className="px-[18px] py-2.5 border-b border-border">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.topVehicles.map((v, i) => (
              <tr key={i} className="border-b border-border last:border-0">
                <td className="px-[18px] py-2.5 font-medium">{v.title}</td>
                <td className="px-[18px] py-2.5 tabular-nums">{v.views}</td>
                <td className="px-[18px] py-2.5 tabular-nums">{v.leadsCount}</td>
                <td className="px-[18px] py-2.5"><Badge tone={v.status === "ACTIVE" ? "green" : v.status === "SOLD" ? "muted" : "amber"}>{v.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
