import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

function csvCell(v: unknown): string {
  const s = v == null ? "" : String(v);
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
function toCsv(header: string[], rows: unknown[][]): string {
  // BOM para o Excel reconhecer UTF-8 corretamente
  return "﻿" + [header, ...rows].map((r) => r.map(csvCell).join(";")).join("\r\n");
}

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async summary(tenantId: string) {
    const [leads, wonDeals, activeVehicles, sold, bySource, byStage, topVehicles] =
      await Promise.all([
        this.prisma.lead.count({ where: { tenantId } }),
        this.prisma.deal.findMany({ where: { tenantId, stage: "WON" }, select: { value: true } }),
        this.prisma.vehicle.count({ where: { tenantId, status: "ACTIVE" } }),
        this.prisma.vehicle.count({ where: { tenantId, status: "SOLD" } }),
        this.prisma.lead.groupBy({ by: ["source"], where: { tenantId }, _count: { _all: true } }),
        this.prisma.deal.groupBy({ by: ["stage"], where: { tenantId }, _count: { _all: true } }),
        this.prisma.vehicle.findMany({
          where: { tenantId },
          orderBy: { views: "desc" },
          take: 5,
          select: { title: true, views: true, leadsCount: true, status: true },
        }),
      ]);

    const sales = wonDeals.length;
    const revenue = wonDeals.reduce((s, d) => s + Number(d.value ?? 0), 0);
    const conversion = leads > 0 ? sales / leads : 0;

    return {
      kpis: {
        leads,
        sales,
        sold,
        revenue,
        conversion: Number(conversion.toFixed(4)),
        activeVehicles,
        avgTicket: sales > 0 ? Math.round(revenue / sales) : 0,
      },
      leadsBySource: bySource.map((r) => ({ source: r.source, count: r._count._all })),
      dealsByStage: byStage.map((r) => ({ stage: r.stage, count: r._count._all })),
      topVehicles,
    };
  }

  async leadsCsv(tenantId: string): Promise<string> {
    const rows = await this.prisma.lead.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
      include: { vehicle: { select: { title: true } } },
    });
    return toCsv(
      ["Data", "Nome", "Telefone", "E-mail", "Origem", "Veículo"],
      rows.map((l) => [
        l.createdAt.toISOString().slice(0, 10),
        l.name,
        l.phone ?? "",
        l.email ?? "",
        l.source,
        l.vehicle?.title ?? "",
      ]),
    );
  }

  async dealsCsv(tenantId: string): Promise<string> {
    const rows = await this.prisma.deal.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
      include: { lead: { select: { name: true } }, vehicle: { select: { title: true } } },
    });
    return toCsv(
      ["Data", "Cliente", "Veículo", "Estágio", "Valor", "Fechado em"],
      rows.map((d) => [
        d.createdAt.toISOString().slice(0, 10),
        d.lead.name,
        d.vehicle?.title ?? "",
        d.stage,
        d.value ? Number(d.value).toFixed(2) : "",
        d.closedAt ? d.closedAt.toISOString().slice(0, 10) : "",
      ]),
    );
  }
}
