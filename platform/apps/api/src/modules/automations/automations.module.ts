import { Body, Controller, Delete, Get, Module, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { AutomationEngine } from "./automation-engine.service";
import { CreateAutomationDto } from "./dto/create-automation.dto";
import { JwtAuthGuard } from "../../common/auth/jwt-auth.guard";
import { CurrentUser } from "../../common/auth/current-user.decorator";
import { requireTenant } from "../../common/tenant/require-tenant";
import { AuthModule } from "../auth/auth.module";
import type { JwtPayload } from "../../common/auth/jwt-payload";

@Controller("automations")
@UseGuards(JwtAuthGuard)
class AutomationsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  list(@CurrentUser() user: JwtPayload) {
    return this.prisma.automation.findMany({
      where: { tenantId: requireTenant(user) },
      orderBy: { createdAt: "desc" },
    });
  }

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateAutomationDto) {
    const actions =
      dto.action === "SEND_MESSAGE"
        ? { type: "SEND_MESSAGE", body: dto.body ?? "" }
        : { type: "CREATE_ACTIVITY", activityType: dto.activityType ?? "TASK", title: dto.activityTitle ?? "Tarefa" };
    return this.prisma.automation.create({
      data: {
        tenantId: requireTenant(user),
        name: dto.name,
        trigger: { type: dto.trigger },
        actions,
        active: true,
      },
    });
  }

  @Patch(":id/toggle")
  async toggle(@CurrentUser() user: JwtPayload, @Param("id") id: string) {
    const tenantId = requireTenant(user);
    const a = await this.prisma.automation.findFirst({ where: { id, tenantId } });
    if (!a) return { ok: false };
    return this.prisma.automation.update({ where: { id }, data: { active: !a.active } });
  }

  @Delete(":id")
  async remove(@CurrentUser() user: JwtPayload, @Param("id") id: string) {
    await this.prisma.automation.deleteMany({ where: { id, tenantId: requireTenant(user) } });
    return { ok: true };
  }
}

@Module({
  imports: [AuthModule],
  controllers: [AutomationsController],
  providers: [AutomationEngine],
  exports: [AutomationEngine],
})
export class AutomationsModule {}
