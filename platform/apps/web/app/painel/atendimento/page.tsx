"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Button } from "@motora/ui";
import {
  fetchLeads, fetchMessages, sendMessage, fetchTemplates,
  AuthError, type Lead, type Message, type Template,
} from "@/lib/client-api";

export default function AtendimentoPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [active, setActive] = useState<Lead | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    Promise.all([fetchLeads(), fetchTemplates()])
      .then(([l, t]) => {
        setLeads(l);
        setTemplates(t);
        setActive(l[0] ?? null);
      })
      .catch((e) => e instanceof AuthError && router.replace("/entrar"));
  }, [router]);

  const loadMessages = useCallback(
    (leadId: string) => {
      fetchMessages(leadId)
        .then(setMessages)
        .catch((e) => e instanceof AuthError && router.replace("/entrar"));
    },
    [router],
  );

  useEffect(() => {
    if (active) loadMessages(active.id);
    else setMessages([]);
  }, [active, loadMessages]);

  async function send() {
    if (!active || !draft.trim()) return;
    setBusy(true);
    try {
      await sendMessage({ leadId: active.id, channel: "WHATSAPP", body: draft.trim() });
      setDraft("");
      loadMessages(active.id);
    } catch (e) {
      if (e instanceof AuthError) router.replace("/entrar");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="mb-5">
        <p className="text-[11px] font-semibold tracking-[0.08em] uppercase text-faint">Atendimento</p>
        <h1 className="text-[21px] font-semibold">Central de mensagens</h1>
        <p className="text-muted text-[13px] mt-0.5">WhatsApp, e-mail e chat em um só lugar.</p>
      </div>

      <div className="grid md:grid-cols-[260px_1fr] gap-4 h-[560px]">
        <Card className="overflow-y-auto">
          {leads.length === 0 && <p className="text-muted text-[13px] p-4">Nenhum lead ainda.</p>}
          {leads.map((l) => (
            <button
              key={l.id}
              onClick={() => setActive(l)}
              className={`w-full text-left px-4 py-3 border-b border-border flex items-center gap-3 transition-colors ${active?.id === l.id ? "bg-brand-tint" : "hover:bg-surface-2"}`}
            >
              <span className="w-8 h-8 rounded-full grid place-items-center text-white text-[11px] font-bold flex-none" style={{ background: "linear-gradient(135deg,var(--brand),var(--brand-strong))" }}>
                {l.name.slice(0, 2).toUpperCase()}
              </span>
              <span className="min-w-0">
                <span className={`block text-[13.5px] font-medium truncate ${active?.id === l.id ? "text-brand" : ""}`}>{l.name}</span>
                {l.vehicle && <span className="block text-[11.5px] text-muted truncate">{l.vehicle.title}</span>}
              </span>
            </button>
          ))}
        </Card>

        <Card className="flex flex-col">
          {!active ? (
            <div className="flex-1 grid place-items-center text-muted text-sm">Selecione um lead</div>
          ) : (
            <>
              <div className="px-4 py-3 border-b border-border">
                <b className="text-[14px]">{active.name}</b>
                <span className="text-muted text-[12px] ml-2">{active.phone ?? active.email ?? active.source}</span>
              </div>
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2.5">
                {messages.length === 0 && <p className="text-muted text-[13px] text-center my-auto">Sem mensagens. Envie a primeira!</p>}
                {messages.map((m) => (
                  <div key={m.id} className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-[13.5px] ${m.direction === "OUT" ? "self-end bg-brand text-white rounded-br-sm" : "self-start bg-surface-2 rounded-bl-sm"}`}>
                    {m.body}
                    <span className={`block text-[10px] mt-1 ${m.direction === "OUT" ? "text-white/70" : "text-faint"}`}>
                      {new Date(m.createdAt).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border p-3">
                {templates.length > 0 && (
                  <select
                    className="text-[12.5px] bg-surface-2 border border-border rounded-lg px-2.5 py-1.5 mb-2 text-muted outline-none cursor-pointer"
                    value=""
                    onChange={(e) => { if (e.target.value) setDraft(e.target.value); }}
                  >
                    <option value="">Usar template…</option>
                    {templates.map((t) => <option key={t.id} value={t.body}>{t.name}</option>)}
                  </select>
                )}
                <div className="flex gap-2">
                  <input
                    className="flex-1 bg-surface-2 border border-border rounded-[10px] px-3.5 py-2.5 text-[14px] outline-none focus:border-brand"
                    placeholder="Escreva uma mensagem…"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && send()}
                  />
                  <Button loading={busy} onClick={send}>Enviar</Button>
                </div>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
