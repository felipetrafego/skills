import { PrismaClient, Transmission } from "@prisma/client";
import { BMW_LINEUP } from "./catalog/bmw";

const prisma = new PrismaClient();

async function main() {
  const make = "BMW";
  let created = 0;

  for (const e of BMW_LINEUP) {
    await prisma.catalogModel.upsert({
      where: { make_model_version: { make, model: e.model, version: e.version } },
      update: {
        segment: e.segment,
        bodyType: e.bodyType,
        fuel: e.fuel,
        doors: e.doors,
        yearFrom: e.yearFrom,
      },
      create: {
        make,
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
    created += 1;
  }

  const total = await prisma.catalogModel.count({ where: { make } });
  console.log(`Catálogo BMW: ${created} modelos processados, ${total} no total.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
