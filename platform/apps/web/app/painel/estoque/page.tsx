"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Card, Badge } from "@motora/ui";
import {
  fetchMyVehicles,
  authPatch,
  authDelete,
  AuthError,
  type MyVehicle,
} from "@/lib/client-api";
import { brl, km } from "@/lib/format";

const TIER_LABEL: Record<string, string> = { BRONZE: "Bronze", SILVER: "Prata", GOLD: "Ouro", PLATINUM: "Platinum" };
const TIER_COLOR: Record<string, string> = { BRONZE: "var(--bronze)", SILVER: "var(--prata)", GOLD: "var(--ouro)", PLATINUM: "var(--platinum)" };

const STATUS: Record<string, { label: string; tone: "green" | "amber" | "brand" | "muted" | "red" }> = {
  ACTIVE: { label: "Ativo", tone: "green" },
  RESERVED: { label: "Reservado", tone: "amber" },
  NEGOTIATING: { label: "Em negociação", tone: "brand" },
  SOLD: { label: "Vendido", tone: "muted" },
  DRAFT: { label: "Rascunho", tone: "muted" },
};
const STATUS_OPTIONS = ["ACTIVE", "RESERVED", "NEGOTIATING", "SOLD"];

export default function EstoquePage() {
  const router = useRouter();
  const [items, setItems] = useState<MyVehicle[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setItems(await fetchMyVehicles());
    } catch (e) {
      if (e instanceof AuthError) router.replace("/entrar");
    }
  }, [router]);

  useEffect(() => {
    void reload();
  }, [reload]);

  async function changeStatus(id: string, status: string) {
    setBusyId(id);
    try {
      await authPatch(`/vehicles/${id}`, { status });
      await reload();
    } catch (e) {
      if (e instanceof AuthError) router.replace("/entrar");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id: string, title: string) {
    if (!window.confirm(`Remover o anúncio "${title}"? Esta ação não pode ser desfeita.`)) return;
    setBusyId(id);
    try {
      await authDelete(`/vehicles/${id}`);
      await reload();
    } catch (e) {
      if (e instanceof AuthError) router.replace("/entrar");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="flex items-end justify-between mb-5 gap-4 flex-wrap">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.08em] uppercase text-faint">Estoque</p>
          <h1 className="text-[21px] font-semibold">Meus anúncios</h1>
          <p className="text-muted text-[13px] mt-0.5">
            {items ? `${items.length} veículo(s) no estoque` : "Carregando…"}
          </p>
        </div>
        <Link href="/painel/anunciar">
          <Button size="sm">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 5v14M5 12h14" /></svg>
            Novo anúncio
          </Button>
        </Link>
      </div>

      {items && items.length === 0 && (
        <Card className="p-10 text-center">
          <p className="text-[15px] font-medium">Seu estoque está vazio</p>
          <p className="text-muted text-[13px] mt-1 mb-4">Publique o primeiro anúncio da sua loja.</p>
          <Link href="/painel/anunciar"><Button size="sm">Criar anúncio</Button></Link>
        </Card>
      )}

      <div className="flex flex-col gap-3">
        {(items ?? Array.from({ length: 4 }).map(() => null)).map((v, i) =>
          v ? (
            <Card key={v.id} className="p-3 flex items-center gap-4 flex-wrap">
              <div className="w-[92px] h-[68px] rounded-[10px] bg-surface-2 grid place-items-center overflow-hidden flex-none">
                {v.media[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={v.media[0].url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-2/5 h-2/5 opacity-25 text-text" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M5 13l1.5-4.5A2 2 0 0 1 8.4 7h7.2a2 2 0 0 1 1.9 1.5L19 13" /><path d="M5 13h14v4H5z" /></svg>
                )}
              </div>

              <div className="flex-1 min-w-[160px]">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="text-[14.5px] font-semibold">{v.title}</h3>
                  <Badge tone={STATUS[v.status]?.tone ?? "muted"}>{STATUS[v.status]?.label ?? v.status}</Badge>
                  {v.featuredTier && v.featuredTier !== "NONE" && (
                    <span className="inline-flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-wide text-white px-2 py-0.5 rounded" style={{ background: TIER_COLOR[v.featuredTier] }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.6 6.9H22l-5.7 4.2 2.2 7L12 15.9 5.5 20.1l2.2-7L2 8.9h7.4z" /></svg>
                      {TIER_LABEL[v.featuredTier]}
                    </span>
                  )}
                </div>
                <div className="text-muted text-[12.5px] mt-1">
                  {v.yearFab}/{v.yearModel} · {km(v.mileageKm)} · {v._count.media} foto(s) · {v.views} views · {v._count.leads} leads
                </div>
                <div className="text-[16px] font-bold tracking-tight mt-1 tabular-nums">{brl(v.price)}</div>
              </div>

              <div className="flex items-center gap-2">
                <select
                  className="bg-surface border border-border rounded-[9px] px-2.5 py-2 text-[12.5px] outline-none focus:border-brand cursor-pointer disabled:opacity-50"
                  value={STATUS_OPTIONS.includes(v.status) ? v.status : ""}
                  disabled={busyId === v.id}
                  onChange={(e) => changeStatus(v.id, e.target.value)}
                >
                  {!STATUS_OPTIONS.includes(v.status) && <option value="">{STATUS[v.status]?.label ?? v.status}</option>}
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{STATUS[s]!.label}</option>
                  ))}
                </select>
                <Link href={`/painel/destaque/${v.id}`}>
                  <Button size="sm" variant="ghost" title="Impulsionar anúncio">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.6 6.9H22l-5.7 4.2 2.2 7L12 15.9 5.5 20.1l2.2-7L2 8.9h7.4z" /></svg>
                    Destacar
                  </Button>
                </Link>
                <Link href={`/painel/estoque/${v.id}`}>
                  <Button size="sm" variant="ghost">Editar</Button>
                </Link>
                <button
                  onClick={() => remove(v.id, v.title)}
                  disabled={busyId === v.id}
                  aria-label="Remover"
                  className="w-9 h-9 rounded-[9px] border border-border grid place-items-center text-muted hover:text-danger hover:border-danger transition-colors disabled:opacity-50"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /></svg>
                </button>
              </div>
            </Card>
          ) : (
            <div key={i} className="h-[92px] bg-surface-2 rounded-lg animate-pulse" />
          ),
        )}
      </div>
    </div>
  );
}
