import { Controller, Get, Header, Module, Param, UseGuards } from "@nestjs/common";
import { ReportsService } from "./reports.service";
import { JwtAuthGuard } from "../../common/auth/jwt-auth.guard";
import { CurrentUser } from "../../common/auth/current-user.decorator";
import { requireTenant } from "../../common/tenant/require-tenant";
import { AuthModule } from "../auth/auth.module";
import type { JwtPayload } from "../../common/auth/jwt-payload";

@Controller("reports")
@UseGuards(JwtAuthGuard)
class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Get("summary")
  summary(@CurrentUser() user: JwtPayload) {
    return this.reports.summary(requireTenant(user));
  }

  /** Exportação CSV (abre no Excel). type = leads | deals */
  @Get("export/:type")
  @Header("Content-Type", "text/csv; charset=utf-8")
  export(@CurrentUser() user: JwtPayload, @Param("type") type: string) {
    const tenantId = requireTenant(user);
    return type === "deals" ? this.reports.dealsCsv(tenantId) : this.reports.leadsCsv(tenantId);
  }
}

@Module({
  imports: [AuthModule],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
