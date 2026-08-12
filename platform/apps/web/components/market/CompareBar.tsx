"use client";

import Link from "next/link";
import { CMP_KEY, clear, useBuyerList } from "@/lib/buyer-store";

export function CompareBar() {
  const cmp = useBuyerList(CMP_KEY);
  if (cmp.length === 0) return null;

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 bg-surface border border-border-strong rounded-full shadow-lg pl-5 pr-2 py-2">
      <span className="text-[13.5px] font-medium">
        {cmp.length} {cmp.length === 1 ? "veículo" : "veículos"} para comparar
      </span>
      <button onClick={() => clear(CMP_KEY)} className="text-[12.5px] text-muted hover:text-danger">
        limpar
      </button>
      <Link
        href="/comparar"
        aria-disabled={cmp.length < 2}
        className={`rounded-full px-4 py-2 text-[13px] font-medium transition-colors ${
          cmp.length < 2 ? "bg-surface-2 text-faint pointer-events-none" : "bg-brand text-white hover:bg-brand-strong"
        }`}
      >
        Comparar
      </Link>
    </div>
  );
}
