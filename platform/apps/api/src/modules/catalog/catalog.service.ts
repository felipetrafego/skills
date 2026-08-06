import { Injectable, NotFoundException } from "@nestjs/common";
import { Fuel, Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";

export interface CatalogQuery {
  make?: string;
  segment?: string;
  fuel?: Fuel;
  q?: string;
}

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async makes() {
    const rows = await this.prisma.catalogModel.groupBy({
      by: ["make"],
      where: { active: true },
      _count: { _all: true },
      orderBy: { make: "asc" },
    });
    return rows.map((r) => ({ make: r.make, models: r._count._all }));
  }

  models(query: CatalogQuery) {
    const where: Prisma.CatalogModelWhereInput = { active: true };
    if (query.make) where.make = { equals: query.make, mode: "insensitive" };
    if (query.segment) where.segment = { contains: query.segment, mode: "insensitive" };
    if (query.fuel) where.fuel = query.fuel;
    if (query.q) {
      where.OR = [
        { model: { contains: query.q, mode: "insensitive" } },
        { version: { contains: query.q, mode: "insensitive" } },
      ];
    }
    return this.prisma.catalogModel.findMany({
      where,
      orderBy: [{ make: "asc" }, { model: "asc" }, { version: "asc" }],
    });
  }

  async findOne(id: string) {
    const model = await this.prisma.catalogModel.findUnique({ where: { id } });
    if (!model) throw new NotFoundException("Modelo não encontrado no catálogo");
    return model;
  }
}
