import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { CrmService } from "./crm.service";
import { CreateLeadDto } from "./dto/create-lead.dto";
import { CreateDealDto } from "./dto/create-deal.dto";
import { MoveDealDto } from "./dto/move-deal.dto";
import { SendMessageDto } from "./dto/send-message.dto";
import { CreateTemplateDto } from "./dto/create-template.dto";
import { CreateActivityDto } from "./dto/create-activity.dto";
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

  // ---- Atendimento ----
  @Get("messages")
  listMessages(@CurrentUser() user: JwtPayload, @Query("leadId") leadId: string) {
    return this.crm.listMessages(requireTenant(user), leadId);
  }

  @Post("messages")
  sendMessage(@CurrentUser() user: JwtPayload, @Body() dto: SendMessageDto) {
    return this.crm.sendMessage(requireTenant(user), dto);
  }

  @Get("templates")
  listTemplates(@CurrentUser() user: JwtPayload) {
    return this.crm.listTemplates(requireTenant(user));
  }

  @Post("templates")
  createTemplate(@CurrentUser() user: JwtPayload, @Body() dto: CreateTemplateDto) {
    return this.crm.createTemplate(requireTenant(user), dto);
  }

  // ---- Agenda ----
  @Get("agenda")
  agenda(@CurrentUser() user: JwtPayload) {
    return this.crm.agenda(requireTenant(user));
  }

  @Post("activities")
  createActivity(@CurrentUser() user: JwtPayload, @Body() dto: CreateActivityDto) {
    return this.crm.createActivity(requireTenant(user), dto);
  }

  @Patch("activities/:id/done")
  completeActivity(@CurrentUser() user: JwtPayload, @Param("id") id: string) {
    return this.crm.completeActivity(requireTenant(user), id);
  }
}
