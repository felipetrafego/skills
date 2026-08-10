import { PrismaClient, Fuel, Transmission, FeaturedTier } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Veículos de demonstração para a loja "auto-prime" — 4 BMWs de exemplo no
 * ecossistema. As fotos são placeholders ILUSTRATIVOS (SVG original em
 * /demo-cars), não fotos das montadoras. O lojista troca pela foto própria ou
 * licenciada via upload de mídia. As specs são apenas dados de exemplo.
 */
const DEMO = [
  {
    title: "BMW M4 Competition Coupé",
    version: "3.0 Bi-Turbo M Steptronic",
    yearFab: 2022, yearModel: 2023, price: "639900.00", mileageKm: 11200,
    color: "Alpine White", tier: FeaturedTier.PLATINUM, media: "/demo-cars/bmw-m4-competition-branco.svg",
    description: "M4 Competition impecável, revisões na concessionária, teto de fibra de carbono, bancos M Carbon.",
  },
  {
    title: "BMW 440i Coupé M Sport",
    version: "3.0 24V Turbo M Sport",
    yearFab: 2018, yearModel: 2019, price: "289900.00", mileageKm: 52400,
    color: "Tanzanite Blue", tier: FeaturedTier.GOLD, media: "/demo-cars/bmw-440i-msport-azul.svg",
    description: "440i M Sport com pacote Shadow Line, rodas 19\", interior caramelo, único dono.",
  },
  {
    title: "BMW M4 Coupé",
    version: "3.0 Bi-Turbo DCT",
    yearFab: 2016, yearModel: 2016, price: "379900.00", mileageKm: 38900,
    color: "Austin Yellow", tier: FeaturedTier.SILVER, media: "/demo-cars/bmw-m4-austin-yellow.svg",
    description: "M4 na icônica cor Austin Yellow, escapamento esportivo, pneus novos, manual e chave reserva.",
  },
  {
    title: "BMW M4 CS",
    version: "3.0 Bi-Turbo DCT (edição limitada)",
    yearFab: 2018, yearModel: 2019, price: "719900.00", mileageKm: 17600,
    color: "San Marino Blue", tier: FeaturedTier.PLATINUM, media: "/demo-cars/bmw-m4-cs-san-marino.svg",
    description: "Rara M4 CS, edição limitada, 460 cv, freios M Carbon-cerâmica, para colecionador.",
  },
];

async function main() {
  const tenant = await prisma.tenant.findUnique({ where: { slug: "auto-prime" } });
  if (!tenant) {
    throw new Error('Tenant "auto-prime" não encontrado. Rode `pnpm db:seed` primeiro.');
  }

  for (const d of DEMO) {
    const existing = await prisma.vehicle.findFirst({ where: { title: d.title, tenantId: tenant.id } });
    const data = {
      tenantId: tenant.id,
      title: d.title,
      description: d.description,
      make: "BMW",
      model: d.title.replace("BMW ", "").split(" ")[0]!, // M4 / 440i
      version: d.version,
      yearFab: d.yearFab,
      yearModel: d.yearModel,
      price: d.price,
      mileageKm: d.mileageKm,
      fuel: Fuel.GASOLINE,
      transmission: Transmission.AUTOMATIC,
      color: d.color,
      doors: 2,
      bodyType: "Cupê",
      city: "São Paulo",
      state: "SP",
      status: "ACTIVE" as const,
      featuredTier: d.tier,
      featuredUntil: new Date(Date.now() + 30 * 864e5),
      publishedAt: new Date(),
    };

    const vehicle = existing
      ? await prisma.vehicle.update({ where: { id: existing.id }, data })
      : await prisma.vehicle.create({ data });

    // Mídia ilustrativa (idempotente).
    await prisma.vehicleMedia.deleteMany({ where: { vehicleId: vehicle.id } });
    await prisma.vehicleMedia.create({
      data: { vehicleId: vehicle.id, type: "PHOTO", url: d.media, position: 0 },
    });
    console.log(`${existing ? "atualizado" : "criado"}: ${d.title}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
