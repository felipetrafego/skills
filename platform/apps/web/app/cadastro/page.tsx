"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Card } from "@motora/ui";
import { register } from "@/lib/client-api";

const input =
  "w-full bg-surface-2 border border-border rounded-[10px] px-3.5 py-2.5 text-[14px] outline-none focus:border-brand transition-colors";

export default function CadastroPage() {
  const router = useRouter();
  const [f, setF] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function set<K extends keyof typeof f>(k: K, v: string) {
    setF((s) => ({ ...s, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (f.password.length < 8) return setError("A senha deve ter ao menos 8 caracteres.");
    setLoading(true);
    try {
      await register({
        name: f.name.trim(),
        email: f.email.trim(),
        password: f.password,
        phone: f.phone.trim() || undefined,
      });
      router.push("/painel/anunciar");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível criar a conta.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen grid place-items-center px-6 py-10">
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
        <Card className="p-6">
          <h1 className="text-[19px] font-semibold">Criar conta grátis</h1>
          <p className="text-muted text-[13px] mt-1 mb-5">Anuncie seu veículo sem custo e acompanhe as propostas.</p>
          <form onSubmit={onSubmit} className="flex flex-col gap-3.5">
            <label className="flex flex-col gap-1.5">
              <span className="text-[12.5px] font-medium text-muted">Nome completo</span>
              <input className={input} value={f.name} onChange={(e) => set("name", e.target.value)} required autoFocus />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[12.5px] font-medium text-muted">E-mail</span>
              <input className={input} type="email" value={f.email} onChange={(e) => set("email", e.target.value)} required />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[12.5px] font-medium text-muted">Celular <span className="text-faint font-normal">(opcional)</span></span>
              <input className={input} value={f.phone} onChange={(e) => set("phone", e.target.value)} placeholder="(11) 90000-0000" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[12.5px] font-medium text-muted">Senha</span>
              <input className={input} type="password" value={f.password} onChange={(e) => set("password", e.target.value)} required minLength={8} placeholder="Mínimo 8 caracteres" />
            </label>
            {error && <p className="text-danger text-[13px]">{error}</p>}
            <Button type="submit" loading={loading} className="w-full mt-1">Criar conta</Button>
          </form>
        </Card>
        <p className="text-center text-[12.5px] text-muted mt-4">
          Já tem conta? <Link href="/entrar" className="text-brand hover:underline">Entrar</Link>
        </p>
      </div>
    </main>
  );
}
