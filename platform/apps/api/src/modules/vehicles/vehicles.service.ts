import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { TenantContext } from "../../common/tenant/tenant-context";
import type { JwtPayload } from "../../common/auth/jwt-payload";
import { QueryVehiclesDto } from "./dto/query-vehicles.dto";
import { CreateVehicleDto } from "./dto/create-vehicle.dto";
import { UpdateVehicleDto } from "./dto/update-vehicle.dto";

@Injectable()
export class VehiclesService {
  constructor(private readonly prisma: PrismaService) {}

  /** Busca pública do marketplace. Se houver tenant no contexto (vitrine da loja),
   *  filtra pelo estoque daquele tenant; caso contrário, mostra todos os anúncios ativos. */
  async search(query: QueryVehiclesDto) {
    const where: Prisma.VehicleWhereInput = { status: "ACTIVE" };

    const { tenantSlug } = TenantContext.get();
    if (tenantSlug) {
      where.tenant = { slug: tenantSlug };
    }

    if (query.q) {
      where.OR = [
        { title: { contains: query.q, mode: "insensitive" } },
        { description: { contains: query.q, mode: "insensitive" } },
      ];
    }
    if (query.make) where.make = { equals: query.make, mode: "insensitive" };
    if (query.model) where.model = { equals: query.model, mode: "insensitive" };
    if (query.city) where.city = { equals: query.city, mode: "insensitive" };
    if (query.state) where.state = query.state;
    if (query.fuel) where.fuel = query.fuel;
    if (query.transmission) where.transmission = query.transmission;
    if (query.minYear) where.yearModel = { gte: query.minYear };
    if (query.minPrice || query.maxPrice) {
      where.price = {
        ...(query.minPrice ? { gte: query.minPrice } : {}),
        ...(query.maxPrice ? { lte: query.maxPrice } : {}),
      };
    }

    const orderBy = this.orderBy(query.sort);
    const skip = (query.page - 1) * query.pageSize;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.vehicle.findMany({
        where,
        orderBy,
        skip,
        take: query.pageSize,
        include: { media: { orderBy: { position: "asc" }, take: 1 } },
      }),
      this.prisma.vehicle.count({ where }),
    ]);

    return { items, total, page: query.page, pageSize: query.pageSize };
  }

  async findOne(id: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      include: {
        media: { orderBy: { position: "asc" } },
        options: { include: { option: true } },
        tenant: { select: { name: true, slug: true } },
      },
    });
    if (!vehicle) throw new NotFoundException("Veículo não encontrado");
    // fire-and-forget: registra visualização
    void this.prisma.vehicle
      .update({ where: { id }, data: { views: { increment: 1 } } })
      .catch(() => undefined);
    return vehicle;
  }

  async createForTenant(user: JwtPayload, dto: CreateVehicleDto) {
    return this.prisma.vehicle.create({
      data: {
        ...dto,
        price: new Prisma.Decimal(dto.price),
        tenantId: user.tenantId ?? null,
        ownerUserId: user.tenantId ? null : user.sub,
        status: "ACTIVE",
        publishedAt: new Date(),
      },
    });
  }

  /** Estoque do usuário autenticado (lojista: por tenant; pessoa física: por dono). */
  listMine(user: JwtPayload) {
    const where: Prisma.VehicleWhereInput = user.tenantId
      ? { tenantId: user.tenantId }
      : { ownerUserId: user.sub };
    return this.prisma.vehicle.findMany({
      where: { ...where, status: { not: "REMOVED" } },
      orderBy: { createdAt: "desc" },
      include: {
        media: { orderBy: { position: "asc" }, take: 1 },
        _count: { select: { media: true, leads: true } },
      },
    });
  }

  async update(user: JwtPayload, id: string, dto: UpdateVehicleDto) {
    await this.assertOwnership(user, id);
    const data: Prisma.VehicleUpdateInput = { ...dto };
    if (dto.price != null) data.price = new Prisma.Decimal(dto.price);
    if (dto.status === "SOLD") data.soldAt = new Date();
    return this.prisma.vehicle.update({ where: { id }, data });
  }

  async remove(user: JwtPayload, id: string) {
    await this.assertOwnership(user, id);
    await this.prisma.vehicle.delete({ where: { id } });
    return { ok: true };
  }

  private async assertOwnership(user: JwtPayload, id: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      select: { id: true, ownerUserId: true, tenantId: true },
    });
    if (!vehicle) throw new NotFoundException("Veículo não encontrado");
    const owns =
      (vehicle.ownerUserId && vehicle.ownerUserId === user.sub) ||
      (vehicle.tenantId && vehicle.tenantId === user.tenantId);
    if (!owns) throw new ForbiddenException("Este veículo não pertence a você");
    return vehicle;
  }

  private orderBy(sort?: string): Prisma.VehicleOrderByWithRelationInput[] {
    switch (sort) {
      case "price_asc":
        return [{ price: "asc" }];
      case "price_desc":
        return [{ price: "desc" }];
      case "newest":
        return [{ publishedAt: "desc" }];
      default:
        // relevância: destaques primeiro, depois recência
        return [{ featuredTier: "desc" }, { publishedAt: "desc" }];
    }
  }
}
