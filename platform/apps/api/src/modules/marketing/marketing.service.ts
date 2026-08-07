import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { TenantContext } from "../../common/tenant/tenant-context";
import { CreateCampaignDto } from "./dto/create-campaign.dto";
import { CreateLandingDto, UpdateLandingDto } from "./dto/landing.dto";

@Injectable()
export class MarketingService {
  constructor(private readonly prisma: PrismaService) {}

  // ---- Campanhas ----
  listCampaigns(tenantId: string) {
    return this.prisma.campaign.findMany({ where: { tenantId }, orderBy: { createdAt: "desc" } });
  }

  createCampaign(tenantId: string, dto: CreateCampaignDto) {
    return this.prisma.campaign.create({
      data: {
        tenantId,
        name: dto.name,
        channel: dto.channel,
        budget: dto.budget != null ? new Prisma.Decimal(dto.budget) : undefined,
        status: "ACTIVE",
        utm: {
          source: dto.utmSource ?? dto.channel.toLowerCase(),
          medium: dto.utmMedium ?? "cpc",
          campaign: dto.utmCampaign ?? dto.name.toLowerCase().replace(/\s+/g, "-"),
        },
      },
    });
  }

  // ---- Landing pages ----
  listLanding(tenantId: string) {
    return this.prisma.landingPage.findMany({ where: { tenantId }, orderBy: { createdAt: "desc" } });
  }

  async createLanding(tenantId: string, dto: CreateLandingDto) {
    const exists = await this.prisma.landingPage.findFirst({ where: { tenantId, slug: dto.slug } });
    if (exists) throw new ConflictException("Já existe uma landing page com esse slug");
    return this.prisma.landingPage.create({
      data: {
        tenantId,
        slug: dto.slug,
        title: dto.title,
        published: false,
        content: {
          headline: dto.headline,
          subheadline: dto.subheadline ?? "",
          ctaText: dto.ctaText ?? "Tenho interesse",
          ctaUrl: dto.ctaUrl ?? "#",
        },
      },
    });
  }

  async updateLanding(tenantId: string, id: string, dto: UpdateLandingDto) {
    const page = await this.prisma.landingPage.findFirst({ where: { id, tenantId } });
    if (!page) throw new NotFoundException("Landing page não encontrada");

    const content = { ...(page.content as Record<string, unknown>) };
    for (const k of ["headline", "subheadline", "ctaText", "ctaUrl"] as const) {
      if (dto[k] !== undefined) content[k] = dto[k];
    }
    return this.prisma.landingPage.update({
      where: { id },
      data: {
        title: dto.title ?? page.title,
        published: dto.published ?? page.published,
        content: content as Prisma.InputJsonValue,
      },
    });
  }

  /** Público — landing page publicada, resolvida pelo tenant do contexto (x-tenant). */
  async publicLanding(slug: string) {
    const { tenantSlug } = TenantContext.get();
    if (!tenantSlug) throw new NotFoundException("Loja não informada");
    const tenant = await this.prisma.tenant.findUnique({ where: { slug: tenantSlug }, select: { id: true, name: true } });
    if (!tenant) throw new NotFoundException("Loja não encontrada");

    const page = await this.prisma.landingPage.findFirst({
      where: { tenantId: tenant.id, slug, published: true },
    });
    if (!page) throw new NotFoundException("Página não encontrada");
    return { store: tenant.name, slug: page.slug, title: page.title, content: page.content };
  }
}
