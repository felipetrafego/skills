"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Button, Badge } from "@motora/ui";
import {
  twofaStatus, twofaSetup, twofaEnable, twofaDisable, AuthError,
  emailVerificationStatus, requestEmailVerification,
} from "@/lib/client-api";

const input = "w-full bg-surface-2 border border-border rounded-[10px] px-3.5 py-2.5 text-[14px] outline-none focus:border-brand transition-colors";

export default function SegurancaPage() {
  const router = useRouter();
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [setup, setSetup] = useState<{ secret: string; otpauth: string } | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [emailVerified, setEmailVerified] = useState<boolean | null>(null);
  const [resendMsg, setResendMsg] = useState<string | null>(null);

  useEffect(() => {
    twofaStatus()
      .then((s) => setEnabled(s.enabled))
      .catch((e) => e instanceof AuthError && router.replace("/entrar"));
    emailVerificationStatus()
      .then((s) => setEmailVerified(s.verified))
      .catch(() => setEmailVerified(null));
  }, [router]);

  async function resendVerification() {
    setBusy(true);
    setResendMsg(null);
    try {
      const r = await requestEmailVerification();
      setResendMsg(r.alreadyVerified ? "Seu e-mail já está verificado." : "Enviamos um novo link de verificação.");
      if (r.alreadyVerified) setEmailVerified(true);
    } catch (e) {
      if (e instanceof AuthError) router.replace("/entrar");
    } finally {
      setBusy(false);
    }
  }

  async function startSetup() {
    setBusy(true);
    setError(null);
    try {
      setSetup(await twofaSetup());
    } catch (e) {
      if (e instanceof AuthError) router.replace("/entrar");
    } finally {
      setBusy(false);
    }
  }

  async function confirmEnable(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await twofaEnable(code);
      setEnabled(true);
      setSetup(null);
      setCode("");
      setMsg("Verificação em duas etapas ativada.");
    } catch {
      setError("Código inválido. Confira o app autenticador e tente de novo.");
    } finally {
      setBusy(false);
    }
  }

  async function confirmDisable(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await twofaDisable(code);
      setEnabled(false);
      setCode("");
      setMsg("Verificação em duas etapas desativada.");
    } catch {
      setError("Código inválido.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-[620px]">
      <div className="mb-5">
        <p className="text-[11px] font-semibold tracking-[0.08em] uppercase text-faint">Segurança</p>
        <h1 className="text-[21px] font-semibold">Verificação em duas etapas</h1>
        <p className="text-muted text-[13px] mt-0.5">Proteja o acesso ao painel com um código do seu app autenticador.</p>
      </div>

      {msg && <p className="text-success text-[13px] mb-3">{msg}</p>}

      {/* Verificação de e-mail */}
      <Card className="p-[20px] mb-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-[10px] grid place-items-center bg-brand-tint text-brand">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
            </span>
            <div>
              <b className="text-[14.5px]">E-mail da conta</b>
              <div className="text-[12px] text-muted">Confirmação por link enviado ao seu e-mail.</div>
            </div>
          </div>
          {emailVerified === null ? null : emailVerified ? (
            <Badge tone="green">Verificado</Badge>
          ) : (
            <Badge tone="amber">Não verificado</Badge>
          )}
        </div>
        {emailVerified === false && (
          <div className="border-t border-border pt-4 mt-4 flex items-center gap-3 flex-wrap">
            <Button size="sm" variant="ghost" onClick={resendVerification} loading={busy}>Reenviar verificação</Button>
            {resendMsg && <span className="text-[12.5px] text-success">{resendMsg}</span>}
          </div>
        )}
      </Card>

      <Card className="p-[20px]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-[10px] grid place-items-center bg-brand-tint text-brand">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6z" /><path d="M9 12l2 2 4-4" /></svg>
            </span>
            <div>
              <b className="text-[14.5px]">Autenticação 2FA (TOTP)</b>
              <div className="text-[12px] text-muted">Google Authenticator, Authy, 1Password…</div>
            </div>
          </div>
          {enabled === null ? null : enabled ? <Badge tone="green">Ativa</Badge> : <Badge tone="muted">Inativa</Badge>}
        </div>

        {enabled === false && !setup && (
          <Button onClick={startSetup} loading={busy}>Ativar 2FA</Button>
        )}

        {enabled === false && setup && (
          <div className="border-t border-border pt-4 mt-2">
            <p className="text-[13px] text-muted mb-2">1. Adicione esta chave no seu app autenticador (entrada manual):</p>
            <div className="font-mono text-[15px] font-semibold bg-surface-2 border border-border rounded-[10px] px-3.5 py-3 text-center tracking-[0.15em] break-all mb-1">
              {setup.secret}
            </div>
            <p className="text-[11.5px] text-faint break-all mb-4">{setup.otpauth}</p>
            <form onSubmit={confirmEnable} className="flex flex-col gap-3">
              <p className="text-[13px] text-muted">2. Digite o código de 6 dígitos gerado:</p>
              <input className={`${input} text-center tracking-[0.4em] text-[20px] font-semibold`} inputMode="numeric" maxLength={6} placeholder="000000" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} required />
              {error && <p className="text-danger text-[13px]">{error}</p>}
              <Button type="submit" loading={busy}>Confirmar e ativar</Button>
            </form>
          </div>
        )}

        {enabled === true && (
          <div className="border-t border-border pt-4 mt-2">
            <p className="text-[13px] text-muted mb-3">Para desativar, confirme com um código do app autenticador.</p>
            <form onSubmit={confirmDisable} className="flex items-end gap-2">
              <div className="flex-1">
                <input className={`${input} text-center tracking-[0.3em] font-semibold`} inputMode="numeric" maxLength={6} placeholder="000000" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} required />
              </div>
              <Button type="submit" variant="danger" loading={busy}>Desativar</Button>
            </form>
            {error && <p className="text-danger text-[13px] mt-2">{error}</p>}
          </div>
        )}
      </Card>
    </div>
  );
}
