"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Card } from "@motora/ui";
import { resetPassword } from "@/lib/client-api";

const input =
  "w-full bg-surface-2 border border-border rounded-[10px] px-3.5 py-2.5 text-[14px] outline-none focus:border-brand transition-colors";

export default function RedefinirSenhaPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("token");
    setToken(t);
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) return setError("A senha deve ter ao menos 8 caracteres.");
    if (password !== confirm) return setError("As senhas não coincidem.");
    setLoading(true);
    try {
      await resetPassword(token!, password);
      setDone(true);
      setTimeout(() => router.push("/entrar"), 2200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível redefinir a senha.");
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
          {done ? (
            <>
              <h1 className="text-[19px] font-semibold">Senha atualizada</h1>
              <p className="text-muted text-[13px] mt-2">
                Pronto! Sua senha foi redefinida. Redirecionando para o login…
              </p>
              <Link href="/entrar" className="inline-block mt-5 text-[13px] text-brand hover:underline">
                Entrar agora →
              </Link>
            </>
          ) : token === null ? (
            <>
              <h1 className="text-[19px] font-semibold">Link inválido</h1>
              <p className="text-muted text-[13px] mt-2">
                Este link de redefinição está incompleto ou expirou.
              </p>
              <Link href="/esqueci-senha" className="inline-block mt-5 text-[13px] text-brand hover:underline">
                Solicitar um novo link →
              </Link>
            </>
          ) : (
            <>
              <h1 className="text-[19px] font-semibold">Criar nova senha</h1>
              <p className="text-muted text-[13px] mt-1 mb-5">Escolha uma senha com ao menos 8 caracteres.</p>
              <form onSubmit={onSubmit} className="flex flex-col gap-3.5">
                <label className="flex flex-col gap-1.5">
                  <span className="text-[12.5px] font-medium text-muted">Nova senha</span>
                  <input className={input} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoFocus />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-[12.5px] font-medium text-muted">Confirmar senha</span>
                  <input className={input} type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
                </label>
                {error && <p className="text-danger text-[13px]">{error}</p>}
                <Button type="submit" loading={loading} className="w-full mt-1">Redefinir senha</Button>
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
