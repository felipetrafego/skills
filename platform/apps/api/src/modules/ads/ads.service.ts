import { Injectable } from "@nestjs/common";
import { AdPlacement } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class AdsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Anúncios patrocinados ativos para um placement. Contabiliza impressões. */
  async serve(placement: AdPlacement) {
    const now = new Date();
    const ads = await this.prisma.sponsorship.findMany({
      where: { placement, active: true, startAt: { lte: now }, endAt: { gte: now } },
      orderBy: { amount: "desc" },
      take: 3,
      select: {
        id: true,
        advertiser: true,
        category: true,
        title: true,
        description: true,
        ctaText: true,
        ctaUrl: true,
      },
    });

    if (ads.length > 0) {
      void this.prisma.sponsorship
        .updateMany({ where: { id: { in: ads.map((a) => a.id) } }, data: { impressions: { increment: 1 } } })
        .catch(() => undefined);
    }
    return ads;
  }

  async click(id: string) {
    await this.prisma.sponsorship
      .update({ where: { id }, data: { clicks: { increment: 1 } } })
      .catch(() => undefined);
    return { ok: true };
  }

  /** Painel admin: todas as campanhas com métricas. */
  list() {
    return this.prisma.sponsorship.findMany({ orderBy: { createdAt: "desc" } });
  }
}
