"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken, logout as apiLogout } from "@/lib/client-api";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (!getToken()) router.replace("/entrar");
    else setOk(true);
  }, [router]);

  if (!ok) return <div className="min-h-screen grid place-items-center text-muted text-sm">Carregando…</div>;

  return (
    <div className="min-h-screen">
      <header className="flex items-center gap-4 px-6 py-3.5 border-b border-border bg-surface sticky top-0 z-10">
        <div className="flex items-center gap-2 font-bold text-[15px] tracking-tight">
          <span className="w-[26px] h-[26px] rounded-lg grid place-items-center text-white" style={{ background: "linear-gradient(135deg,#0d1017,#33405c)" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6z" /></svg>
          </span>
          Motora
          <span className="text-[11px] font-semibold uppercase tracking-wide text-muted border border-border rounded-full px-2 py-0.5 ml-1">Admin</span>
        </div>
        <div className="ml-auto flex items-center gap-2.5">
          <ThemeToggle />
          <button
            onClick={async () => { await apiLogout(); router.push("/entrar"); }}
            className="text-[13px] text-muted hover:text-danger transition-colors"
          >
            Sair
          </button>
        </div>
      </header>
      <main className="max-w-[1100px] mx-auto p-6 md:p-7">{children}</main>
    </div>
  );
}
