import { Injectable, NotFoundException } from "@nestjs/common";
import { DealStage, Prisma } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateLeadDto } from "./dto/create-lead.dto";
import { CreateDealDto } from "./dto/create-deal.dto";
import { MoveDealDto } from "./dto/move-deal.dto";
import { SendMessageDto } from "./dto/send-message.dto";
import { CreateTemplateDto } from "./dto/create-template.dto";
import { CreateActivityDto } from "./dto/create-activity.dto";

const PIPELINE: DealStage[] = [
  DealStage.NEW,
  DealStage.CONTACTED,
  DealStage.VISIT,
  DealStage.PROPOSAL,
  DealStage.NEGOTIATION,
  DealStage.WON,
];

@Injectable()
export class CrmService {
  constructor(private readonly prisma: PrismaService) {}

  // ---- Leads ----
  async createLead(tenantId: string, dto: CreateLeadDto) {
    const lead = await this.prisma.lead.create({
      data: {
        tenantId,
        name: dto.name,
        phone: dto.phone,
        email: dto.email,
        vehicleId: dto.vehicleId,
        source: dto.source ?? "MARKETPLACE",
      },
    });
    if (dto.vehicleId) {
      await this.prisma.vehicle
        .update({ where: { id: dto.vehicleId }, data: { leadsCount: { increment: 1 } } })
        .catch(() => undefined);
    }
    return lead;
  }

  listLeads(tenantId: string) {
    return this.prisma.lead.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { vehicle: { select: { title: true } } },
    });
  }

  // ---- Deals / pipeline ----
  async createDeal(tenantId: string, dto: CreateDealDto) {
    const lead = await this.prisma.lead.findFirst({ where: { id: dto.leadId, tenantId } });
    if (!lead) throw new NotFoundException("Lead não encontrado");

    return this.prisma.deal.create({
      data: {
        tenantId,
        leadId: dto.leadId,
        vehicleId: dto.vehicleId ?? lead.vehicleId,
        value: dto.value != null ? new Prisma.Decimal(dto.value) : undefined,
        assignedTo: dto.assignedTo,
        stage: DealStage.NEW,
      },
    });
  }

  async moveDeal(tenantId: string, dealId: string, dto: MoveDealDto) {
    const deal = await this.prisma.deal.findFirst({ where: { id: dealId, tenantId } });
    if (!deal) throw new NotFoundException("Negociação não encontrada");

    const closing = dto.stage === DealStage.WON || dto.stage === DealStage.LOST;
    return this.prisma.deal.update({
      where: { id: dealId },
      data: {
        stage: dto.stage,
        lostReason: dto.stage === DealStage.LOST ? dto.lostReason : null,
        closedAt: closing ? new Date() : null,
      },
    });
  }

  /** Board do pipeline: estágios com suas negociações e totais. */
  async board(tenantId: string) {
    const deals = await this.prisma.deal.findMany({
      where: { tenantId, stage: { not: DealStage.LOST } },
      orderBy: { createdAt: "desc" },
      include: {
        lead: { select: { name: true } },
        vehicle: { select: { title: true } },
      },
    });

    return PIPELINE.map((stage) => {
      const items = deals.filter((d) => d.stage === stage);
      const total = items.reduce((sum, d) => sum + Number(d.value ?? 0), 0);
      return { stage, count: items.length, total, deals: items };
    });
  }

  // ---- Atendimento (central de mensagens) ----
  async sendMessage(tenantId: string, dto: SendMessageDto) {
    const lead = await this.prisma.lead.findFirst({ where: { id: dto.leadId, tenantId } });
    if (!lead) throw new NotFoundException("Lead não encontrado");
    // Integração real (WhatsApp Cloud API / e-mail) entra aqui; por ora, registra a mensagem.
    return this.prisma.message.create({
      data: {
        tenantId,
        leadId: dto.leadId,
        channel: dto.channel,
        direction: "OUT",
        body: dto.body,
        templateId: dto.templateId,
        status: "SENT",
      },
    });
  }

  listMessages(tenantId: string, leadId: string) {
    return this.prisma.message.findMany({
      where: { tenantId, leadId },
      orderBy: { createdAt: "asc" },
      take: 200,
    });
  }

  listTemplates(tenantId: string) {
    return this.prisma.messageTemplate.findMany({ where: { tenantId }, orderBy: { name: "asc" } });
  }

  createTemplate(tenantId: string, dto: CreateTemplateDto) {
    return this.prisma.messageTemplate.create({
      data: { tenantId, name: dto.name, channel: dto.channel, body: dto.body },
    });
  }

  // ---- Agenda (atividades / tarefas) ----
  async createActivity(tenantId: string, dto: CreateActivityDto) {
    if (dto.dealId) {
      const deal = await this.prisma.deal.findFirst({ where: { id: dto.dealId, tenantId } });
      if (!deal) throw new NotFoundException("Negociação não encontrada");
    }
    return this.prisma.activity.create({
      data: {
        tenantId,
        type: dto.type,
        title: dto.title,
        dueAt: dto.dueAt ? new Date(dto.dueAt) : undefined,
        dealId: dto.dealId,
      },
    });
  }

  agenda(tenantId: string) {
    return this.prisma.activity.findMany({
      where: { tenantId },
      orderBy: [{ done: "asc" }, { dueAt: "asc" }, { createdAt: "desc" }],
      take: 100,
      include: { deal: { include: { lead: { select: { name: true } } } } },
    });
  }

  async completeActivity(tenantId: string, id: string) {
    const activity = await this.prisma.activity.findFirst({ where: { id, tenantId } });
    if (!activity) throw new NotFoundException("Atividade não encontrada");
    return this.prisma.activity.update({ where: { id }, data: { done: !activity.done } });
  }
}
