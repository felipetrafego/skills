import { PrismaClient, Fuel, Transmission, PartnerCategory } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Plano Lojista
  const plan = await prisma.plan.upsert({
    where: { name: "Lojista" },
    update: {},
    create: {
      name: "Lojista",
      priceMonthly: "997.00",
      features: {
        estoque: "ilimitado",
        crm: true,
        marketing: true,
        ia: true,
        api: true,
        landingPages: true,
      },
    },
  });

  // Tenant demonstração
  const tenant = await prisma.tenant.upsert({
    where: { slug: "auto-prime" },
    update: {},
    create: {
      name: "Auto Prime Veículos",
      slug: "auto-prime",
      planId: plan.id,
      status: "ACTIVE",
    },
  });

  // Usuário lojista + membership
  const shopUser = await prisma.user.upsert({
    where: { email: "ricardo@autoprime.com.br" },
    update: {},
    create: {
      name: "Ricardo Souza",
      email: "ricardo@autoprime.com.br",
      passwordHash: await bcrypt.hash("motora123", 10),
      type: "SHOPKEEPER",
    },
  });
  await prisma.membership.upsert({
    where: { userId_tenantId: { userId: shopUser.id, tenantId: tenant.id } },
    update: {},
    create: { userId: shopUser.id, tenantId: tenant.id, role: "ADMIN", joinedAt: new Date() },
  });

  // Super-admin da plataforma
  await prisma.user.upsert({
    where: { email: "admin@motora.com.br" },
    update: {},
    create: {
      name: "Admin Motora",
      email: "admin@motora.com.br",
      passwordHash: await bcrypt.hash("motora123", 10),
      type: "PLATFORM_ADMIN",
    },
  });

  // Pessoa física
  await prisma.user.upsert({
    where: { email: "comprador@exemplo.com" },
    update: {},
    create: {
      name: "Maria Silva",
      email: "comprador@exemplo.com",
      passwordHash: await bcrypt.hash("motora123", 10),
      type: "INDIVIDUAL",
    },
  });

  // Estoque do tenant
  const sample = [
    { title: "Jeep Compass Longitude", make: "Jeep", model: "Compass", price: "128900", km: 38400, fuel: Fuel.FLEX, tr: Transmission.AUTOMATIC, city: "São Paulo", state: "SP" },
    { title: "Chevrolet Onix Plus LTZ", make: "Chevrolet", model: "Onix Plus", price: "82500", km: 24100, fuel: Fuel.FLEX, tr: Transmission.AUTOMATIC, city: "Campinas", state: "SP" },
    { title: "Toyota Corolla XEi 2.0", make: "Toyota", model: "Corolla", price: "119900", km: 41000, fuel: Fuel.FLEX, tr: Transmission.CVT, city: "Guarulhos", state: "SP" },
    { title: "Volkswagen T-Cross Highline", make: "Volkswagen", model: "T-Cross", price: "129700", km: 33500, fuel: Fuel.FLEX, tr: Transmission.AUTOMATIC, city: "Osasco", state: "SP" },
  ];

  for (const v of sample) {
    const exists = await prisma.vehicle.findFirst({ where: { title: v.title, tenantId: tenant.id } });
    if (exists) continue;
    await prisma.vehicle.create({
      data: {
        tenantId: tenant.id,
        title: v.title,
        make: v.make,
        model: v.model,
        yearModel: 2023,
        yearFab: 2022,
        price: v.price,
        mileageKm: v.km,
        fuel: v.fuel,
        transmission: v.tr,
        city: v.city,
        state: v.state,
        status: "ACTIVE",
        publishedAt: new Date(),
      },
    });
  }

  // Parceiros da jornada de pós-venda
  const partners: { name: string; category: PartnerCategory; rate: string }[] = [
    { name: "Despachante Já", category: "TRANSFER", rate: "0.1500" },
    { name: "Porto Seguro Auto", category: "INSURANCE", rate: "0.1000" },
    { name: "Banco Motora Financiamento", category: "FINANCING", rate: "0.0200" },
    { name: "Garantia+", category: "WARRANTY", rate: "0.2000" },
    { name: "Vistoria Certa", category: "INSPECTION", rate: "0.1200" },
    { name: "Rastreia Brasil", category: "TRACKER", rate: "0.1800" },
    { name: "Estética Automotiva Prime", category: "CLEANING", rate: "0.1500" },
  ];
  for (const p of partners) {
    const exists = await prisma.partner.findFirst({ where: { name: p.name } });
    if (!exists) {
      await prisma.partner.create({
        data: { name: p.name, category: p.category, commissionRate: p.rate },
      });
    }
  }

  // Publicidade — espaços patrocinados (demonstração)
  const in90 = new Date();
  in90.setDate(in90.getDate() + 90);
  const ads: { advertiser: string; category: string; title: string; description: string; ctaText: string; amount: string }[] = [
    { advertiser: "Banco Motora", category: "Banco", title: "Financiamento com taxa a partir de 1,29% a.m.", description: "Simule em 1 minuto e aprove o financiamento do seu próximo carro.", ctaText: "Simular agora", amount: "8000" },
    { advertiser: "Porto Seguro Auto", category: "Seguradora", title: "Seguro auto com até 40% de desconto", description: "Cotação rápida e proteção completa para o seu veículo.", ctaText: "Fazer cotação", amount: "6500" },
  ];
  for (const a of ads) {
    const exists = await prisma.sponsorship.findFirst({ where: { advertiser: a.advertiser, title: a.title } });
    if (!exists) {
      await prisma.sponsorship.create({
        data: {
          advertiser: a.advertiser,
          category: a.category,
          title: a.title,
          description: a.description,
          ctaText: a.ctaText,
          ctaUrl: "#",
          placement: "HOME",
          pricing: "PERIOD",
          amount: a.amount,
          endAt: in90,
        },
      });
    }
  }

  console.log("Seed concluído: plano, tenant, usuários, estoque, parceiros e anúncios patrocinados.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
