"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/client-api";
import { PanelShell } from "@/components/panel/PanelShell";

export default function PainelLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/entrar");
    } else {
      setOk(true);
    }
  }, [router]);

  if (!ok) {
    return (
      <div className="min-h-screen grid place-items-center text-muted text-sm">Carregando…</div>
    );
  }
  return <PanelShell>{children}</PanelShell>;
}
