"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Badge } from "@motora/ui";
import {
  fetchMyVehicles, fetchPartners, fetchVehicleOffers, markVehicleSold, createServiceOffer,
  AuthError, type MyVehicle, type Partner, type ServiceOffer,
} from "@/lib/client-api";
import { brl } from "@/lib/format";

const CAT_LABEL: Record<string, string> = {
  INSURANCE: "Seguro", FINANCING: "Financiamento", TRANSFER: "Transferência",
  INSPECTION: "Vistoria", WARRANTY: "Garantia", TRACKER: "Rastreador",
  DISPATCHER: "Despachante", CLEANING: "Estética", ADVERTISING: "Publicidade",
};
const input = "w-full bg-surface-2 border border-border rounded-[9px] px-3 py-2 text-[13px] outline-none focus:border-brand";

export default function PosVendaPage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<MyVehicle[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [offers, setOffers] = useState<Record<string, ServiceOffer[]>>({});
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const [sellId, setSellId] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [vs, ps] = await Promise.all([fetchMyVehicles(), fetchPartners()]);
      setVehicles(vs);
      setPartners(ps);
      const sold = vs.filter((v) => v.status === "SOLD");
      const entries = await Promise.all(
        sold.map(async (v) => [v.id, await fetchVehicleOffers(v.id).catch(() => [])] as const),
      );
      setOffers(Object.fromEntries(entries));
    } catch (e) {
      if (e instanceof AuthError) router.replace("/entrar");
    }
  }, [router]);

  useEffect(() => { void load(); }, [load]);

  const active = vehicles.filter((v) => v.status === "ACTIVE");
  const sold = vehicles.filter((v) => v.status === "SOLD");
  const totalCommission = Object.values(offers).flat().reduce((s, o) => s + Number(o.commissionAmount ?? 0), 0);

  async function registerSale() {
    if (!sellId) return;
    setBusy("sell");
    try {
      await markVehicleSold(sellId);
      setSellId("");
      await load();
    } catch (e) {
      if (e instanceof AuthError) router.replace("/entrar");
    } finally { setBusy(null); }
  }

  async function contract(vehicleId: string, partnerId: string) {
    const key = `${vehicleId}:${partnerId}`;
    const amount = Number(amounts[key] || 0);
    setBusy(key);
    try {
      await createServiceOffer({ vehicleId, partnerId, amount: amount || undefined });
      setAmounts((a) => ({ ...a, [key]: "" }));
      setOffers((o) => ({ ...o, [vehicleId]: [] })); // limpa p/ recarregar
      const fresh = await fetchVehicleOffers(vehicleId);
      setOffers((o) => ({ ...o, [vehicleId]: fresh }));
    } catch (e) {
      if (e instanceof AuthError) router.replace("/entrar");
    } finally { setBusy(null); }
  }

  return (
    <div className="max-w-[860px]">
      <div className="flex items-end justify-between mb-5 gap-4 flex-wrap">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.08em] uppercase text-faint">Pós-venda</p>
          <h1 className="text-[21px] font-semibold">Jornada de pós-venda</h1>
          <p className="text-muted text-[13px] mt-0.5">Registre a venda e ofereça serviços parceiros — cada contratação gera comissão.</p>
        </div>
        <Card className="px-4 py-2.5">
          <div className="text-[11px] text-muted">Comissões geradas</div>
          <div className="text-[18px] font-bold tabular-nums text-success">{brl(totalCommission)}</div>
        </Card>
      </div>

      {/* Registrar venda */}
      <Card className="p-[16px] mb-4">
        <div className="flex items-end gap-3 flex-wrap">
          <label className="flex flex-col gap-1.5 flex-1 min-w-[220px]">
            <span className="text-[12.5px] font-medium text-muted">Registrar venda de um anúncio ativo</span>
            <select className={input} value={sellId} onChange={(e) => setSellId(e.target.value)}>
              <option value="">{active.length ? "Selecione o veículo vendido…" : "Nenhum anúncio ativo"}</option>
              {active.map((v) => <option key={v.id} value={v.id}>{v.title} — {brl(v.price)}</option>)}
            </select>
          </label>
          <Button onClick={registerSale} loading={busy === "sell"} disabled={!sellId}>Marcar como vendido</Button>
        </div>
      </Card>

      {/* Jornada por veículo vendido */}
      {sold.length === 0 ? (
        <Card className="p-10 text-center">
          <p className="text-[15px] font-medium">Nenhuma venda registrada ainda</p>
          <p className="text-muted text-[13px] mt-1">Marque um anúncio como vendido para abrir a jornada de pós-venda.</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {sold.map((v) => {
            const vOffers = offers[v.id] ?? [];
            const contractedPartnerIds = new Set(vOffers.map((o) => o.partnerId));
            const vCommission = vOffers.reduce((s, o) => s + Number(o.commissionAmount ?? 0), 0);
            return (
              <Card key={v.id}>
                <div className="px-[18px] py-3.5 border-b border-border flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-[14.5px] font-semibold">{v.title}</h3>
                    <Badge tone="muted">Vendido</Badge>
                  </div>
                  <div className="text-[12.5px] text-muted">
                    {vOffers.length} serviço(s) · comissão <b className="text-success">{brl(vCommission)}</b>
                  </div>
                </div>
                <div className="p-[14px] grid sm:grid-cols-2 gap-2.5">
                  {partners.map((p) => {
                    const key = `${v.id}:${p.id}`;
                    const done = contractedPartnerIds.has(p.id);
                    const rate = Math.round(Number(p.commissionRate) * 100);
                    return (
                      <div key={p.id} className={`border rounded-[10px] p-3 ${done ? "border-success/40 bg-success-tint" : "border-border"}`}>
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <div className="text-[13.5px] font-medium">{p.name}</div>
                            <div className="text-[11.5px] text-muted">{CAT_LABEL[p.category] ?? p.category} · comissão {rate}%</div>
                          </div>
                          {done && (
                            <span className="text-success flex-none" aria-label="Contratado">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
                            </span>
                          )}
                        </div>
                        {done ? (
                          <div className="text-[12px] text-muted mt-1.5">
                            {(() => { const o = vOffers.find((x) => x.partnerId === p.id)!; return `Valor ${brl(Number(o.amount ?? 0))} · comissão ${brl(Number(o.commissionAmount ?? 0))}`; })()}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 mt-2">
                            <input
                              className={input}
                              type="number" min={0} placeholder="Valor do serviço (R$)"
                              value={amounts[key] ?? ""}
                              onChange={(e) => setAmounts((a) => ({ ...a, [key]: e.target.value }))}
                            />
                            <Button size="sm" variant="ghost" loading={busy === key} onClick={() => contract(v.id, p.id)}>Contratar</Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
