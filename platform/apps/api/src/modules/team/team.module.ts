import { Body, Controller, Delete, Get, Module, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../common/auth/jwt-auth.guard";
import { RolesGuard } from "../../common/auth/roles.guard";
import { Roles } from "../../common/auth/roles.decorator";
import { CurrentUser } from "../../common/auth/current-user.decorator";
import { requireTenant } from "../../common/tenant/require-tenant";
import { AuthModule } from "../auth/auth.module";
import { TeamService } from "./team.service";
import { ChangeRoleDto, InviteMemberDto } from "./dto/team.dto";
import type { JwtPayload } from "../../common/auth/jwt-payload";

@Controller("team")
@UseGuards(JwtAuthGuard, RolesGuard)
class TeamController {
  constructor(private readonly team: TeamService) {}

  /** Qualquer membro autenticado enxerga a equipe. */
  @Get()
  list(@CurrentUser() user: JwtPayload) {
    return this.team.list(requireTenant(user));
  }

  @Post("invite")
  @Roles("ADMIN", "MANAGER")
  invite(@CurrentUser() user: JwtPayload, @Body() dto: InviteMemberDto) {
    return this.team.invite(requireTenant(user), dto);
  }

  @Patch(":id/role")
  @Roles("ADMIN")
  changeRole(@CurrentUser() user: JwtPayload, @Param("id") id: string, @Body() dto: ChangeRoleDto) {
    return this.team.changeRole(requireTenant(user), id, dto.role);
  }

  @Delete(":id")
  @Roles("ADMIN")
  remove(@CurrentUser() user: JwtPayload, @Param("id") id: string) {
    return this.team.remove(requireTenant(user), id, user.sub);
  }
}

@Module({
  imports: [AuthModule],
  controllers: [TeamController],
  providers: [TeamService],
})
export class TeamModule {}
