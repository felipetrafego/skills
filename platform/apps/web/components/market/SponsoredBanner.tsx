"use client";

import { useEffect, useState } from "react";
import { fetchAds, adClick, type Ad } from "@/lib/client-api";

const CAT_COLOR: Record<string, string> = {
  Banco: "var(--brand)",
  Seguradora: "var(--success)",
  Oficina: "var(--accent)",
};

export function SponsoredBanner({ placement = "HOME" }: { placement?: string }) {
  const [ad, setAd] = useState<Ad | null>(null);

  useEffect(() => {
    fetchAds(placement).then((ads) => setAd(ads[0] ?? null)).catch(() => setAd(null));
  }, [placement]);

  if (!ad) return null;
  const color = CAT_COLOR[ad.category] ?? "var(--brand)";

  return (
    <a
      href={ad.ctaUrl}
      target={ad.ctaUrl.startsWith("http") ? "_blank" : undefined}
      rel="noopener noreferrer sponsored"
      onClick={() => adClick(ad.id)}
      className="relative flex items-center gap-4 rounded-2xl border border-border bg-surface p-4 md:p-5 overflow-hidden hover:shadow-md transition-shadow"
      style={{ background: `linear-gradient(100deg, color-mix(in srgb, ${color} 8%, var(--surface)), var(--surface))` }}
    >
      <span className="absolute top-2 right-3 text-[10px] uppercase tracking-wide text-faint font-semibold">Patrocinado</span>
      <span className="w-11 h-11 rounded-xl grid place-items-center text-white font-bold text-[15px] flex-none" style={{ background: color }}>
        {ad.advertiser.slice(0, 2).toUpperCase()}
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-[12px] font-medium" style={{ color }}>{ad.advertiser} · {ad.category}</div>
        <div className="text-[15px] font-semibold leading-snug mt-0.5">{ad.title}</div>
        {ad.description && <div className="text-[13px] text-muted mt-0.5 truncate">{ad.description}</div>}
      </div>
      <span className="hidden sm:inline-flex items-center rounded-[10px] px-4 py-2 text-[13px] font-medium text-white flex-none" style={{ background: color }}>
        {ad.ctaText}
      </span>
    </a>
  );
}
