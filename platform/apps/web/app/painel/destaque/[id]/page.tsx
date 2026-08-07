"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Card } from "@motora/ui";
import {
  authFetch,
  authPost,
  fetchTiers,
  AuthError,
  type FeaturedTierInfo,
} from "@/lib/client-api";
import { brl } from "@/lib/format";

const TIER_COLOR: Record<string, string> = {
  BRONZE: "var(--bronze)",
  SILVER: "var(--prata)",
  GOLD: "var(--ouro)",
  PLATINUM: "var(--platinum)",
};

export default function DestaquePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [tiers, setTiers] = useState<FeaturedTierInfo[]>([]);
  const [title, setTitle] = useState<string>("");
  const [current, setCurrent] = useState<string>("NONE");
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    fetchTiers().then(setTiers).catch(() => setTiers([]));
    authFetch<{ title: string; featuredTier: string }>(`/vehicles/${params.id}`)
      .then((v) => {
        setTitle(v.title);
        setCurrent(v.featuredTier);
      })
      .catch((e) => {
        if (e instanceof AuthError) router.replace("/entrar");
      });
  }, [params.id, router]);

  async function contratar(tier: string) {
    setBusy(tier);
    try {
      await authPost(`/vehicles/${params.id}/feature`, { tier });
      router.push("/painel/estoque");
    } catch (e) {
      if (e instanceof AuthError) router.replace("/entrar");
      setBusy(null);
    }
  }

  return (
    <div className="max-w-[860px]">
      <div className="text-[12.5px] text-muted mb-3">
        <Link href="/painel/estoque" className="hover:text-text">Estoque</Link> › Destacar
      </div>
      <h1 className="text-[21px] font-semibold">Impulsionar anúncio</h1>
      <p className="text-muted text-[13px] mt-1 mb-6">
        {title ? <>Dê mais visibilidade a <b className="text-text">{title}</b>. Anúncios destacados aparecem nas primeiras posições.</> : "Carregando…"}
        {current !== "NONE" && <span className="ml-1 text-accent">· destaque atual: {current}</span>}
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tiers.map((t) => (
          <Card key={t.tier} className="p-[18px] flex flex-col gap-3">
            <span className="inline-flex items-center gap-1.5 self-start text-[11px] font-bold uppercase tracking-wide text-white px-2.5 py-1 rounded-md" style={{ background: TIER_COLOR[t.tier] }}>
              {t.label}
            </span>
            <div>
              <div className="text-[24px] font-bold tracking-tight tabular-nums">{brl(t.price)}</div>
              <div className="text-[12px] text-muted">por {t.durationDays} dias</div>
            </div>
            <p className="text-[12.5px] text-muted flex-1">{t.reach}</p>
            <Button
              size="sm"
              variant={t.tier === "PLATINUM" ? "primary" : "ghost"}
              loading={busy === t.tier}
              onClick={() => contratar(t.tier)}
              className="w-full justify-center"
            >
              Contratar
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
