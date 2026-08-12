"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Badge } from "@motora/ui";
import {
  authFetch,
  authPost,
  fetchFinanceSummary,
  AuthError,
  type SubscriptionInfo,
  type InvoiceItem,
  type FinanceSummary,
} from "@/lib/client-api";
import { brl } from "@/lib/format";

const STATE_LABEL: Record<string, string> = {
  NONE: "Sem assinatura",
  TRIALING: "Em teste",
  ACTIVE: "Ativa",
  PAST_DUE: "Pagamento pendente",
  CANCELED: "Cancelada",
};
const STATE_TONE: Record<string, "green" | "amber" | "red" | "muted"> = {
  NONE: "muted",
  TRIALING: "amber",
  ACTIVE: "green",
  PAST_DUE: "red",
  CANCELED: "red",
};
const METHOD_LABEL: Record<string, string> = { PIX: "PIX", CARD: "Cartão", BOLETO: "Boleto" };

function fmtDate(d: string | null) {
  return d ? new Date(d).toLocaleDateString("pt-BR") : "—";
}

export default function FinanceiroPage() {
  const router = useRouter();
  const [sub, setSub] = useState<SubscriptionInfo | null>(null);
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      const [s, inv, sum] = await Promise.all([
        authFetch<SubscriptionInfo>("/billing/subscription"),
        authFetch<InvoiceItem[]>("/billing/invoices"),
        fetchFinanceSummary(),
      ]);
      setSub(s);
      setInvoices(inv);
      setSummary(sum);
    } catch (e) {
      if (e instanceof AuthError) router.replace("/entrar");
      else setError("Não foi possível carregar o financeiro");
    }
  }, [router]);

  useEffect(() => {
    void reload();
  }, [reload]);

  async function subscribe(method: string) {
    setBusy(true);
    try {
      await authPost("/billing/subscribe", { paymentMethod: method });
      await reload();
    } catch (e) {
      if (e instanceof AuthError) router.replace("/entrar");
    } finally {
      setBusy(false);
    }
  }

  async function pay(id: string) {
    setBusy(true);
    try {
      await authPost(`/billing/invoices/${id}/pay`, {});
      await reload();
    } catch (e) {
      if (e instanceof AuthError) router.replace("/entrar");
    } finally {
      setBusy(false);
    }
  }

  if (error) return <p className="text-danger text-sm">{error}</p>;
  if (!sub) return <p className="text-muted text-sm">Carregando…</p>;

  return (
    <div className="max-w-[820px]">
      <div className="mb-5">
        <p className="text-[11px] font-semibold tracking-[0.08em] uppercase text-faint">Financeiro</p>
        <h1 className="text-[21px] font-semibold">Assinatura e faturas</h1>
        <p className="text-muted text-[13px] mt-0.5">Gerencie o plano da sua loja e o histórico de pagamentos.</p>
      </div>

      {/* KPIs financeiros (dados reais) */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {[
            { label: "Receita de vendas", value: summary.salesRevenue, sub: `${summary.salesCount} veículo(s) vendido(s)`, tone: "text-success" },
            { label: "Comissões pós-venda", value: summary.postsaleCommissions, sub: `${summary.postsaleCount} serviço(s)`, tone: "text-text" },
            { label: "Gasto com destaques", value: summary.featuredSpend, sub: `${summary.featuredCount} contratação(ões)`, tone: "text-text" },
            { label: "Mensalidade (plano)", value: summary.mrr, sub: summary.openInvoicesCount > 0 ? `${summary.openInvoicesCount} fatura(s) em aberto` : "em dia", tone: "text-text" },
          ].map((k) => (
            <Card key={k.label} className="p-4">
              <div className="text-[11.5px] text-muted font-medium">{k.label}</div>
              <div className={`text-[19px] font-bold tracking-tight mt-1 tabular-nums ${k.tone}`}>{brl(k.value)}</div>
              <div className="text-[11.5px] text-faint mt-0.5">{k.sub}</div>
            </Card>
          ))}
        </div>
      )}

      {/* Assinatura */}
      <Card className="p-[20px] mb-4">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-[16px] font-semibold">Plano {sub.plan.name}</h3>
              <Badge tone={STATE_TONE[sub.state]}>{STATE_LABEL[sub.state]}</Badge>
            </div>
            <div className="text-[28px] font-bold tracking-tight mt-2 tabular-nums">
              {brl(sub.plan.priceMonthly)}
              <span className="text-[14px] font-normal text-muted"> /mês</span>
            </div>
            {sub.state !== "NONE" && (
              <p className="text-muted text-[13px] mt-2">
                Pagamento via <b className="text-text">{METHOD_LABEL[sub.paymentMethod ?? ""] ?? sub.paymentMethod}</b>
                {" · "}próxima renovação em <b className="text-text">{fmtDate(sub.currentPeriodEnd)}</b>
              </p>
            )}
          </div>

          {sub.state === "NONE" ? (
            <div className="flex flex-col gap-2 items-end">
              <span className="text-[12px] text-muted">Assinar com:</span>
              <div className="flex gap-2">
                <Button size="sm" loading={busy} onClick={() => subscribe("PIX")}>PIX</Button>
                <Button size="sm" variant="ghost" loading={busy} onClick={() => subscribe("CARD")}>Cartão</Button>
                <Button size="sm" variant="ghost" loading={busy} onClick={() => subscribe("BOLETO")}>Boleto</Button>
              </div>
            </div>
          ) : sub.state === "PAST_DUE" ? (
            <Badge tone="red">Regularize a fatura em aberto</Badge>
          ) : (
            <div className="text-right">
              <div className="flex items-center gap-1.5 text-success text-[13px] font-medium">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
                Assinatura ativa
              </div>
              <p className="text-[12px] text-muted mt-1">Estoque ilimitado · CRM · IA · API</p>
            </div>
          )}
        </div>
      </Card>

      {/* Faturas */}
      <Card>
        <div className="px-[18px] py-3.5 border-b border-border">
          <h3 className="text-[15px] font-semibold">Faturas</h3>
        </div>
        {invoices.length === 0 ? (
          <p className="text-muted text-[13px] text-center py-8">Nenhuma fatura ainda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13.5px]">
              <thead>
                <tr className="text-left text-[11px] font-semibold tracking-wide uppercase text-faint">
                  <th className="px-[18px] py-2.5 border-b border-border">Vencimento</th>
                  <th className="px-[18px] py-2.5 border-b border-border">Valor</th>
                  <th className="px-[18px] py-2.5 border-b border-border">Método</th>
                  <th className="px-[18px] py-2.5 border-b border-border">Status</th>
                  <th className="px-[18px] py-2.5 border-b border-border text-right">Ação</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((i) => (
                  <tr key={i.id} className="border-b border-border last:border-0">
                    <td className="px-[18px] py-3 tabular-nums">{fmtDate(i.dueAt)}</td>
                    <td className="px-[18px] py-3 tabular-nums font-semibold">{brl(i.amount)}</td>
                    <td className="px-[18px] py-3">{METHOD_LABEL[i.method ?? ""] ?? i.method ?? "—"}</td>
                    <td className="px-[18px] py-3">
                      {i.status === "PAID" ? (
                        <Badge tone="green">Paga</Badge>
                      ) : i.status === "OPEN" ? (
                        <Badge tone="amber">Em aberto</Badge>
                      ) : (
                        <Badge tone="muted">{i.status}</Badge>
                      )}
                    </td>
                    <td className="px-[18px] py-3 text-right">
                      {i.status === "OPEN" ? (
                        <Button size="sm" loading={busy} onClick={() => pay(i.id)}>Pagar</Button>
                      ) : i.nfUrl ? (
                        <span className="text-brand text-[12.5px]">NF emitida</span>
                      ) : (
                        <span className="text-muted text-[12.5px]">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
