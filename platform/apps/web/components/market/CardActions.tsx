"use client";

import { FAV_KEY, CMP_KEY, COMPARE_MAX, toggle, useBuyerList } from "@/lib/buyer-store";

export function CardActions({ id }: { id: string }) {
  const favs = useBuyerList(FAV_KEY);
  const cmp = useBuyerList(CMP_KEY);
  const isFav = favs.includes(id);
  const isCmp = cmp.includes(id);

  const stop = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const btn = "w-8 h-8 rounded-full grid place-items-center backdrop-blur transition-colors";
  const base = "bg-[color-mix(in_srgb,var(--surface)_80%,transparent)] text-muted hover:text-text";

  return (
    <div className="absolute top-2.5 right-2.5 flex gap-1.5">
      <button
        aria-label={isCmp ? "Remover da comparação" : "Comparar"}
        title="Comparar"
        onClick={(e) => { stop(e); toggle(CMP_KEY, id, COMPARE_MAX); }}
        className={`${btn} ${isCmp ? "bg-brand text-white" : base}`}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 7h16M4 7l3-3M4 7l3 3M20 17H4M20 17l-3-3M20 17l-3 3" />
        </svg>
      </button>
      <button
        aria-label={isFav ? "Remover dos favoritos" : "Favoritar"}
        title="Favoritar"
        onClick={(e) => { stop(e); toggle(FAV_KEY, id); }}
        className={`${btn} ${isFav ? "bg-danger text-white" : base}`}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill={isFav ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
          <path d="M12 21s-7-4.3-9.3-8.5C1.2 9.6 2.6 6 6 6c2 0 3.2 1.3 4 2.4C10.8 7.3 12 6 14 6c3.4 0 4.8 3.6 3.3 6.5C19 16.7 12 21 12 21z" />
        </svg>
      </button>
    </div>
  );
}
