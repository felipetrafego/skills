"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Card, Badge } from "@motora/ui";
import {
  authFetch, authPatch, AuthError,
  aiScore, aiPrice, aiDescription,
  type AiScore, type AiPrice,
} from "@/lib/client-api";
import { brl } from "@/lib/format";

const FUELS = [
  ["FLEX", "Flex"], ["GASOLINE", "Gasolina"], ["ETHANOL", "Etanol"],
  ["DIESEL", "Diesel"], ["HYBRID", "Híbrido"], ["ELECTRIC", "Elétrico"], ["GNV", "GNV"],
] as const;
const TRANSMISSIONS = [
  ["MANUAL", "Manual"], ["AUTOMATIC", "Automático"], ["CVT", "CVT"], ["AUTOMATED", "Automatizado"],
] as const;
const STATUSES = [
  ["ACTIVE", "Ativo"], ["RESERVED", "Reservado"], ["NEGOTIATING", "Em negociação"],
  ["SOLD", "Vendido"], ["DRAFT", "Rascunho"],
] as const;

const inputCls =
  "w-full bg-surface-2 border border-border rounded-[10px] px-3.5 py-2.5 text-[14px] outline-none focus:border-brand transition-colors";
const capCls = "text-[12.5px] font-medium text-muted";

interface Form {
  title: string; price: string; mileageKm: string; fuel: string; transmission: string;
  status: string; color: string; city: string; state: string; description: string;
}

export default function EditVehiclePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [form, setForm] = useState<Form | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scoreRes, setScoreRes] = useState<AiScore | null>(null);
  const [priceRes, setPriceRes] = useState<AiPrice | null>(null);
  const [aiBusy, setAiBusy] = useState<string | null>(null);

  async function runAi<T>(kind: string, fn: () => Promise<T>, apply: (r: T) => void) {
    setAiBusy(kind);
    try {
      apply(await fn());
    } catch (e) {
      if (e instanceof AuthError) router.replace("/entrar");
    } finally {
      setAiBusy(null);
    }
  }

  useEffect(() => {
    authFetch<Record<string, unknown>>(`/vehicles/${params.id}`)
      .then((v) =>
        setForm({
          title: String(v.title ?? ""),
          price: String(v.price ?? ""),
          mileageKm: String(v.mileageKm ?? ""),
          fuel: String(v.fuel ?? "FLEX"),
          transmission: String(v.transmission ?? "MANUAL"),
          status: String(v.status ?? "ACTIVE"),
          color: String(v.color ?? ""),
          city: String(v.city ?? ""),
          state: String(v.state ?? ""),
          description: String(v.description ?? ""),
        }),
      )
      .catch((e) => {
        if (e instanceof AuthError) router.replace("/entrar");
        else setError("Anúncio não encontrado");
      });
  }, [params.id, router]);

  function set<K extends keyof Form>(k: K, val: string) {
    setForm((f) => (f ? { ...f, [k]: val } : f));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setBusy(true);
    setError(null);
    try {
      await authPatch(`/vehicles/${params.id}`, {
        title: form.title,
        description: form.description || undefined,
        price: Number(form.price),
        mileageKm: Number(form.mileageKm || 0),
        fuel: form.fuel,
        transmission: form.transmission,
        status: form.status,
        color: form.color || undefined,
        city: form.city || undefined,
        state: form.state || undefined,
      });
      router.push("/painel/estoque");
    } catch (err) {
      if (err instanceof AuthError) return router.replace("/entrar");
      setError("Não foi possível salvar");
      setBusy(false);
    }
  }

  if (error && !form) return <p className="text-danger text-sm">{error}</p>;
  if (!form) return <p className="text-muted text-sm">Carregando…</p>;

  return (
    <div className="max-w-[720px]">
      <div className="text-[12.5px] text-muted mb-4">
        <Link href="/painel/estoque" className="hover:text-text">Estoque</Link> › Editar anúncio
      </div>
      <h1 className="text-[21px] font-semibold mb-5">Editar anúncio</h1>

      <Card className="p-[18px] mb-4" style={{ background: "var(--brand-tint)", borderColor: "transparent" }}>
        <div className="flex items-center gap-2 mb-3">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="2"><path d="M12 3l1.9 5.8H20l-4.9 3.6 1.9 5.8L12 14.6 7 18.2l1.9-5.8L4 8.8h6.1z" /></svg>
          <b className="text-brand text-[14px]">Assistente de IA</b>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="ghost" loading={aiBusy === "score"} onClick={() => runAi("score", () => aiScore(params.id), setScoreRes)}>Analisar anúncio</Button>
          <Button size="sm" variant="ghost" loading={aiBusy === "price"} onClick={() => runAi("price", () => aiPrice(params.id), setPriceRes)}>Sugerir preço</Button>
          <Button size="sm" variant="ghost" loading={aiBusy === "desc"} onClick={() => runAi("desc", () => aiDescription(params.id), (r) => set("description", r.text))}>Gerar descrição</Button>
        </div>

        {scoreRes && (
          <div className="mt-4 flex items-start gap-4 flex-wrap">
            <div className="text-center">
              <div className="text-[30px] font-bold tracking-tight leading-none">{scoreRes.score}</div>
              <div className="text-[11px] text-muted">de 100</div>
            </div>
            <ul className="flex-1 min-w-[220px] flex flex-col gap-1.5">
              {scoreRes.suggestions.length === 0 ? (
                <li className="text-[13px] text-success">Anúncio completo — ótimo trabalho!</li>
              ) : (
                scoreRes.suggestions.map((s, i) => (
                  <li key={i} className="text-[13px] text-muted flex gap-2"><span className="text-accent">•</span>{s}</li>
                ))
              )}
            </ul>
          </div>
        )}

        {priceRes && (
          <div className="mt-4 text-[13px]">
            {priceRes.verdict === "NO_DATA" ? (
              <span className="text-muted">Ainda não há anúncios comparáveis suficientes para sugerir um preço.</span>
            ) : (
              <div className="flex items-center gap-3 flex-wrap">
                <span>Preço sugerido: <b className="text-[15px]">{brl(priceRes.suggested)}</b></span>
                <Badge tone={priceRes.verdict === "ABOVE" ? "amber" : "green"}>
                  {priceRes.verdict === "ABOVE" ? `${priceRes.diffPct}% acima do mercado` : priceRes.verdict === "BELOW" ? "abaixo do mercado" : "alinhado ao mercado"}
                </Badge>
                <span className="text-muted text-[12px]">({priceRes.sampleSize} comparáveis)</span>
                <button type="button" onClick={() => set("price", String(priceRes.suggested))} className="text-brand text-[12.5px] font-medium hover:underline">Aplicar</button>
              </div>
            )}
          </div>
        )}
      </Card>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Card className="p-[18px] grid sm:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1.5 sm:col-span-2">
            <span className={capCls}>Título</span>
            <input className={inputCls} value={form.title} onChange={(e) => set("title", e.target.value)} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className={capCls}>Preço (R$)</span>
            <input className={inputCls} type="number" value={form.price} onChange={(e) => set("price", e.target.value)} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className={capCls}>Quilometragem</span>
            <input className={inputCls} type="number" value={form.mileageKm} onChange={(e) => set("mileageKm", e.target.value)} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className={capCls}>Combustível</span>
            <select className={inputCls} value={form.fuel} onChange={(e) => set("fuel", e.target.value)}>
              {FUELS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className={capCls}>Câmbio</span>
            <select className={inputCls} value={form.transmission} onChange={(e) => set("transmission", e.target.value)}>
              {TRANSMISSIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className={capCls}>Status</span>
            <select className={inputCls} value={form.status} onChange={(e) => set("status", e.target.value)}>
              {STATUSES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className={capCls}>Cor</span>
            <input className={inputCls} value={form.color} onChange={(e) => set("color", e.target.value)} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className={capCls}>Cidade</span>
            <input className={inputCls} value={form.city} onChange={(e) => set("city", e.target.value)} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className={capCls}>UF</span>
            <input className={inputCls} maxLength={2} value={form.state} onChange={(e) => set("state", e.target.value.toUpperCase())} />
          </label>
          <label className="flex flex-col gap-1.5 sm:col-span-2">
            <span className={capCls}>Descrição</span>
            <textarea className={`${inputCls} min-h-[90px] resize-y`} value={form.description} onChange={(e) => set("description", e.target.value)} />
          </label>
        </Card>

        {error && <p className="text-danger text-[13px]">{error}</p>}
        <div className="flex items-center gap-3">
          <Button type="submit" loading={busy}>Salvar alterações</Button>
          <Link href="/painel/estoque" className="text-[13.5px] text-muted hover:text-text">Cancelar</Link>
        </div>
      </form>
    </div>
  );
}
