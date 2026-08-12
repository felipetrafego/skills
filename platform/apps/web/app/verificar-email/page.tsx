"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@motora/ui";
import { verifyEmail } from "@/lib/client-api";

type State = "loading" | "ok" | "error" | "notoken";

export default function VerificarEmailPage() {
  const [state, setState] = useState<State>("loading");

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) return setState("notoken");
    verifyEmail(token)
      .then(() => setState("ok"))
      .catch(() => setState("error"));
  }, []);

  const content = {
    loading: { icon: "…", title: "Confirmando seu e-mail…", desc: "Um instante." },
    ok: { icon: "✓", title: "E-mail confirmado!", desc: "Sua conta está verificada. Você já pode usar a Motora normalmente." },
    error: { icon: "!", title: "Link inválido ou expirado", desc: "Peça um novo link de verificação na sua conta." },
    notoken: { icon: "!", title: "Link incompleto", desc: "Abra o link exatamente como recebido no e-mail." },
  }[state];

  const tone = state === "ok" ? "text-success" : state === "loading" ? "text-muted" : "text-danger";

  return (
    <main className="min-h-screen grid place-items-center px-6">
      <div className="w-full max-w-[400px]">
        <div className="flex items-center gap-2 font-bold text-[17px] tracking-tight mb-6 justify-center">
          <span className="w-[28px] h-[28px] rounded-lg grid place-items-center bg-brand text-white">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 13l1.5-4.5A2 2 0 0 1 8.4 7h7.2a2 2 0 0 1 1.9 1.5L19 13" />
              <path d="M5 13h14v4H5z" />
            </svg>
          </span>
          Motora
        </div>
        <Card className="p-7 text-center">
          <div className={`w-12 h-12 rounded-full grid place-items-center mx-auto mb-4 text-[22px] font-bold ${tone} bg-surface-2`}>
            {content.icon}
          </div>
          <h1 className="text-[18px] font-semibold">{content.title}</h1>
          <p className="text-muted text-[13px] mt-2">{content.desc}</p>
          <Link href="/painel" className="inline-block mt-5 text-[13px] text-brand hover:underline">
            Ir para o painel →
          </Link>
        </Card>
      </div>
    </main>
  );
}
