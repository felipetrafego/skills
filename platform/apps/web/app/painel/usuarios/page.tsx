"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Button, Badge } from "@motora/ui";
import {
  fetchTeam, fetchMe, inviteMember, changeMemberRole, removeMember,
  AuthError, type TeamMember, type MembershipRole, type Me,
} from "@/lib/client-api";

const ROLES: { value: MembershipRole; label: string; desc: string }[] = [
  { value: "ADMIN", label: "Administrador", desc: "Acesso total, gerencia equipe e cobrança" },
  { value: "MANAGER", label: "Gerente", desc: "Gerencia estoque, CRM e convida vendedores" },
  { value: "SELLER", label: "Vendedor", desc: "Atende leads e negociações" },
  { value: "MARKETING", label: "Marketing", desc: "Campanhas, landing pages e automações" },
  { value: "FINANCE", label: "Financeiro", desc: "Faturamento, comissões e relatórios" },
  { value: "SUPPORT", label: "Atendimento", desc: "Mensagens e agenda" },
];
const ROLE_LABEL = Object.fromEntries(ROLES.map((r) => [r.value, r.label])) as Record<MembershipRole, string>;
const ROLE_TONE: Record<MembershipRole, "brand" | "green" | "amber" | "muted"> = {
  ADMIN: "brand", MANAGER: "green", SELLER: "muted", MARKETING: "amber", FINANCE: "amber", SUPPORT: "muted",
};
const input = "w-full bg-surface-2 border border-border rounded-[10px] px-3.5 py-2.5 text-[14px] outline-none focus:border-brand";

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("");
}

export default function UsuariosPage() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [f, setF] = useState<{ name: string; email: string; role: MembershipRole }>({ name: "", email: "", role: "SELLER" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = me?.role === "ADMIN";
  const canInvite = me?.role === "ADMIN" || me?.role === "MANAGER";

  const reload = useCallback(() => {
    fetchTeam().then(setMembers).catch((e) => { if (e instanceof AuthError) router.replace("/entrar"); });
  }, [router]);

  useEffect(() => {
    fetchMe().then(setMe).catch((e) => { if (e instanceof AuthError) router.replace("/entrar"); });
    reload();
  }, [reload, router]);

  async function invite(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!f.name.trim() || !f.email.trim()) return;
    setBusy(true);
    try {
      await inviteMember({ name: f.name.trim(), email: f.email.trim(), role: f.role });
      setF({ name: "", email: "", role: "SELLER" });
      reload();
    } catch (e) {
      if (e instanceof AuthError) { router.replace("/entrar"); return; }
      setError(e instanceof Error ? e.message : "Não foi possível convidar");
    } finally {
      setBusy(false);
    }
  }

  async function onChangeRole(m: TeamMember, role: MembershipRole) {
    if (role === m.role) return;
    setError(null);
    try {
      await changeMemberRole(m.id, role);
      reload();
    } catch (e) {
      if (e instanceof AuthError) { router.replace("/entrar"); return; }
      setError(e instanceof Error ? e.message : "Não foi possível alterar o papel");
      reload();
    }
  }

  async function onRemove(m: TeamMember) {
    setError(null);
    try {
      await removeMember(m.id);
      reload();
    } catch (e) {
      if (e instanceof AuthError) { router.replace("/entrar"); return; }
      setError(e instanceof Error ? e.message : "Não foi possível remover");
    }
  }

  return (
    <div className="max-w-[860px]">
      <div className="mb-5">
        <p className="text-[11px] font-semibold tracking-[0.08em] uppercase text-faint">Configurações</p>
        <h1 className="text-[21px] font-semibold">Usuários & permissões</h1>
        <p className="text-muted text-[13px] mt-0.5">Convide sua equipe e defina o que cada pessoa pode acessar.</p>
      </div>

      {error && (
        <div className="mb-4 rounded-[10px] border border-danger/40 bg-danger-tint text-danger text-[13px] px-3.5 py-2.5">
          {error}
        </div>
      )}

      {canInvite && (
        <Card className="p-[16px] mb-4">
          <form onSubmit={invite} className="flex flex-col gap-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <input className={input} placeholder="Nome completo" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
              <input className={input} type="email" placeholder="E-mail" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
            </div>
            <div className="grid sm:grid-cols-[1fr_auto] gap-3 items-end">
              <label className="block">
                <span className="text-[12px] text-muted block mb-1">Papel</span>
                <select className={input} value={f.role} onChange={(e) => setF({ ...f, role: e.target.value as MembershipRole })}>
                  {ROLES.filter((r) => r.value !== "ADMIN" || isAdmin).map((r) => (
                    <option key={r.value} value={r.value}>{r.label} — {r.desc}</option>
                  ))}
                </select>
              </label>
              <Button type="submit" loading={busy}>Convidar</Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <div className="px-[18px] py-3 border-b border-border flex items-center justify-between">
          <b className="text-[13.5px]">Equipe</b>
          <span className="text-[12px] text-muted">{members.length} {members.length === 1 ? "membro" : "membros"}</span>
        </div>
        {members.length === 0 ? (
          <p className="text-muted text-[13px] p-8 text-center">Nenhum membro ainda.</p>
        ) : (
          members.map((m) => {
            const isSelf = me?.sub === m.userId;
            return (
              <div key={m.id} className="flex items-center gap-3 px-[18px] py-3.5 border-b border-border last:border-0">
                <span className="w-9 h-9 rounded-full grid place-items-center bg-surface-2 text-[12px] font-semibold text-muted flex-none">
                  {initials(m.name) || "?"}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-medium flex items-center gap-2">
                    {m.name}
                    {isSelf && <span className="text-[10px] text-faint font-normal">(você)</span>}
                  </div>
                  <div className="text-[12px] text-muted truncate">{m.email}</div>
                </div>
                {m.status !== "ACTIVE" && (
                  <Badge tone="amber">{m.status === "INVITED" ? "Convidado" : "Suspenso"}</Badge>
                )}
                {isAdmin && !isSelf ? (
                  <select
                    aria-label={`Papel de ${m.name}`}
                    className="bg-surface-2 border border-border rounded-[9px] px-2.5 py-1.5 text-[12.5px] outline-none focus:border-brand"
                    value={m.role}
                    onChange={(e) => onChangeRole(m, e.target.value as MembershipRole)}
                  >
                    {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                ) : (
                  <Badge tone={ROLE_TONE[m.role]}>{ROLE_LABEL[m.role] ?? m.role}</Badge>
                )}
                {isAdmin && !isSelf && (
                  <button
                    onClick={() => onRemove(m)}
                    aria-label={`Remover ${m.name}`}
                    className="w-8 h-8 rounded-[9px] border border-border grid place-items-center text-muted hover:text-danger hover:border-danger transition-colors flex-none"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /></svg>
                  </button>
                )}
              </div>
            );
          })
        )}
      </Card>

      <p className="text-[12px] text-faint mt-3">
        Novos membros definem a senha pelo fluxo &ldquo;esqueci minha senha&rdquo; ou entram por login social.
      </p>
    </div>
  );
}
