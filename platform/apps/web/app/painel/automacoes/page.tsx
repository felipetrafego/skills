"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Button, Badge } from "@motora/ui";
import {
  fetchAutomations, createAutomation, toggleAutomation, deleteAutomation,
  AuthError, type Automation,
} from "@/lib/client-api";

const TRIGGERS = [["LEAD_CREATED", "Quando um novo lead chegar"], ["DEAL_WON", "Quando um negócio for ganho"], ["VEHICLE_SOLD", "Quando um veículo for vendido"]] as const;
const ACTIONS = [["SEND_MESSAGE", "Enviar mensagem"], ["CREATE_ACTIVITY", "Criar tarefa na agenda"]] as const;
const TRIGGER_LABEL = Object.fromEntries(TRIGGERS);
const ACTION_LABEL = Object.fromEntries(ACTIONS);
const input = "w-full bg-surface-2 border border-border rounded-[10px] px-3.5 py-2.5 text-[14px] outline-none focus:border-brand";

export default function AutomacoesPage() {
  const router = useRouter();
  const [items, setItems] = useState<Automation[]>([]);
  const [f, setF] = useState({ name: "", trigger: "LEAD_CREATED", action: "SEND_MESSAGE", body: "Olá {{nome}}! Vi seu interesse no {{veiculo}}. Posso ajudar?", activityTitle: "Follow-up com {{nome}}" });
  const [busy, setBusy] = useState(false);

  const reload = useCallback(() => {
    fetchAutomations().then(setItems).catch((e) => e instanceof AuthError && router.replace("/entrar"));
  }, [router]);
  useEffect(() => reload(), [reload]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!f.name.trim()) return;
    setBusy(true);
    try {
      await createAutomation({
        name: f.name.trim(),
        trigger: f.trigger,
        action: f.action,
        body: f.action === "SEND_MESSAGE" ? f.body : undefined,
        activityType: f.action === "CREATE_ACTIVITY" ? "TASK" : undefined,
        activityTitle: f.action === "CREATE_ACTIVITY" ? f.activityTitle : undefined,
      });
      setF({ ...f, name: "" });
      reload();
    } catch (e) { if (e instanceof AuthError) router.replace("/entrar"); } finally { setBusy(false); }
  }

  return (
    <div className="max-w-[820px]">
      <div className="mb-5">
        <p className="text-[11px] font-semibold tracking-[0.08em] uppercase text-faint">Automações</p>
        <h1 className="text-[21px] font-semibold">Fluxos automáticos</h1>
        <p className="text-muted text-[13px] mt-0.5">Gatilho → ação. Use <code className="text-[12px] bg-surface-2 px-1 rounded">{"{{nome}}"}</code> e <code className="text-[12px] bg-surface-2 px-1 rounded">{"{{veiculo}}"}</code> nos textos.</p>
      </div>

      <Card className="p-[16px] mb-4">
        <form onSubmit={add} className="flex flex-col gap-3">
          <input className={input} placeholder="Nome da automação" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
          <div className="grid sm:grid-cols-2 gap-3">
            <select className={input} value={f.trigger} onChange={(e) => setF({ ...f, trigger: e.target.value })}>
              {TRIGGERS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <select className={input} value={f.action} onChange={(e) => setF({ ...f, action: e.target.value })}>
              {ACTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          {f.action === "SEND_MESSAGE" ? (
            <textarea className={`${input} min-h-[70px]`} value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} placeholder="Mensagem…" />
          ) : (
            <input className={input} value={f.activityTitle} onChange={(e) => setF({ ...f, activityTitle: e.target.value })} placeholder="Título da tarefa…" />
          )}
          <div><Button type="submit" loading={busy}>Criar automação</Button></div>
        </form>
      </Card>

      <Card>
        {items.length === 0 ? (
          <p className="text-muted text-[13px] p-8 text-center">Nenhuma automação ainda.</p>
        ) : (
          items.map((a) => (
            <div key={a.id} className="flex items-center gap-3 px-[18px] py-3.5 border-b border-border last:border-0">
              <span className="w-9 h-9 rounded-[10px] grid place-items-center bg-brand-tint text-brand flex-none">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M13 2L3 14h9l-1 8 10-12h-9z" /></svg>
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-medium">{a.name}</div>
                <div className="text-[12px] text-muted">
                  {TRIGGER_LABEL[a.trigger.type] ?? a.trigger.type} → {ACTION_LABEL[a.actions.type] ?? a.actions.type}
                </div>
              </div>
              <button onClick={() => toggleAutomation(a.id).then(reload)} className="flex-none" aria-label="Ativar/pausar">
                <Badge tone={a.active ? "green" : "muted"}>{a.active ? "Ativa" : "Pausada"}</Badge>
              </button>
              <button onClick={() => deleteAutomation(a.id).then(reload)} aria-label="Excluir" className="w-8 h-8 rounded-[9px] border border-border grid place-items-center text-muted hover:text-danger hover:border-danger transition-colors">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /></svg>
              </button>
            </div>
          ))
        )}
      </Card>
    </div>
  );
}
