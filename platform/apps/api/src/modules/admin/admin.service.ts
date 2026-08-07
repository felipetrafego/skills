import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  /** Métricas consolidadas da plataforma (todos os tenants). */
  async overview() {
    const [
      activeSubs,
      canceledSubs,
      totalTenants,
      totalUsers,
      paidInvoices,
      commissions,
      featured,
      vehicles,
      soldVehicles,
      leads,
    ] = await Promise.all([
      this.prisma.subscription.findMany({ where: { status: "ACTIVE" }, include: { plan: true } }),
      this.prisma.subscription.count({ where: { status: "CANCELED" } }),
      this.prisma.tenant.count(),
      this.prisma.user.count({ where: { type: "INDIVIDUAL" } }),
      this.prisma.invoice.aggregate({ where: { status: "PAID" }, _sum: { amount: true } }),
      this.prisma.serviceOffer.aggregate({ _sum: { commissionAmount: true } }),
      this.prisma.featurePurchase.aggregate({ _sum: { amount: true } }),
      this.prisma.vehicle.count(),
      this.prisma.vehicle.count({ where: { status: "SOLD" } }),
      this.prisma.lead.count(),
    ]);

    const advertising = await this.prisma.sponsorship.aggregate({
      where: { active: true },
      _sum: { amount: true },
    });

    const mrr = activeSubs.reduce((s, x) => s + Number(x.plan.priceMonthly), 0);
    const arr = mrr * 12;
    const activeTenants = activeSubs.length;
    const avgTicket = activeTenants > 0 ? mrr / activeTenants : 0;

    // churn simplificado: cancelados / (ativos + cancelados)
    const denom = activeTenants + canceledSubs;
    const churnRate = denom > 0 ? canceledSubs / denom : 0;
    // LTV estimado = ticket médio / churn (com piso quando churn ~ 0)
    const ltv = churnRate > 0 ? avgTicket / churnRate : avgTicket * 24;

    const subsRevenue = Number(paidInvoices._sum.amount ?? 0);
    const commissionRevenue = Number(commissions._sum.commissionAmount ?? 0);
    const featuredRevenue = Number(featured._sum.amount ?? 0);
    const advertisingRevenue = Number(advertising._sum.amount ?? 0);

    return {
      mrr,
      arr,
      activeTenants,
      totalTenants,
      totalUsers,
      churnRate: Number(churnRate.toFixed(4)),
      ltv: Math.round(ltv),
      avgTicket: Math.round(avgTicket),
      revenue: {
        subscriptions: subsRevenue,
        commissions: commissionRevenue,
        featured: featuredRevenue,
        advertising: advertisingRevenue,
        total: subsRevenue + commissionRevenue + featuredRevenue + advertisingRevenue,
      },
      catalog: { vehicles, soldVehicles, leads },
    };
  }

  async tenants() {
    const rows = await this.prisma.tenant.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        subscription: { select: { status: true } },
        _count: { select: { vehicles: true } },
      },
    });
    return rows.map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      status: t.status,
      subscriptionStatus: t.subscription?.status ?? "NONE",
      vehicles: t._count.vehicles,
      createdAt: t.createdAt,
    }));
  }
}
