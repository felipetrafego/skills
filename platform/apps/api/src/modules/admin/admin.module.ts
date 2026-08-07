import { Controller, Get, Module, UseGuards } from "@nestjs/common";
import { AdminService } from "./admin.service";
import { JwtAuthGuard } from "../../common/auth/jwt-auth.guard";
import { PlatformAdminGuard } from "../../common/auth/platform-admin.guard";
import { AuthModule } from "../auth/auth.module";

@Controller("admin")
@UseGuards(JwtAuthGuard, PlatformAdminGuard)
class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get("overview")
  overview() {
    return this.admin.overview();
  }

  @Get("tenants")
  tenants() {
    return this.admin.tenants();
  }
}

@Module({
  imports: [AuthModule],
  controllers: [AdminController],
  providers: [AdminService, PlatformAdminGuard],
})
export class AdminModule {}
