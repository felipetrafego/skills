import { BadRequestException } from "@nestjs/common";
import { createHash } from "node:crypto";
import * as bcrypt from "bcryptjs";
import { AuthTokensService } from "./auth-tokens.service";
import type { PrismaService } from "../../prisma/prisma.service";
import type { ConfigService } from "@nestjs/config";
import type { MailService } from "./mail.service";

const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");

function makePrisma() {
  return {
    user: { findUnique: jest.fn(), update: jest.fn() },
    verificationToken: {
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
      create: jest.fn().mockResolvedValue({}),
      findUnique: jest.fn(),
      update: jest.fn().mockResolvedValue({}),
    },
  };
}

function makeConfig(overrides: Record<string, string> = {}) {
  return {
    get: jest.fn((key: string, def?: string) => overrides[key] ?? def),
  };
}

describe("AuthTokensService", () => {
  let prisma: ReturnType<typeof makePrisma>;
  let mail: { send: jest.Mock };
  let service: AuthTokensService;

  function build(configOverrides: Record<string, string> = {}) {
    const config = makeConfig(configOverrides);
    service = new AuthTokensService(
      prisma as unknown as PrismaService,
      config as unknown as ConfigService,
      mail as unknown as MailService,
    );
  }

  beforeEach(() => {
    prisma = makePrisma();
    mail = { send: jest.fn().mockResolvedValue(undefined) };
  });

  describe("requestPasswordReset", () => {
    it("responde ok sem criar token nem enviar e-mail para e-mail inexistente", async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      build();

      const res = await service.requestPasswordReset("ninguem@x.com");

      expect(res).toEqual({ ok: true });
      expect(prisma.verificationToken.create).not.toHaveBeenCalled();
      expect(mail.send).not.toHaveBeenCalled();
    });

    it("emite token (guardando só o hash), envia e-mail e invalida os anteriores", async () => {
      prisma.user.findUnique.mockResolvedValue({ id: "u1", name: "Ana", email: "ana@x.com" });
      build();

      const res = await service.requestPasswordReset("ana@x.com");

      expect(prisma.verificationToken.deleteMany).toHaveBeenCalledWith({
        where: { userId: "u1", type: "PASSWORD_RESET", usedAt: null },
      });
      const created = prisma.verificationToken.create.mock.calls[0][0].data;
      expect(created).toMatchObject({ userId: "u1", type: "PASSWORD_RESET" });
      expect(created.tokenHash).toMatch(/^[a-f0-9]{64}$/); // sha256 hex, nunca o token cru
      expect(created.expiresAt.getTime()).toBeGreaterThan(Date.now());
      expect(mail.send).toHaveBeenCalledWith(expect.objectContaining({ to: "ana@x.com" }));
      expect(res.ok).toBe(true);
      expect(res.devToken).toBeUndefined(); // sem o flag, não expõe
    });

    it("expõe o token apenas com AUTH_DEV_EXPOSE_TOKENS=true, e o hash guardado bate com ele", async () => {
      prisma.user.findUnique.mockResolvedValue({ id: "u1", name: "Ana", email: "ana@x.com" });
      build({ AUTH_DEV_EXPOSE_TOKENS: "true" });

      const res = await service.requestPasswordReset("ana@x.com");

      expect(res.devToken).toBeTruthy();
      const storedHash = prisma.verificationToken.create.mock.calls[0][0].data.tokenHash;
      expect(sha256(res.devToken as string)).toBe(storedHash);
    });
  });

  describe("resetPassword", () => {
    it("consome o token e grava a nova senha (hash bcrypt) + marca e-mail verificado", async () => {
      const raw = "token-cru-123456";
      prisma.verificationToken.findUnique.mockResolvedValue({
        id: "vt1", userId: "u1", type: "PASSWORD_RESET", usedAt: null,
        expiresAt: new Date(Date.now() + 60_000),
      });
      build();

      await service.resetPassword(raw, "NovaSenha123");

      // Buscou pelo hash, não pelo token cru.
      expect(prisma.verificationToken.findUnique).toHaveBeenCalledWith({ where: { tokenHash: sha256(raw) } });
      // Marcou como usado (uso único).
      expect(prisma.verificationToken.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: "vt1" }, data: expect.objectContaining({ usedAt: expect.any(Date) }) }),
      );
      const userUpdate = prisma.user.update.mock.calls[0][0];
      expect(userUpdate.where).toEqual({ id: "u1" });
      expect(userUpdate.data.emailVerifiedAt).toBeInstanceOf(Date);
      expect(await bcrypt.compare("NovaSenha123", userUpdate.data.passwordHash)).toBe(true);
    });

    it("rejeita token inexistente", async () => {
      prisma.verificationToken.findUnique.mockResolvedValue(null);
      build();
      await expect(service.resetPassword("x", "NovaSenha123")).rejects.toBeInstanceOf(BadRequestException);
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it("rejeita token expirado", async () => {
      prisma.verificationToken.findUnique.mockResolvedValue({
        id: "vt1", userId: "u1", type: "PASSWORD_RESET", usedAt: null,
        expiresAt: new Date(Date.now() - 1000),
      });
      build();
      await expect(service.resetPassword("x", "NovaSenha123")).rejects.toBeInstanceOf(BadRequestException);
    });

    it("rejeita token já usado", async () => {
      prisma.verificationToken.findUnique.mockResolvedValue({
        id: "vt1", userId: "u1", type: "PASSWORD_RESET", usedAt: new Date(),
        expiresAt: new Date(Date.now() + 60_000),
      });
      build();
      await expect(service.resetPassword("x", "NovaSenha123")).rejects.toBeInstanceOf(BadRequestException);
    });

    it("rejeita token de outro tipo (ex.: EMAIL_VERIFY não serve para reset)", async () => {
      prisma.verificationToken.findUnique.mockResolvedValue({
        id: "vt1", userId: "u1", type: "EMAIL_VERIFY", usedAt: null,
        expiresAt: new Date(Date.now() + 60_000),
      });
      build();
      await expect(service.resetPassword("x", "NovaSenha123")).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe("verifyEmail", () => {
    it("marca o e-mail como verificado ao consumir um token EMAIL_VERIFY válido", async () => {
      prisma.verificationToken.findUnique.mockResolvedValue({
        id: "vt2", userId: "u1", type: "EMAIL_VERIFY", usedAt: null,
        expiresAt: new Date(Date.now() + 60_000),
      });
      build();

      await service.verifyEmail("raw");

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: "u1" },
        data: { emailVerifiedAt: expect.any(Date) },
      });
    });
  });
});
