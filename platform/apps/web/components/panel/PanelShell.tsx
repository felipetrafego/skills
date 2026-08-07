"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { clearToken } from "@/lib/client-api";

const NAV: { href: string; label: string; icon: ReactNode; disabled?: boolean }[] = [
  { href: "/painel", label: "Dashboard", icon: <path d="M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z" /> },
  { href: "/painel/crm", label: "CRM", icon: <><path d="M16 21v-2a4 4 0 0 0-8 0v2" /><circle cx="12" cy="7" r="4" /></> },
  { href: "/painel/anunciar", label: "Novo anúncio", icon: <><path d="M5 13l1.5-4.5A2 2 0 0 1 8.4 7h7.2a2 2 0 0 1 1.9 1.5L19 13v4H5z" /><path d="M12 8v4M10 10h4" /></> },
  { href: "/painel/marketing", label: "Marketing", icon: <path d="M3 11l18-8-8 18-2-8z" />, disabled: true },
  { href: "/painel/financeiro", label: "Financeiro", icon: <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /> },
];

export function PanelShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  function logout() {
    clearToken();
    router.push("/entrar");
  }

  return (
    <div className="grid md:grid-cols-[240px_1fr] min-h-screen">
      <aside className="hidden md:flex flex-col gap-1 bg-surface border-r border-border p-3">
        <div className="flex items-center gap-2.5 px-2 py-2 pb-3.5 mb-1.5 border-b border-border">
          <span className="w-[34px] h-[34px] rounded-[9px] grid place-items-center text-white font-bold" style={{ background: "linear-gradient(135deg,#0d1017,#33405c)" }}>
            AP
          </span>
          <div>
            <b className="text-[13.5px] block">Auto Prime</b>
            <span className="text-[11.5px] text-muted">Plano Lojista</span>
          </div>
        </div>
        {NAV.map((n) => {
          const active = pathname === n.href;
          const cls =
            "flex items-center gap-3 px-2.5 py-2 rounded-[9px] text-[13.5px] font-medium transition-colors";
          const content = (
            <>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                {n.icon}
              </svg>
              {n.label}
              {n.disabled && <span className="ml-auto text-[10px] text-faint">em breve</span>}
            </>
          );
          return n.disabled ? (
            <span key={n.href} className={`${cls} text-faint cursor-not-allowed`}>{content}</span>
          ) : (
            <Link
              key={n.href}
              href={n.href}
              className={`${cls} ${active ? "bg-brand-tint text-brand" : "text-muted hover:bg-surface-2 hover:text-text"}`}
            >
              {content}
            </Link>
          );
        })}
        <div className="flex-1" />
        <button onClick={logout} className="flex items-center gap-3 px-2.5 py-2 rounded-[9px] text-[13.5px] font-medium text-muted hover:bg-surface-2 hover:text-danger transition-colors">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
          </svg>
          Sair
        </button>
      </aside>
      <main className="p-6 md:p-7 overflow-auto">{children}</main>
    </div>
  );
}
