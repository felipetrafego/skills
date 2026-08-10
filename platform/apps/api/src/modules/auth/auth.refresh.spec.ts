import { UnauthorizedException } from "@nestjs/common";
import { AuthService } from "./auth.service";
import type { PrismaService } from "../../prisma/prisma.service";
import type { JwtService } from "@nestjs/jwt";
import type { ConfigService } from "@nestjs/config";

function makePrisma() {
  return {
    user: { findUnique: jest.fn() },
    refreshToken: {
      create: jest.fn().mockResolvedValue({}),
      findUnique: jest.fn(),
      update: jest.fn().mockResolvedValue({}),
      updateMany: jest.fn().mockResolvedValue({ count: 0 }),
    },
  };
}

function makeJwt() {
  return {
    signAsync: jest.fn().mockResolvedValue("signed.jwt.token"),
    verifyAsync: jest.fn(),
    decode: jest.fn().mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 3600 }),
  };
}

const config = { get: jest.fn((_k: string, d?: string) => d), getOrThrow: jest.fn(() => "secret") };

describe("AuthService — refresh rotation", () => {
  let prisma: ReturnType<typeof makePrisma>;
  let jwt: ReturnType<typeof makeJwt>;
  let service: AuthService;

  beforeEach(() => {
    prisma = makePrisma();
    jwt = makeJwt();
    service = new AuthService(
      prisma as unknown as PrismaService,
      jwt as unknown as JwtService,
      config as unknown as ConfigService,
    );
  });

  it("rotaciona: valida, emite novo par, revoga o token antigo e relê memberships", async () => {
    jwt.verifyAsync.mockResolvedValue({ sub: "u1" });
    prisma.refreshToken.findUnique.mockResolvedValue({
      id: "rt1", userId: "u1", revokedAt: null, expiresAt: new Date(Date.now() + 60_000),
    });
    prisma.user.findUnique.mockResolvedValue({
      id: "u1", email: "a@b.com", type: "SHOPKEEPER",
      memberships: [{ tenantId: "t1", role: "ADMIN" }],
    });

    const res = await service.refresh("old-refresh");

    expect(res.accessToken).toBeDefined();
    expect(res.refreshToken).toBeDefined();
    // Persistiu o novo refresh e revogou o antigo.
    expect(prisma.refreshToken.create).toHaveBeenCalled();
    expect(prisma.refreshToken.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "rt1" }, data: expect.objectContaining({ revokedAt: expect.any(Date) }) }),
    );
  });

  it("detecta reuso de token revogado: revoga toda a cadeia e recusa", async () => {
    jwt.verifyAsync.mockResolvedValue({ sub: "u1" });
    prisma.refreshToken.findUnique.mockResolvedValue({
      id: "rt1", userId: "u1", revokedAt: new Date(), expiresAt: new Date(Date.now() + 60_000),
    });

    await expect(service.refresh("reused")).rejects.toBeInstanceOf(UnauthorizedException);
    expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith({
      where: { userId: "u1", revokedAt: null },
      data: { revokedAt: expect.any(Date) },
    });
    expect(prisma.refreshToken.create).not.toHaveBeenCalled();
  });

  it("recusa token com assinatura inválida", async () => {
    jwt.verifyAsync.mockRejectedValue(new Error("bad signature"));
    await expect(service.refresh("forged")).rejects.toBeInstanceOf(UnauthorizedException);
    expect(prisma.refreshToken.findUnique).not.toHaveBeenCalled();
  });

  it("recusa token não encontrado no banco", async () => {
    jwt.verifyAsync.mockResolvedValue({ sub: "u1" });
    prisma.refreshToken.findUnique.mockResolvedValue(null);
    await expect(service.refresh("unknown")).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it("recusa token expirado", async () => {
    jwt.verifyAsync.mockResolvedValue({ sub: "u1" });
    prisma.refreshToken.findUnique.mockResolvedValue({
      id: "rt1", userId: "u1", revokedAt: null, expiresAt: new Date(Date.now() - 1000),
    });
    await expect(service.refresh("expired")).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it("recusa quando o sub do JWT não bate com o dono do token", async () => {
    jwt.verifyAsync.mockResolvedValue({ sub: "u1" });
    prisma.refreshToken.findUnique.mockResolvedValue({
      id: "rt1", userId: "OUTRO", revokedAt: null, expiresAt: new Date(Date.now() + 60_000),
    });
    await expect(service.refresh("mismatch")).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it("logout revoga o refresh token apresentado", async () => {
    const res = await service.logout("some-refresh");
    expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ data: { revokedAt: expect.any(Date) } }),
    );
    expect(res).toEqual({ ok: true });
  });
});
