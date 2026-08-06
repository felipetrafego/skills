import { PrismaClient, Fuel, Transmission } from "@prisma/client";
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

  console.log("Seed concluído: plano, tenant, usuários e estoque de demonstração.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
