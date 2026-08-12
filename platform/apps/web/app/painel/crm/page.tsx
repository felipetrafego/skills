"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authFetch, AuthError, type PipelineColumn } from "@/lib/client-api";
import { brl } from "@/lib/format";

const STAGE_LABEL: Record<string, string> = {
  NEW: "Novo",
  CONTACTED: "Contatado",
  VISIT: "Visita",
  PROPOSAL: "Proposta",
  NEGOTIATION: "Negociação",
  WON: "Ganho",
};
const STAGE_COLOR: Record<string, string> = {
  NEW: "var(--faint)",
  CONTACTED: "var(--brand)",
  VISIT: "var(--accent)",
  PROPOSAL: "#a855f7",
  NEGOTIATION: "var(--warning)",
  WON: "var(--success)",
};

export default function CrmPage() {
  const router = useRouter();
  const [cols, setCols] = useState<PipelineColumn[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    authFetch<PipelineColumn[]>("/crm/pipeline")
      .then(setCols)
      .catch((e) => {
        if (e instanceof AuthError) router.replace("/entrar");
        else setError("Não foi possível carregar o pipeline");
      });
  }, [router]);

  if (error) return <p className="text-danger text-sm">{error}</p>;

  const totalOpen = cols?.reduce((s, c) => s + c.total, 0) ?? 0;
  const totalDeals = cols?.reduce((s, c) => s + c.count, 0) ?? 0;

  return (
    <div>
      <div className="mb-5">
        <p className="text-[11px] font-semibold tracking-[0.08em] uppercase text-faint">CRM · Pipeline</p>
        <h1 className="text-[21px] font-semibold">Negociações</h1>
        <p className="text-muted text-[13px] mt-0.5">
          {brl(totalOpen)} em oportunidades · {totalDeals} negociações ativas
        </p>
      </div>

      {!cols ? (
        <div className="flex gap-3.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="w-[262px] h-72 bg-surface-2 rounded-md animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-flow-col auto-cols-[262px] gap-3.5 overflow-x-auto pb-2.5">
          {cols.map((col) => (
            <div key={col.stage} className="bg-surface-2 border border-border rounded-md p-2.5 flex flex-col gap-2.5">
              <div className="flex items-center justify-between px-1 py-0.5 text-[13px] font-semibold">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full inline-block" style={{ background: STAGE_COLOR[col.stage] }} />
                  {STAGE_LABEL[col.stage] ?? col.stage}
                </span>
                <span className="text-[11px] font-semibold text-muted bg-surface px-2 py-0.5 rounded-full">{col.count}</span>
              </div>
              {col.deals.map((d) => (
                <div key={d.id} className="bg-surface border border-border rounded-[10px] p-3 shadow-sm">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h4 className="text-[13.5px] font-semibold">{d.lead.name}</h4>
                      {d.vehicle && <div className="text-[12px] text-muted mt-0.5">{d.vehicle.title}</div>}
                    </div>
                    <span className="w-7 h-7 rounded-full grid place-items-center text-white text-[11px] font-bold shrink-0" style={{ background: "linear-gradient(135deg,var(--brand),var(--brand-strong))" }}>
                      {d.lead.name.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  {d.value != null && (
                    <div className="text-[14.5px] font-bold mt-2.5 tabular-nums tracking-tight">{brl(d.value)}</div>
                  )}
                </div>
              ))}
              {col.deals.length === 0 && (
                <p className="text-[12px] text-muted text-center py-4">Vazio</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
