import { NotFoundException } from "@nestjs/common";
import { MediaService } from "./media.service";
import type { PrismaService } from "../../prisma/prisma.service";
import type { StorageService } from "./storage.service";
import type { JwtPayload } from "../../common/auth/jwt-payload";

function makePrisma() {
  return {
    vehicle: { findUnique: jest.fn() },
    vehicleMedia: { findUnique: jest.fn(), findMany: jest.fn(), update: jest.fn((a: unknown) => a) },
    // $transaction recebe um array de "operações" (aqui, os próprios args de update).
    $transaction: jest.fn((ops: unknown[]) => Promise.resolve(ops)),
  };
}

const user: JwtPayload = { sub: "u1", email: "a@b.com", type: "SHOPKEEPER", tenantId: "t1" };

describe("MediaService.setCover", () => {
  let prisma: ReturnType<typeof makePrisma>;
  let service: MediaService;

  beforeEach(() => {
    prisma = makePrisma();
    service = new MediaService(prisma as unknown as PrismaService, {} as StorageService);
  });

  it("promove a mídia escolhida para posição 0 e reordena as demais", async () => {
    prisma.vehicleMedia.findUnique.mockResolvedValue({ id: "m3", vehicleId: "v1" });
    prisma.vehicle.findUnique.mockResolvedValue({ id: "v1", ownerUserId: null, tenantId: "t1" });
    prisma.vehicleMedia.findMany.mockResolvedValue([{ id: "m1" }, { id: "m2" }, { id: "m3" }]);

    await service.setCover(user, "m3");

    // Ordem esperada: escolhida primeiro, depois as demais preservando a ordem.
    const ops = prisma.$transaction.mock.calls[0][0] as { where: { id: string }; data: { position: number } }[];
    expect(ops.map((o) => [o.where.id, o.data.position])).toEqual([
      ["m3", 0],
      ["m1", 1],
      ["m2", 2],
    ]);
  });

  it("lança 404 quando a mídia não existe", async () => {
    prisma.vehicleMedia.findUnique.mockResolvedValue(null);
    await expect(service.setCover(user, "x")).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
});
