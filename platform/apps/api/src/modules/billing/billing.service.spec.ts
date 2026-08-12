import { BillingService } from "./billing.service";
import type { PrismaService } from "../../prisma/prisma.service";

function makePrisma() {
  return {
    subscription: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
    plan: { findFirst: jest.fn() },
    invoice: { aggregate: jest.fn(), findMany: jest.fn(), create: jest.fn(), findFirst: jest.fn(), update: jest.fn() },
    vehicle: { aggregate: jest.fn() },
    featurePurchase: { aggregate: jest.fn() },
    serviceOffer: { aggregate: jest.fn() },
  };
}

describe("BillingService.summary", () => {
  let prisma: ReturnType<typeof makePrisma>;
  let service: BillingService;

  beforeEach(() => {
    prisma = makePrisma();
    service = new BillingService(prisma as unknown as PrismaService);
  });

  it("agrega receita de vendas, destaques, comissões e MRR (assinatura ativa)", async () => {
    const future = new Date(Date.now() + 5 * 864e5);
    prisma.subscription.findUnique.mockResolvedValue({
      status: "ACTIVE", currentPeriodEnd: future, paymentMethod: "PIX",
      plan: { name: "Lojista", priceMonthly: 997 },
    });
    prisma.vehicle.aggregate.mockResolvedValue({ _sum: { price: 245000 }, _count: 1 });
    prisma.featurePurchase.aggregate.mockResolvedValue({ _sum: { amount: 598 }, _count: 2 });
    prisma.serviceOffer.aggregate.mockResolvedValue({ _sum: { commissionAmount: 150 }, _count: 3 });
    prisma.invoice.aggregate.mockResolvedValue({ _sum: { amount: 0 }, _count: 0 });

    const s = await service.summary("t1");

    expect(s).toMatchObject({
      mrr: 997,
      salesRevenue: 245000, salesCount: 1,
      featuredSpend: 598, featuredCount: 2,
      postsaleCommissions: 150, postsaleCount: 3,
      openInvoicesAmount: 0, openInvoicesCount: 0,
    });
  });

  it("MRR é zero quando não há assinatura, e sums nulos viram 0", async () => {
    prisma.subscription.findUnique.mockResolvedValue(null);
    prisma.plan.findFirst.mockResolvedValue({ name: "Lojista", priceMonthly: 997 });
    prisma.vehicle.aggregate.mockResolvedValue({ _sum: { price: null }, _count: 0 });
    prisma.featurePurchase.aggregate.mockResolvedValue({ _sum: { amount: null }, _count: 0 });
    prisma.serviceOffer.aggregate.mockResolvedValue({ _sum: { commissionAmount: null }, _count: 0 });
    prisma.invoice.aggregate.mockResolvedValue({ _sum: { amount: null }, _count: 0 });

    const s = await service.summary("t1");

    expect(s.mrr).toBe(0);
    expect(s.salesRevenue).toBe(0);
    expect(s.postsaleCommissions).toBe(0);
  });
});
