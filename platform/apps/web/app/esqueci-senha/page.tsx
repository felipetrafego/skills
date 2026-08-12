"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Card } from "@motora/ui";
import { forgotPassword } from "@/lib/client-api";

const input =
  "w-full bg-surface-2 border border-border rounded-[10px] px-3.5 py-2.5 text-[14px] outline-none focus:border-brand transition-colors";

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword(email.trim());
      setSent(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen grid place-items-center px-6">
      <div className="w-full max-w-[380px]">
        <div className="flex items-center gap-2 font-bold text-[17px] tracking-tight mb-6 justify-center">
          <span className="w-[28px] h-[28px] rounded-lg grid place-items-center bg-brand text-white">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 13l1.5-4.5A2 2 0 0 1 8.4 7h7.2a2 2 0 0 1 1.9 1.5L19 13" />
              <path d="M5 13h14v4H5z" />
            </svg>
          </span>
          Motora
        </div>
        <Card className="p-6">
          {sent ? (
            <>
              <h1 className="text-[19px] font-semibold">Verifique seu e-mail</h1>
              <p className="text-muted text-[13px] mt-2">
                Se houver uma conta com <b className="text-text">{email}</b>, enviamos um link para
                redefinir a senha. O link expira em 1 hora.
              </p>
              <Link href="/entrar" className="inline-block mt-5 text-[13px] text-brand hover:underline">
                ← Voltar para o login
              </Link>
            </>
          ) : (
            <>
              <h1 className="text-[19px] font-semibold">Redefinir senha</h1>
              <p className="text-muted text-[13px] mt-1 mb-5">
                Informe seu e-mail e enviaremos um link para criar uma nova senha.
              </p>
              <form onSubmit={onSubmit} className="flex flex-col gap-3.5">
                <label className="flex flex-col gap-1.5">
                  <span className="text-[12.5px] font-medium text-muted">E-mail</span>
                  <input className={input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
                </label>
                <Button type="submit" loading={loading} className="w-full mt-1">Enviar link</Button>
                <Link href="/entrar" className="text-[12.5px] text-muted hover:text-text text-center">
                  ← Voltar para o login
                </Link>
              </form>
            </>
          )}
        </Card>
      </div>
    </main>
  );
}
