"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, StatCard, Badge } from "@motora/ui";
import {
  authFetch,
  AuthError,
  type AdminOverview,
  type AdminTenant,
} from "@/lib/client-api";
import { brl } from "@/lib/format";

const REVENUE_COLORS: Record<string, string> = {
  subscriptions: "var(--brand)",
  commissions: "var(--accent)",
  featured: "var(--success)",
  advertising: "var(--platinum)",
};
const REVENUE_LABEL: Record<string, string> = {
  subscriptions: "Assinaturas",
  commissions: "Comissões",
  featured: "Destaques",
  advertising: "Publicidade",
};
const SUB_TONE: Record<string, "green" | "amber" | "red" | "muted"> = {
  ACTIVE: "green",
  TRIALING: "amber",
  PAST_DUE: "red",
  CANCELED: "red",
  NONE: "muted",
};

export default function AdminPage() {
  const router = useRouter();
  const [ov, setOv] = useState<AdminOverview | null>(null);
  const [tenants, setTenants] = useState<AdminTenant[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      authFetch<AdminOverview>("/admin/overview"),
      authFetch<AdminTenant[]>("/admin/tenants"),
    ])
      .then(([o, t]) => {
        setOv(o);
        setTenants(t);
      })
      .catch((e) => {
        if (e instanceof AuthError) router.replace("/entrar");
        else setError("Não foi possível carregar o painel administrativo");
      });
  }, [router]);

  if (error) return <p className="text-danger text-sm">{error}</p>;
  if (!ov) return <p className="text-muted text-sm">Carregando…</p>;

  const rev = ov.revenue;
  const revMax = Math.max(1, rev.total);
  const revParts = (["subscriptions", "commissions", "featured", "advertising"] as const).map((k) => ({
    key: k,
    value: rev[k],
    pct: (rev[k] / revMax) * 100,
  }));

  return (
    <div>
      <div className="mb-5">
        <p className="text-[11px] font-semibold tracking-[0.08em] uppercase text-faint">Administração da plataforma</p>
        <h1 className="text-[21px] font-semibold">Visão geral do negócio</h1>
        <p className="text-muted text-[13px] mt-0.5">Dados consolidados de todos os tenants</p>
      </div>

      <div className="grid [grid-template-columns:repeat(auto-fit,minmax(160px,1fr))] gap-3.5 mb-5">
        <StatCard label="MRR" value={brl(ov.mrr)} />
        <StatCard label="ARR" value={brl(ov.arr)} />
        <StatCard label="Lojistas ativos" value={String(ov.activeTenants)} />
        <StatCard label="Usuários (PF)" value={ov.totalUsers.toLocaleString("pt-BR")} />
        <StatCard label="Churn" value={`${(ov.churnRate * 100).toFixed(1)}%`} />
        <StatCard label="LTV estimado" value={brl(ov.ltv)} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        <Card>
          <div className="px-[18px] py-3.5 border-b border-border flex items-center justify-between">
            <h3 className="text-[15px] font-semibold">Composição da receita</h3>
            <span className="text-[13px] font-bold tabular-nums">{brl(rev.total)}</span>
          </div>
          <div className="p-[18px] flex flex-col gap-3.5">
            <div className="flex h-3 rounded-full overflow-hidden bg-surface-2">
              {revParts.map((p) =>
                p.value > 0 ? (
                  <span key={p.key} style={{ width: `${p.pct}%`, background: REVENUE_COLORS[p.key] }} />
                ) : null,
              )}
            </div>
            {revParts.map((p) => (
              <div key={p.key} className="flex items-center justify-between text-[13px]">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-[3px] inline-block" style={{ background: REVENUE_COLORS[p.key] }} />
                  {REVENUE_LABEL[p.key]}
                </span>
                <b className="tabular-nums">{brl(p.value)}</b>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="px-[18px] py-3.5 border-b border-border">
            <h3 className="text-[15px] font-semibold">Marketplace consolidado</h3>
          </div>
          <div className="p-[18px] grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-[22px] font-bold tabular-nums">{ov.catalog.vehicles.toLocaleString("pt-BR")}</div>
              <div className="text-[12px] text-muted mt-1">Veículos</div>
            </div>
            <div>
              <div className="text-[22px] font-bold tabular-nums">{ov.catalog.soldVehicles.toLocaleString("pt-BR")}</div>
              <div className="text-[12px] text-muted mt-1">Vendidos</div>
            </div>
            <div>
              <div className="text-[22px] font-bold tabular-nums">{ov.catalog.leads.toLocaleString("pt-BR")}</div>
              <div className="text-[12px] text-muted mt-1">Leads</div>
            </div>
          </div>
          <div className="px-[18px] pb-[18px]">
            <div className="flex items-center justify-between text-[13px] border-t border-border pt-3">
              <span className="text-muted">Ticket médio da assinatura</span>
              <b className="tabular-nums">{brl(ov.avgTicket)}</b>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="px-[18px] py-3.5 border-b border-border flex items-center justify-between">
          <h3 className="text-[15px] font-semibold">Lojistas</h3>
          <span className="text-[12px] text-muted">{ov.totalTenants} no total</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[13.5px]">
            <thead>
              <tr className="text-left text-[11px] font-semibold uppercase tracking-wide text-faint">
                <th className="px-[18px] py-2.5 border-b border-border">Loja</th>
                <th className="px-[18px] py-2.5 border-b border-border">Vitrine</th>
                <th className="px-[18px] py-2.5 border-b border-border">Estoque</th>
                <th className="px-[18px] py-2.5 border-b border-border">Assinatura</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((t) => (
                <tr key={t.id} className="border-b border-border last:border-0">
                  <td className="px-[18px] py-3 font-medium">{t.name}</td>
                  <td className="px-[18px] py-3 text-muted">/{t.slug}</td>
                  <td className="px-[18px] py-3 tabular-nums">{t.vehicles}</td>
                  <td className="px-[18px] py-3">
                    <Badge tone={SUB_TONE[t.subscriptionStatus] ?? "muted"}>
                      {t.subscriptionStatus === "NONE" ? "Sem assinatura" : t.subscriptionStatus}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
