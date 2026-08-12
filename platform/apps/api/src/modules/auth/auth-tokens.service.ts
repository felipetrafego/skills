import { BadRequestException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createHash, randomBytes } from "node:crypto";
import * as bcrypt from "bcryptjs";
import type { VerificationTokenType } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { MailService } from "./mail.service";

const RESET_TTL_MINUTES = 60; // 1h
const VERIFY_TTL_MINUTES = 60 * 24; // 24h

function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}
function newRawToken(): string {
  return randomBytes(32).toString("base64url");
}

/** Fluxos de token por e-mail: redefinição de senha e verificação de e-mail. */
@Injectable()
export class AuthTokensService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly mail: MailService,
  ) {}

  private webBase(): string {
    return this.config.get<string>("CORS_ORIGIN", "http://localhost:3000");
  }

  /** Em dev (AUTH_DEV_EXPOSE_TOKENS=true) devolve o token no corpo para testes. */
  private exposed(raw: string): string | undefined {
    return this.config.get<string>("AUTH_DEV_EXPOSE_TOKENS") === "true" ? raw : undefined;
  }

  private async issue(userId: string, type: VerificationTokenType, ttlMinutes: number): Promise<string> {
    // Invalida tokens anteriores do mesmo tipo (só o mais recente vale).
    await this.prisma.verificationToken.deleteMany({ where: { userId, type, usedAt: null } });
    const raw = newRawToken();
    await this.prisma.verificationToken.create({
      data: {
        userId,
        type,
        tokenHash: hashToken(raw),
        expiresAt: new Date(Date.now() + ttlMinutes * 60_000),
      },
    });
    return raw;
  }

  private async consume(raw: string, type: VerificationTokenType) {
    const token = await this.prisma.verificationToken.findUnique({ where: { tokenHash: hashToken(raw) } });
    if (!token || token.type !== type || token.usedAt || token.expiresAt < new Date()) {
      throw new BadRequestException("Token inválido ou expirado");
    }
    await this.prisma.verificationToken.update({ where: { id: token.id }, data: { usedAt: new Date() } });
    return token;
  }

  // ---- Redefinição de senha ----
  async requestPasswordReset(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    // Resposta uniforme: não revela se o e-mail existe.
    if (!user) return { ok: true };

    const raw = await this.issue(user.id, "PASSWORD_RESET", RESET_TTL_MINUTES);
    const link = `${this.webBase()}/redefinir-senha?token=${encodeURIComponent(raw)}`;
    await this.mail.send({
      to: user.email,
      subject: "Redefinição de senha — Motora",
      text: `Olá, ${user.name}.\n\nPara redefinir sua senha, acesse:\n${link}\n\nO link expira em 1 hora. Se você não pediu, ignore este e-mail.`,
    });
    return { ok: true, devToken: this.exposed(raw) };
  }

  async resetPassword(raw: string, password: string) {
    const token = await this.consume(raw, "PASSWORD_RESET");
    await this.prisma.user.update({
      where: { id: token.userId },
      // Concluir a redefinição também confirma a posse do e-mail.
      data: { passwordHash: await bcrypt.hash(password, 10), emailVerifiedAt: new Date() },
    });
    // Invalida qualquer outro token de reset pendente do usuário.
    await this.prisma.verificationToken.deleteMany({
      where: { userId: token.userId, type: "PASSWORD_RESET", usedAt: null },
    });
    return { ok: true };
  }

  // ---- Verificação de e-mail ----
  async requestEmailVerification(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException("Usuário não encontrado");
    if (user.emailVerifiedAt) return { ok: true, alreadyVerified: true };

    const raw = await this.issue(user.id, "EMAIL_VERIFY", VERIFY_TTL_MINUTES);
    const link = `${this.webBase()}/verificar-email?token=${encodeURIComponent(raw)}`;
    await this.mail.send({
      to: user.email,
      subject: "Confirme seu e-mail — Motora",
      text: `Olá, ${user.name}.\n\nConfirme seu e-mail acessando:\n${link}\n\nO link expira em 24 horas.`,
    });
    return { ok: true, devToken: this.exposed(raw) };
  }

  async verifyEmail(raw: string) {
    const token = await this.consume(raw, "EMAIL_VERIFY");
    await this.prisma.user.update({ where: { id: token.userId }, data: { emailVerifiedAt: new Date() } });
    return { ok: true };
  }

  async emailStatus(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { emailVerifiedAt: true },
    });
    return { verified: !!user?.emailVerifiedAt };
  }
}
