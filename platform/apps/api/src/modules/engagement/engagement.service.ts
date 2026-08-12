import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { ListingEventType } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import type { JwtPayload } from "../../common/auth/jwt-payload";
import { RecordEventDto } from "./dto/record-event.dto";

@Injectable()
export class EngagementService {
  constructor(private readonly prisma: PrismaService) {}

  // ---- Favoritos ----
  async toggleFavorite(userId: string, vehicleId: string) {
    const existing = await this.prisma.favorite.findUnique({
      where: { userId_vehicleId: { userId, vehicleId } },
    });

    if (existing) {
      await this.prisma.$transaction([
        this.prisma.favorite.delete({ where: { id: existing.id } }),
        this.prisma.vehicle.update({
          where: { id: vehicleId },
          data: { favoritesCount: { decrement: 1 } },
        }),
      ]);
      return { favorited: false };
    }

    await this.prisma.$transaction([
      this.prisma.favorite.create({ data: { userId, vehicleId } }),
      this.prisma.vehicle.update({
        where: { id: vehicleId },
        data: { favoritesCount: { increment: 1 } },
      }),
      this.prisma.listingEvent.create({
        data: { vehicleId, type: ListingEventType.FAVORITE },
      }),
    ]);
    return { favorited: true };
  }

  listFavorites(userId: string) {
    return this.prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { vehicle: { include: { media: { take: 1, orderBy: { position: "asc" } } } } },
    });
  }

  // ---- Eventos (analytics do anúncio) ----
  async recordEvent(vehicleId: string, dto: RecordEventDto) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id: vehicleId },
      select: { id: true },
    });
    if (!vehicle) throw new NotFoundException("Veículo não encontrado");

    await this.prisma.listingEvent.create({
      data: { vehicleId, type: dto.type, source: dto.source },
    });
    return { ok: true };
  }

  /** Estatísticas do anúncio para o dashboard do dono (pessoa física ou lojista). */
  async stats(user: JwtPayload, vehicleId: string) {
    const vehicle = await this.prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle) throw new NotFoundException("Veículo não encontrado");

    const owns =
      (vehicle.ownerUserId && vehicle.ownerUserId === user.sub) ||
      (vehicle.tenantId && vehicle.tenantId === user.tenantId);
    if (!owns) throw new ForbiddenException("Este anúncio não pertence a você");

    const events = await this.prisma.listingEvent.groupBy({
      by: ["type"],
      where: { vehicleId },
      _count: { _all: true },
    });
    const byType = Object.fromEntries(events.map((e) => [e.type, e._count._all]));

    return {
      vehicleId,
      title: vehicle.title,
      price: Number(vehicle.price),
      status: vehicle.status,
      views: vehicle.views,
      favorites: vehicle.favoritesCount,
      leads: vehicle.leadsCount,
      aiScore: vehicle.aiScore,
      events: {
        views: byType[ListingEventType.VIEW] ?? 0,
        clicks: byType[ListingEventType.CLICK] ?? 0,
        contacts: byType[ListingEventType.CONTACT] ?? 0,
        shares: byType[ListingEventType.SHARE] ?? 0,
        favorites: byType[ListingEventType.FAVORITE] ?? 0,
      },
    };
  }
}
