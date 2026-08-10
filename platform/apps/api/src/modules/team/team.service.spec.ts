import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from "@nestjs/common";
import { TeamService } from "./team.service";
import type { PrismaService } from "../../prisma/prisma.service";

/** Mock mínimo do PrismaService cobrindo o que o TeamService usa. */
function makePrisma() {
  return {
    membership: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };
}

const TENANT = "t1";

describe("TeamService", () => {
  let prisma: ReturnType<typeof makePrisma>;
  let service: TeamService;

  beforeEach(() => {
    prisma = makePrisma();
    service = new TeamService(prisma as unknown as PrismaService);
  });

  describe("invite", () => {
    it("cria um usuário sem senha quando o e-mail é novo e o vincula ao tenant", async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({ id: "u9", name: "Nova", email: "nova@x.com" });
      prisma.membership.findUnique.mockResolvedValue(null);
      prisma.membership.create.mockResolvedValue({ id: "m9", role: "SELLER", status: "ACTIVE" });

      const res = await service.invite(TENANT, { name: "Nova", email: "nova@x.com", role: "SELLER" });

      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ email: "nova@x.com", type: "SHOPKEEPER" }) }),
      );
      // Nunca define passwordHash: o membro cria a senha pelo fluxo de reset.
      expect(prisma.user.create.mock.calls[0][0].data.passwordHash).toBeUndefined();
      expect(res).toMatchObject({ id: "m9", email: "nova@x.com", role: "SELLER" });
    });

    it("reaproveita um usuário existente sem recriá-lo", async () => {
      prisma.user.findUnique.mockResolvedValue({ id: "u1", name: "Ana", email: "ana@x.com" });
      prisma.membership.findUnique.mockResolvedValue(null);
      prisma.membership.create.mockResolvedValue({ id: "m1", role: "MANAGER", status: "ACTIVE" });

      await service.invite(TENANT, { name: "Ana", email: "ana@x.com", role: "MANAGER" });

      expect(prisma.user.create).not.toHaveBeenCalled();
      expect(prisma.membership.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ userId: "u1", tenantId: TENANT, role: "MANAGER" }) }),
      );
    });

    it("rejeita quando o usuário já faz parte da equipe", async () => {
      prisma.user.findUnique.mockResolvedValue({ id: "u1", name: "Ana", email: "ana@x.com" });
      prisma.membership.findUnique.mockResolvedValue({ id: "m1" });

      await expect(service.invite(TENANT, { name: "Ana", email: "ana@x.com", role: "SELLER" })).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(prisma.membership.create).not.toHaveBeenCalled();
    });
  });

  describe("changeRole", () => {
    it("altera o papel de um membro existente", async () => {
      prisma.membership.findFirst.mockResolvedValue({ id: "m2", role: "SELLER", tenantId: TENANT });
      prisma.membership.update.mockResolvedValue({ id: "m2", role: "MANAGER" });

      await service.changeRole(TENANT, "m2", "MANAGER");

      expect(prisma.membership.update).toHaveBeenCalledWith({ where: { id: "m2" }, data: { role: "MANAGER" } });
    });

    it("lança 404 quando o membro não existe no tenant", async () => {
      prisma.membership.findFirst.mockResolvedValue(null);
      await expect(service.changeRole(TENANT, "x", "SELLER")).rejects.toBeInstanceOf(NotFoundException);
    });

    it("impede rebaixar o último administrador", async () => {
      prisma.membership.findFirst
        .mockResolvedValueOnce({ id: "m1", role: "ADMIN", tenantId: TENANT }) // alvo
        .mockResolvedValueOnce({ id: "m1", role: "ADMIN" }); // isThisAdmin dentro de assertNotLastAdmin
      prisma.membership.count.mockResolvedValue(1);

      await expect(service.changeRole(TENANT, "m1", "MANAGER")).rejects.toBeInstanceOf(BadRequestException);
      expect(prisma.membership.update).not.toHaveBeenCalled();
    });

    it("permite rebaixar um admin quando há outro admin", async () => {
      prisma.membership.findFirst
        .mockResolvedValueOnce({ id: "m1", role: "ADMIN", tenantId: TENANT })
        .mockResolvedValueOnce({ id: "m1", role: "ADMIN" });
      prisma.membership.count.mockResolvedValue(2);
      prisma.membership.update.mockResolvedValue({ id: "m1", role: "MANAGER" });

      await service.changeRole(TENANT, "m1", "MANAGER");
      expect(prisma.membership.update).toHaveBeenCalled();
    });
  });

  describe("remove", () => {
    it("impede o usuário de remover a si mesmo", async () => {
      prisma.membership.findFirst.mockResolvedValue({ id: "m1", userId: "u1", role: "SELLER", tenantId: TENANT });
      await expect(service.remove(TENANT, "m1", "u1")).rejects.toBeInstanceOf(ForbiddenException);
      expect(prisma.membership.delete).not.toHaveBeenCalled();
    });

    it("impede remover o último administrador", async () => {
      prisma.membership.findFirst
        .mockResolvedValueOnce({ id: "m1", userId: "u1", role: "ADMIN", tenantId: TENANT }) // alvo
        .mockResolvedValueOnce({ id: "m1", role: "ADMIN" }); // isThisAdmin
      prisma.membership.count.mockResolvedValue(1);

      await expect(service.remove(TENANT, "m1", "outro")).rejects.toBeInstanceOf(BadRequestException);
      expect(prisma.membership.delete).not.toHaveBeenCalled();
    });

    it("remove um membro comum", async () => {
      prisma.membership.findFirst.mockResolvedValue({ id: "m2", userId: "u2", role: "SELLER", tenantId: TENANT });
      prisma.membership.delete.mockResolvedValue({ id: "m2" });

      const res = await service.remove(TENANT, "m2", "admin-user");
      expect(prisma.membership.delete).toHaveBeenCalledWith({ where: { id: "m2" } });
      expect(res).toEqual({ ok: true });
    });
  });
});
