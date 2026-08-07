import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { SubscribeDto } from "./dto/subscribe.dto";

const PERIOD_DAYS = 30;

function addDays(base: Date, days: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

@Injectable()
export class BillingService {
  constructor(private readonly prisma: PrismaService) {}

  /** Estado da assinatura do tenant (para o painel financeiro). */
  async getSubscription(tenantId: string) {
    const sub = await this.prisma.subscription.findUnique({
      where: { tenantId },
      include: { plan: true },
    });

    const plan =
      sub?.plan ?? (await this.prisma.plan.findFirst({ where: { name: "Lojista" } }));

    const state = !sub
      ? "NONE"
      : sub.status === "ACTIVE" && sub.currentPeriodEnd < new Date()
        ? "PAST_DUE"
        : sub.status;

    return {
      state,
      plan: plan
        ? { name: plan.name, priceMonthly: Number(plan.priceMonthly) }
        : { name: "Lojista", priceMonthly: 997 },
      paymentMethod: sub?.paymentMethod ?? null,
      currentPeriodEnd: sub?.currentPeriodEnd ?? null,
    };
  }

  /** Cria a assinatura do tenant e emite a 1ª fatura (idempotente). */
  async subscribe(tenantId: string, dto: SubscribeDto) {
    const existing = await this.prisma.subscription.findUnique({ where: { tenantId } });
    if (existing) return this.getSubscription(tenantId);

    const plan = await this.prisma.plan.findFirst({ where: { name: "Lojista", active: true } });
    if (!plan) throw new NotFoundException("Plano Lojista não encontrado");

    const now = new Date();
    const sub = await this.prisma.subscription.create({
      data: {
        tenantId,
        planId: plan.id,
        status: "ACTIVE",
        currentPeriodStart: now,
        currentPeriodEnd: addDays(now, PERIOD_DAYS),
        paymentMethod: dto.paymentMethod,
      },
    });
    await this.prisma.invoice.create({
      data: {
        tenantId,
        subscriptionId: sub.id,
        amount: plan.priceMonthly,
        status: "OPEN",
        method: dto.paymentMethod,
        dueAt: now,
      },
    });

    return this.getSubscription(tenantId);
  }

  listInvoices(tenantId: string) {
    return this.prisma.invoice
      .findMany({ where: { tenantId }, orderBy: { dueAt: "desc" } })
      .then((rows) =>
        rows.map((i) => ({
          id: i.id,
          amount: Number(i.amount),
          status: i.status,
          method: i.method,
          dueAt: i.dueAt,
          paidAt: i.paidAt,
          nfUrl: i.nfUrl,
        })),
      );
  }

  /** Paga uma fatura (simulado) e renova o período da assinatura. */
  async payInvoice(tenantId: string, invoiceId: string) {
    const invoice = await this.prisma.invoice.findFirst({ where: { id: invoiceId, tenantId } });
    if (!invoice) throw new NotFoundException("Fatura não encontrada");
    if (invoice.status === "PAID") return { id: invoice.id, status: invoice.status };

    const paid = await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: "PAID", paidAt: new Date(), nfUrl: `/nf/${invoiceId}.pdf` },
    });

    if (invoice.subscriptionId) {
      const sub = await this.prisma.subscription.findUnique({
        where: { id: invoice.subscriptionId },
      });
      if (sub) {
        const now = new Date();
        const base = sub.currentPeriodEnd > now ? sub.currentPeriodEnd : now;
        await this.prisma.subscription.update({
          where: { id: sub.id },
          data: { status: "ACTIVE", currentPeriodEnd: addDays(base, PERIOD_DAYS) },
        });
      }
    }

    return { id: paid.id, status: paid.status, paidAt: paid.paidAt, nfUrl: paid.nfUrl };
  }
}
