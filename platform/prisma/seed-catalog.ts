import { PrismaClient, Transmission } from "@prisma/client";
import { CATALOG } from "./catalog";

const prisma = new PrismaClient();

async function main() {
  let processed = 0;

  for (const make of CATALOG) {
    for (const e of make.entries) {
      await prisma.catalogModel.upsert({
        where: { make_model_version: { make: make.make, model: e.model, version: e.version } },
        update: {
          segment: e.segment,
          bodyType: e.bodyType,
          fuel: e.fuel,
          doors: e.doors,
          yearFrom: e.yearFrom,
        },
        create: {
          make: make.make,
          model: e.model,
          version: e.version,
          segment: e.segment,
          bodyType: e.bodyType,
          fuel: e.fuel,
          transmission: Transmission.AUTOMATIC,
          doors: e.doors,
          yearFrom: e.yearFrom,
          // imageUrl fica nulo (placeholder) — fotos licenciadas entram depois.
        },
      });
      processed += 1;
    }
  }

  const byMake = await prisma.catalogModel.groupBy({
    by: ["make"],
    _count: { _all: true },
    orderBy: { make: "asc" },
  });
  const total = await prisma.catalogModel.count();
  console.log(`Catálogo: ${processed} modelos processados, ${total} no total.`);
  for (const m of byMake) console.log(`  - ${m.make}: ${m._count._all}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
