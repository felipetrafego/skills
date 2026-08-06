import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { TenantContext } from "../../common/tenant/tenant-context";

@Injectable()
export class TenantsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Dados públicos da vitrine do tenant resolvido no contexto do request. */
  async current() {
    const { tenantSlug } = TenantContext.get();
    if (!tenantSlug) throw new NotFoundException("Nenhum tenant no contexto");

    const tenant = await this.prisma.tenant.findUnique({
      where: { slug: tenantSlug },
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        settings: true,
        _count: { select: { vehicles: { where: { status: "ACTIVE" } } } },
      },
    });
    if (!tenant || tenant.status !== "ACTIVE") {
      throw new NotFoundException("Loja não encontrada");
    }
    return { ...tenant, activeVehicles: tenant._count.vehicles };
  }
}
