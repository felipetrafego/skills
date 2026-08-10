import { AutomationEngine } from "./automation-engine.service";
import type { PrismaService } from "../../prisma/prisma.service";

function makePrisma(autos: unknown[]) {
  return {
    automation: { findMany: jest.fn().mockResolvedValue(autos) },
    message: { create: jest.fn().mockResolvedValue({}) },
    activity: { create: jest.fn().mockResolvedValue({}) },
  };
}

const TENANT = "t1";
const CTX = { leadId: "l1", leadName: "Marina", vehicleTitle: "BMW 320i 2022" };

describe("AutomationEngine", () => {
  it("envia mensagem interpolando {{nome}} e {{veiculo}} quando o gatilho casa", async () => {
    const prisma = makePrisma([
      { id: "a1", trigger: { type: "LEAD_CREATED" }, actions: { type: "SEND_MESSAGE", body: "Oi {{nome}}, sobre o {{veiculo}}?" } },
    ]);
    const engine = new AutomationEngine(prisma as unknown as PrismaService);

    await engine.run(TENANT, "LEAD_CREATED", CTX);

    expect(prisma.message.create).toHaveBeenCalledTimes(1);
    const data = prisma.message.create.mock.calls[0][0].data;
    expect(data.body).toBe("Oi Marina, sobre o BMW 320i 2022?");
    expect(data).toMatchObject({ tenantId: TENANT, leadId: "l1", direction: "OUT" });
  });

  it("interpola 'veículo' com acento também", async () => {
    const prisma = makePrisma([
      { id: "a1", trigger: { type: "LEAD_CREATED" }, actions: { type: "SEND_MESSAGE", body: "Sobre o {{veículo}}" } },
    ]);
    const engine = new AutomationEngine(prisma as unknown as PrismaService);
    await engine.run(TENANT, "LEAD_CREATED", CTX);
    expect(prisma.message.create.mock.calls[0][0].data.body).toBe("Sobre o BMW 320i 2022");
  });

  it("não dispara quando o gatilho não casa", async () => {
    const prisma = makePrisma([
      { id: "a1", trigger: { type: "DEAL_WON" }, actions: { type: "SEND_MESSAGE", body: "x" } },
    ]);
    const engine = new AutomationEngine(prisma as unknown as PrismaService);
    await engine.run(TENANT, "LEAD_CREATED", CTX);
    expect(prisma.message.create).not.toHaveBeenCalled();
  });

  it("cria atividade para a ação CREATE_ACTIVITY", async () => {
    const prisma = makePrisma([
      { id: "a1", trigger: { type: "VEHICLE_SOLD" }, actions: { type: "CREATE_ACTIVITY", activityType: "TASK", title: "Pós-venda {{nome}}" } },
    ]);
    const engine = new AutomationEngine(prisma as unknown as PrismaService);
    await engine.run(TENANT, "VEHICLE_SOLD", CTX);
    expect(prisma.activity.create).toHaveBeenCalledTimes(1);
    expect(prisma.activity.create.mock.calls[0][0].data.title).toBe("Pós-venda Marina");
  });

  it("a falha de uma automação não interrompe as demais", async () => {
    const prisma = makePrisma([
      { id: "a1", trigger: { type: "LEAD_CREATED" }, actions: { type: "SEND_MESSAGE", body: "quebra" } },
      { id: "a2", trigger: { type: "LEAD_CREATED" }, actions: { type: "CREATE_ACTIVITY", title: "segue {{nome}}" } },
    ]);
    prisma.message.create.mockRejectedValueOnce(new Error("db down"));
    const engine = new AutomationEngine(prisma as unknown as PrismaService);

    await expect(engine.run(TENANT, "LEAD_CREATED", CTX)).resolves.toBeUndefined();
    expect(prisma.activity.create).toHaveBeenCalledTimes(1); // a segunda ainda roda
  });
});
