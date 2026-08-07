"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Card } from "@motora/ui";
import { login, twofaLogin } from "@/lib/client-api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("ricardo@autoprime.com.br");
  const [password, setPassword] = useState("motora123");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [challenge, setChallenge] = useState<string | null>(null);
  const [code, setCode] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.require2fa && res.challenge) {
        setChallenge(res.challenge);
      } else {
        router.push("/painel");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao entrar");
    } finally {
      setLoading(false);
    }
  }

  async function onVerify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await twofaLogin(challenge!, code);
      router.push("/painel");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Código inválido");
    } finally {
      setLoading(false);
    }
  }

  const input =
    "w-full bg-surface-2 border border-border rounded-[10px] px-3.5 py-2.5 text-[14px] outline-none focus:border-brand transition-colors";

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
          {!challenge ? (
            <>
              <h1 className="text-[19px] font-semibold">Entrar no painel</h1>
              <p className="text-muted text-[13px] mt-1 mb-5">Acesse o ambiente da sua loja.</p>
              <form onSubmit={onSubmit} className="flex flex-col gap-3.5">
                <label className="flex flex-col gap-1.5">
                  <span className="text-[12.5px] font-medium text-muted">E-mail</span>
                  <input className={input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[12.5px] font-medium text-muted">Senha</span>
                  <input className={input} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </label>
                {error && <p className="text-danger text-[13px]">{error}</p>}
                <Button type="submit" loading={loading} className="w-full mt-1">Entrar</Button>
              </form>
            </>
          ) : (
            <>
              <h1 className="text-[19px] font-semibold">Verificação em duas etapas</h1>
              <p className="text-muted text-[13px] mt-1 mb-5">Digite o código de 6 dígitos do seu app autenticador.</p>
              <form onSubmit={onVerify} className="flex flex-col gap-3.5">
                <input
                  className={`${input} text-center tracking-[0.4em] text-[20px] font-semibold`}
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  autoFocus
                  required
                />
                {error && <p className="text-danger text-[13px]">{error}</p>}
                <Button type="submit" loading={loading} className="w-full mt-1">Verificar</Button>
                <button type="button" onClick={() => { setChallenge(null); setCode(""); setError(null); }} className="text-[12.5px] text-muted hover:text-text">
                  ← Voltar
                </button>
              </form>
            </>
          )}
        </Card>
        <p className="text-center text-[12.5px] text-muted mt-4">
          <Link href="/" className="hover:text-text">← Voltar ao marketplace</Link>
        </p>
      </div>
    </main>
  );
}
