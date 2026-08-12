"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Button, Badge } from "@motora/ui";
import {
  fetchAgenda, createActivity, completeActivity,
  AuthError, type Activity,
} from "@/lib/client-api";

const TYPES = [
  ["TASK", "Tarefa"], ["CALL", "Ligação"], ["MEETING", "Reunião"],
  ["TEST_DRIVE", "Test drive"], ["DELIVERY", "Entrega"], ["NOTE", "Anotação"],
] as const;
const TYPE_LABEL = Object.fromEntries(TYPES);

function typeIcon(type: string) {
  const p: Record<string, string> = {
    TEST_DRIVE: "M5 13l1.5-4.5A2 2 0 0 1 8.4 7h7.2a2 2 0 0 1 1.9 1.5L19 13v4H5z",
    DELIVERY: "M3 7h11v8H3zM14 10h4l3 3v2h-7z",
    CALL: "M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z",
    MEETING: "M17 21v-2a4 4 0 0 0-3-3.9M9 21v-2a4 4 0 0 1 3-3.9M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  };
  return p[type] ?? "M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11";
}

export default function AgendaPage() {
  const router = useRouter();
  const [items, setItems] = useState<Activity[] | null>(null);
  const [type, setType] = useState("TASK");
  const [title, setTitle] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [busy, setBusy] = useState(false);

  const reload = useCallback(() => {
    fetchAgenda().then(setItems).catch((e) => e instanceof AuthError && router.replace("/entrar"));
  }, [router]);
  useEffect(() => reload(), [reload]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    try {
      await createActivity({ type, title: title.trim(), dueAt: dueAt ? new Date(dueAt).toISOString() : undefined });
      setTitle("");
      setDueAt("");
      reload();
    } catch (e) {
      if (e instanceof AuthError) router.replace("/entrar");
    } finally {
      setBusy(false);
    }
  }

  async function toggle(id: string) {
    try {
      await completeActivity(id);
      reload();
    } catch (e) {
      if (e instanceof AuthError) router.replace("/entrar");
    }
  }

  const input = "bg-surface-2 border border-border rounded-[10px] px-3 py-2.5 text-[14px] outline-none focus:border-brand";

  return (
    <div className="max-w-[820px]">
      <div className="mb-5">
        <p className="text-[11px] font-semibold tracking-[0.08em] uppercase text-faint">Agenda</p>
        <h1 className="text-[21px] font-semibold">Test drives, entregas e tarefas</h1>
      </div>

      <Card className="p-[16px] mb-4">
        <form onSubmit={add} className="flex gap-2 flex-wrap items-end">
          <label className="flex flex-col gap-1">
            <span className="text-[11.5px] text-muted">Tipo</span>
            <select className={input} value={type} onChange={(e) => setType(e.target.value)}>
              {TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1 flex-1 min-w-[180px]">
            <span className="text-[11.5px] text-muted">Título</span>
            <input className={input} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex.: Test drive Compass - Pedro" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[11.5px] text-muted">Quando</span>
            <input className={input} type="datetime-local" value={dueAt} onChange={(e) => setDueAt(e.target.value)} />
          </label>
          <Button type="submit" loading={busy}>Agendar</Button>
        </form>
      </Card>

      <Card>
        {!items ? (
          <p className="text-muted text-[13px] p-6">Carregando…</p>
        ) : items.length === 0 ? (
          <p className="text-muted text-[13px] p-8 text-center">Nada agendado. Crie a primeira atividade acima.</p>
        ) : (
          items.map((a) => (
            <div key={a.id} className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-0">
              <button
                onClick={() => toggle(a.id)}
                aria-label={a.done ? "Reabrir" : "Concluir"}
                className={`w-5 h-5 rounded-md border flex-none grid place-items-center ${a.done ? "bg-success border-success text-white" : "border-border-strong"}`}
              >
                {a.done && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5"><path d="M20 6L9 17l-5-5" /></svg>}
              </button>
              <span className="w-8 h-8 rounded-lg bg-surface-2 grid place-items-center text-muted flex-none">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={typeIcon(a.type)} /></svg>
              </span>
              <div className="flex-1 min-w-0">
                <div className={`text-[14px] font-medium ${a.done ? "line-through text-muted" : ""}`}>{a.title}</div>
                <div className="text-[12px] text-muted">
                  {TYPE_LABEL[a.type as keyof typeof TYPE_LABEL] ?? a.type}
                  {a.deal?.lead && ` · ${a.deal.lead.name}`}
                </div>
              </div>
              {a.dueAt && (
                <Badge tone={a.done ? "muted" : "brand"}>
                  {new Date(a.dueAt).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                </Badge>
              )}
            </div>
          ))
        )}
      </Card>
    </div>
  );
}
