"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Button, Badge } from "@motora/ui";
import {
  fetchCampaigns, createCampaign, fetchLanding, createLanding, updateLanding,
  AuthError, type Campaign, type Landing,
} from "@/lib/client-api";
import { brl } from "@/lib/format";

const CHANNELS = [["META", "Meta Ads"], ["GOOGLE", "Google Ads"], ["TIKTOK", "TikTok Ads"], ["SEO", "SEO"], ["EMAIL", "E-mail"]] as const;
const CH_LABEL = Object.fromEntries(CHANNELS);
const input = "bg-surface-2 border border-border rounded-[10px] px-3 py-2.5 text-[14px] outline-none focus:border-brand";

export default function MarketingPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [landing, setLanding] = useState<Landing[]>([]);
  const [c, setC] = useState({ name: "", channel: "META", budget: "" });
  const [l, setL] = useState({ slug: "", title: "", headline: "", subheadline: "" });
  const [busy, setBusy] = useState(false);

  const reload = useCallback(() => {
    Promise.all([fetchCampaigns(), fetchLanding()])
      .then(([cs, ls]) => { setCampaigns(cs); setLanding(ls); })
      .catch((e) => e instanceof AuthError && router.replace("/entrar"));
  }, [router]);
  useEffect(() => reload(), [reload]);

  async function addCampaign(e: React.FormEvent) {
    e.preventDefault();
    if (!c.name.trim()) return;
    setBusy(true);
    try {
      await createCampaign({ name: c.name.trim(), channel: c.channel, budget: c.budget ? Number(c.budget) : undefined });
      setC({ name: "", channel: "META", budget: "" });
      reload();
    } catch (e) { if (e instanceof AuthError) router.replace("/entrar"); } finally { setBusy(false); }
  }

  async function addLanding(e: React.FormEvent) {
    e.preventDefault();
    if (!l.slug.trim() || !l.headline.trim()) return;
    setBusy(true);
    try {
      await createLanding({ slug: l.slug.trim(), title: l.title || l.headline, headline: l.headline, subheadline: l.subheadline || undefined });
      setL({ slug: "", title: "", headline: "", subheadline: "" });
      reload();
    } catch (e) { if (e instanceof AuthError) router.replace("/entrar"); } finally { setBusy(false); }
  }

  async function togglePublish(p: Landing) {
    try { await updateLanding(p.id, { published: !p.published }); reload(); }
    catch (e) { if (e instanceof AuthError) router.replace("/entrar"); }
  }

  const totalBudget = campaigns.reduce((s, x) => s + Number(x.budget ?? 0), 0);

  return (
    <div className="max-w-[900px]">
      <div className="mb-5">
        <p className="text-[11px] font-semibold tracking-[0.08em] uppercase text-faint">Marketing</p>
        <h1 className="text-[21px] font-semibold">Campanhas e landing pages</h1>
        <p className="text-muted text-[13px] mt-0.5">Meta, Google, TikTok, SEO e páginas de captura — com UTM automático.</p>
      </div>

      {/* Campanhas */}
      <Card className="mb-5">
        <div className="px-[18px] py-3.5 border-b border-border flex items-center justify-between">
          <h3 className="text-[15px] font-semibold">Campanhas</h3>
          <span className="text-[12px] text-muted">Orçamento total: <b className="text-text tabular-nums">{brl(totalBudget)}</b></span>
        </div>
        <div className="p-[16px]">
          <form onSubmit={addCampaign} className="flex gap-2 flex-wrap items-end mb-4">
            <input className={`${input} flex-1 min-w-[160px]`} placeholder="Nome da campanha" value={c.name} onChange={(e) => setC({ ...c, name: e.target.value })} />
            <select className={input} value={c.channel} onChange={(e) => setC({ ...c, channel: e.target.value })}>
              {CHANNELS.map(([v, la]) => <option key={v} value={v}>{la}</option>)}
            </select>
            <input className={`${input} w-[130px]`} type="number" placeholder="Orçamento" value={c.budget} onChange={(e) => setC({ ...c, budget: e.target.value })} />
            <Button type="submit" loading={busy}>Criar</Button>
          </form>
          {campaigns.length === 0 ? (
            <p className="text-muted text-[13px] text-center py-3">Nenhuma campanha ainda.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {campaigns.map((cp) => (
                <div key={cp.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                  <span className="w-8 h-8 rounded-lg bg-brand-tint text-brand grid place-items-center text-[11px] font-bold flex-none">{cp.channel.slice(0, 2)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-medium">{cp.name}</div>
                    <div className="text-[12px] text-muted">{CH_LABEL[cp.channel] ?? cp.channel} · utm: {cp.utm?.source}/{cp.utm?.medium}/{cp.utm?.campaign}</div>
                  </div>
                  {cp.budget != null && <span className="text-[13.5px] font-semibold tabular-nums">{brl(cp.budget)}</span>}
                  <Badge tone="green">{cp.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Landing pages */}
      <Card>
        <div className="px-[18px] py-3.5 border-b border-border">
          <h3 className="text-[15px] font-semibold">Landing pages</h3>
        </div>
        <div className="p-[16px]">
          <form onSubmit={addLanding} className="grid sm:grid-cols-2 gap-2 mb-4">
            <input className={input} placeholder="slug (ex.: suvs-imperdiveis)" value={l.slug} onChange={(e) => setL({ ...l, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })} />
            <input className={input} placeholder="Título da página" value={l.title} onChange={(e) => setL({ ...l, title: e.target.value })} />
            <input className={`${input} sm:col-span-2`} placeholder="Headline (chamada principal)" value={l.headline} onChange={(e) => setL({ ...l, headline: e.target.value })} />
            <input className={`${input} sm:col-span-2`} placeholder="Subheadline (opcional)" value={l.subheadline} onChange={(e) => setL({ ...l, subheadline: e.target.value })} />
            <div><Button type="submit" loading={busy}>Criar landing</Button></div>
          </form>
          {landing.length === 0 ? (
            <p className="text-muted text-[13px] text-center py-3">Nenhuma landing page ainda.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {landing.map((p) => (
                <div key={p.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-medium">{p.title}</div>
                    <div className="text-[12px] text-muted">/l/auto-prime/{p.slug}</div>
                  </div>
                  <Badge tone={p.published ? "green" : "muted"}>{p.published ? "Publicada" : "Rascunho"}</Badge>
                  {p.published && (
                    <a href={`/l/auto-prime/${p.slug}`} target="_blank" rel="noreferrer" className="text-brand text-[12.5px] font-medium hover:underline">Ver</a>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => togglePublish(p)}>{p.published ? "Despublicar" : "Publicar"}</Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
