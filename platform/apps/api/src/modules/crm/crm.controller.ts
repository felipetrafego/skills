import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { CrmService } from "./crm.service";
import { CreateLeadDto } from "./dto/create-lead.dto";
import { CreateDealDto } from "./dto/create-deal.dto";
import { MoveDealDto } from "./dto/move-deal.dto";
import { JwtAuthGuard } from "../../common/auth/jwt-auth.guard";
import { CurrentUser } from "../../common/auth/current-user.decorator";
import { requireTenant } from "../../common/tenant/require-tenant";
import type { JwtPayload } from "../../common/auth/jwt-payload";

@Controller("crm")
@UseGuards(JwtAuthGuard)
export class CrmController {
  constructor(private readonly crm: CrmService) {}

  @Post("leads")
  createLead(@CurrentUser() user: JwtPayload, @Body() dto: CreateLeadDto) {
    return this.crm.createLead(requireTenant(user), dto);
  }

  @Get("leads")
  listLeads(@CurrentUser() user: JwtPayload) {
    return this.crm.listLeads(requireTenant(user));
  }

  @Get("pipeline")
  board(@CurrentUser() user: JwtPayload) {
    return this.crm.board(requireTenant(user));
  }

  @Post("deals")
  createDeal(@CurrentUser() user: JwtPayload, @Body() dto: CreateDealDto) {
    return this.crm.createDeal(requireTenant(user), dto);
  }

  @Patch("deals/:id/move")
  moveDeal(
    @CurrentUser() user: JwtPayload,
    @Param("id") id: string,
    @Body() dto: MoveDealDto,
  ) {
    return this.crm.moveDeal(requireTenant(user), id, dto);
  }
}
