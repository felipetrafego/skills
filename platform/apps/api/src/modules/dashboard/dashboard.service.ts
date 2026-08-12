import { Injectable } from "@nestjs/common";
import { DealStage } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async summary(tenantId: string) {
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const [leadsMonth, activeVehicles, soldMonth, viewsAgg, wonAgg, bySource, byStage] =
      await Promise.all([
        this.prisma.lead.count({ where: { tenantId, createdAt: { gte: monthStart } } }),
        this.prisma.vehicle.count({ where: { tenantId, status: "ACTIVE" } }),
        this.prisma.vehicle.count({
          where: { tenantId, status: "SOLD", soldAt: { gte: monthStart } },
        }),
        this.prisma.vehicle.aggregate({ where: { tenantId }, _sum: { views: true } }),
        this.prisma.deal.aggregate({
          where: { tenantId, stage: DealStage.WON, closedAt: { gte: monthStart } },
          _sum: { value: true },
        }),
        this.prisma.lead.groupBy({
          by: ["source"],
          where: { tenantId, createdAt: { gte: monthStart } },
          _count: { _all: true },
        }),
        this.prisma.deal.groupBy({
          by: ["stage"],
          where: { tenantId },
          _count: { _all: true },
        }),
      ]);

    const conversion = leadsMonth > 0 ? soldMonth / leadsMonth : 0;

    return {
      period: monthStart.toISOString(),
      kpis: {
        leads: leadsMonth,
        views: viewsAgg._sum.views ?? 0,
        activeVehicles,
        sold: soldMonth,
        conversion: Number(conversion.toFixed(4)),
        revenue: Number(wonAgg._sum.value ?? 0),
      },
      leadsBySource: bySource.map((r) => ({ source: r.source, count: r._count._all })),
      funnel: byStage.map((r) => ({ stage: r.stage, count: r._count._all })),
    };
  }
}
