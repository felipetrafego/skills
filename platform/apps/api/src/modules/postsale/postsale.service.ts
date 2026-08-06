import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import type { JwtPayload } from "../../common/auth/jwt-payload";
import { CreateOfferDto } from "./dto/create-offer.dto";

@Injectable()
export class PostsaleService {
  constructor(private readonly prisma: PrismaService) {}

  partners() {
    return this.prisma.partner.findMany({
      where: { active: true },
      orderBy: { category: "asc" },
      select: { id: true, name: true, category: true, commissionRate: true },
    });
  }

  /** Marca o veículo como vendido (somente o dono) e abre a jornada de pós-venda. */
  async markSold(user: JwtPayload, vehicleId: string) {
    const vehicle = await this.assertOwnership(user, vehicleId);

    const sold = await this.prisma.vehicle.update({
      where: { id: vehicle.id },
      data: { status: "SOLD", soldAt: new Date() },
      select: { id: true, title: true, status: true, soldAt: true },
    });

    return { vehicle: sold, journey: await this.partners() };
  }

  /** Registra a contratação de um serviço e calcula a comissão da plataforma. */
  async createOffer(user: JwtPayload, dto: CreateOfferDto) {
    const vehicle = await this.assertOwnership(user, dto.vehicleId);

    const partner = await this.prisma.partner.findUnique({ where: { id: dto.partnerId } });
    if (!partner || !partner.active) throw new NotFoundException("Parceiro não encontrado");

    const amount = dto.amount != null ? new Prisma.Decimal(dto.amount) : null;
    const commission = amount ? amount.mul(partner.commissionRate) : null;

    return this.prisma.serviceOffer.create({
      data: {
        vehicleId: vehicle.id,
        sellerUserId: user.sub,
        partnerId: partner.id,
        type: partner.category,
        status: "CONTRACTED",
        amount: amount ?? undefined,
        commissionAmount: commission ?? undefined,
      },
    });
  }

  listOffers(user: JwtPayload, vehicleId: string) {
    return this.prisma.serviceOffer.findMany({
      where: { vehicleId, sellerUserId: user.sub },
      orderBy: { createdAt: "desc" },
      include: { partner: { select: { name: true, category: true } } },
    });
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
