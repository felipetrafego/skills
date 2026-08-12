import { Injectable, Logger } from "@nestjs/common";
import { ActivityType } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";

export interface TriggerContext {
  leadId?: string;
  leadName?: string;
  vehicleTitle?: string;
}

function interpolate(template: string, ctx: TriggerContext): string {
  return template
    .replace(/\{\{\s*nome\s*\}\}/gi, ctx.leadName ?? "")
    .replace(/\{\{\s*ve[ií]culo\s*\}\}/gi, ctx.vehicleTitle ?? "");
}

/**
 * Motor de automações: dispara ações das automações ativas cujo gatilho casa.
 * Chamado por CRM (lead criado, negócio ganho) e pós-venda (veículo vendido).
 * Falhas em uma automação não quebram o fluxo principal.
 */
@Injectable()
export class AutomationEngine {
  private readonly logger = new Logger(AutomationEngine.name);
  constructor(private readonly prisma: PrismaService) {}

  async run(tenantId: string, trigger: string, ctx: TriggerContext): Promise<void> {
    const autos = await this.prisma.automation.findMany({ where: { tenantId, active: true } });
    for (const a of autos) {
      const t = a.trigger as { type?: string };
      if (t.type !== trigger) continue;
      const action = a.actions as { type?: string; body?: string; activityType?: string; title?: string };
      try {
        if (action.type === "SEND_MESSAGE" && ctx.leadId) {
          await this.prisma.message.create({
            data: {
              tenantId,
              leadId: ctx.leadId,
              channel: "WHATSAPP",
              direction: "OUT",
              body: interpolate(action.body ?? "", ctx),
              status: "SENT",
            },
          });
        } else if (action.type === "CREATE_ACTIVITY") {
          await this.prisma.activity.create({
            data: {
              tenantId,
              type: (action.activityType as ActivityType) ?? ActivityType.TASK,
              title: interpolate(action.title ?? "Tarefa automática", ctx),
            },
          });
        }
      } catch (err) {
        this.logger.warn(`Automação ${a.id} falhou: ${(err as Error).message}`);
      }
    }
  }
}
