import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { FeaturedTier, Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import type { JwtPayload } from "../../common/auth/jwt-payload";
import type { PaidTier } from "./dto/feature.dto";

interface TierDef {
  tier: PaidTier;
  label: string;
  price: number;
  durationDays: number;
  reach: string;
}

const TIERS: Record<PaidTier, TierDef> = {
  BRONZE: { tier: "BRONZE", label: "Bronze", price: 49, durationDays: 7, reach: "Acima dos orgânicos · local" },
  SILVER: { tier: "SILVER", label: "Prata", price: 99, durationDays: 15, reach: "Topo da categoria · regional" },
  GOLD: { tier: "GOLD", label: "Ouro", price: 199, durationDays: 30, reach: "Destaque na home · estadual" },
  PLATINUM: { tier: "PLATINUM", label: "Platinum", price: 399, durationDays: 30, reach: "1ª posição + push · nacional" },
};

function addDays(base: Date, days: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

@Injectable()
export class FeaturedService {
  constructor(private readonly prisma: PrismaService) {}

  tiers(): TierDef[] {
    return Object.values(TIERS);
  }

  async feature(user: JwtPayload, vehicleId: string, tier: PaidTier) {
    await this.assertOwnership(user, vehicleId);
    const def = TIERS[tier];
    const now = new Date();
    const until = addDays(now, def.durationDays);

    const [vehicle, purchase] = await this.prisma.$transaction([
      this.prisma.vehicle.update({
        where: { id: vehicleId },
        data: { featuredTier: tier as FeaturedTier, featuredUntil: until },
        select: { id: true, featuredTier: true, featuredUntil: true },
      }),
      this.prisma.featurePurchase.create({
        data: {
          vehicleId,
          buyerUserId: user.sub,
          tier: tier as FeaturedTier,
          amount: new Prisma.Decimal(def.price),
          durationDays: def.durationDays,
        },
      }),
    ]);

    return { vehicle, purchase: { tier: def.tier, amount: def.price, until } };
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
