import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import type { JwtPayload } from "../../common/auth/jwt-payload";
import { StorageService } from "./storage.service";
import { PresignDto } from "./dto/presign.dto";
import { ConfirmMediaDto } from "./dto/confirm-media.dto";

@Injectable()
export class MediaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  /** Passo 1: cliente pede uma URL de upload para o arquivo. */
  async presign(user: JwtPayload, vehicleId: string, dto: PresignDto) {
    await this.assertOwnership(user, vehicleId);
    const key = this.storage.buildKey(vehicleId, dto.filename);
    return { ...this.storage.presign(key), type: dto.type, contentType: dto.contentType };
  }

  /** Passo 3: cliente confirma o upload e a mídia é anexada ao veículo. */
  async confirm(user: JwtPayload, vehicleId: string, dto: ConfirmMediaDto) {
    await this.assertOwnership(user, vehicleId);

    const position =
      dto.position ??
      (await this.prisma.vehicleMedia.count({ where: { vehicleId } }));

    return this.prisma.vehicleMedia.create({
      data: {
        vehicleId,
        type: dto.type,
        url: dto.url,
        thumbUrl: dto.thumbUrl,
        position,
      },
    });
  }

  list(vehicleId: string) {
    return this.prisma.vehicleMedia.findMany({
      where: { vehicleId },
      orderBy: { position: "asc" },
    });
  }

  async remove(user: JwtPayload, mediaId: string) {
    const media = await this.prisma.vehicleMedia.findUnique({ where: { id: mediaId } });
    if (!media) throw new NotFoundException("Mídia não encontrada");
    await this.assertOwnership(user, media.vehicleId);
    await this.prisma.vehicleMedia.delete({ where: { id: mediaId } });
    return { ok: true };
  }

  /** Promove uma mídia a capa (posição 0) e reordena as demais. */
  async setCover(user: JwtPayload, mediaId: string) {
    const media = await this.prisma.vehicleMedia.findUnique({ where: { id: mediaId } });
    if (!media) throw new NotFoundException("Mídia não encontrada");
    await this.assertOwnership(user, media.vehicleId);

    const items = await this.prisma.vehicleMedia.findMany({
      where: { vehicleId: media.vehicleId },
      orderBy: { position: "asc" },
      select: { id: true },
    });
    const ordered = [mediaId, ...items.map((m) => m.id).filter((id) => id !== mediaId)];
    await this.prisma.$transaction(
      ordered.map((id, i) => this.prisma.vehicleMedia.update({ where: { id }, data: { position: i } })),
    );
    return { ok: true };
  }

  private async assertOwnership(user: JwtPayload, vehicleId: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: vehicleId },
      select: { id: true, ownerUserId: true, tenantId: true },
    });
    if (!vehicle) throw new NotFoundException("Veículo não encontrado");
    const owns =
      (vehicle.ownerUserId && vehicle.ownerUserId === user.sub) ||
      (vehicle.tenantId && vehicle.tenantId === user.tenantId);
    if (!owns) throw new ForbiddenException("Este veículo não pertence a você");
    return vehicle;
  }
}
