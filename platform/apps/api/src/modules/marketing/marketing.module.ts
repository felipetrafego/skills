import { Body, Controller, Get, Module, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { MarketingService } from "./marketing.service";
import { CreateCampaignDto } from "./dto/create-campaign.dto";
import { CreateLandingDto, UpdateLandingDto } from "./dto/landing.dto";
import { JwtAuthGuard } from "../../common/auth/jwt-auth.guard";
import { CurrentUser } from "../../common/auth/current-user.decorator";
import { requireTenant } from "../../common/tenant/require-tenant";
import { AuthModule } from "../auth/auth.module";
import type { JwtPayload } from "../../common/auth/jwt-payload";

@Controller("marketing")
class MarketingController {
  constructor(private readonly marketing: MarketingService) {}

  // ---- Público ----
  @Get("l/:slug")
  publicLanding(@Param("slug") slug: string) {
    return this.marketing.publicLanding(slug);
  }

  // ---- Campanhas (autenticado) ----
  @Get("campaigns")
  @UseGuards(JwtAuthGuard)
  listCampaigns(@CurrentUser() user: JwtPayload) {
    return this.marketing.listCampaigns(requireTenant(user));
  }

  @Post("campaigns")
  @UseGuards(JwtAuthGuard)
  createCampaign(@CurrentUser() user: JwtPayload, @Body() dto: CreateCampaignDto) {
    return this.marketing.createCampaign(requireTenant(user), dto);
  }

  // ---- Landing pages (autenticado) ----
  @Get("landing")
  @UseGuards(JwtAuthGuard)
  listLanding(@CurrentUser() user: JwtPayload) {
    return this.marketing.listLanding(requireTenant(user));
  }

  @Post("landing")
  @UseGuards(JwtAuthGuard)
  createLanding(@CurrentUser() user: JwtPayload, @Body() dto: CreateLandingDto) {
    return this.marketing.createLanding(requireTenant(user), dto);
  }

  @Patch("landing/:id")
  @UseGuards(JwtAuthGuard)
  updateLanding(@CurrentUser() user: JwtPayload, @Param("id") id: string, @Body() dto: UpdateLandingDto) {
    return this.marketing.updateLanding(requireTenant(user), id, dto);
  }
}

@Module({
  imports: [AuthModule],
  controllers: [MarketingController],
  providers: [MarketingService],
})
export class MarketingModule {}
