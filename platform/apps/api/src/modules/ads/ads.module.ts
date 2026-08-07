import { Controller, Get, Module, Param, Post, Query, UseGuards } from "@nestjs/common";
import { AdPlacement } from "@prisma/client";
import { AdsService } from "./ads.service";
import { JwtAuthGuard } from "../../common/auth/jwt-auth.guard";
import { PlatformAdminGuard } from "../../common/auth/platform-admin.guard";
import { AuthModule } from "../auth/auth.module";

@Controller()
class AdsController {
  constructor(private readonly ads: AdsService) {}

  /** Público — serve os anúncios patrocinados de um placement (default HOME). */
  @Get("ads")
  serve(@Query("placement") placement?: string) {
    const p = (placement as AdPlacement) ?? AdPlacement.HOME;
    return this.ads.serve(Object.values(AdPlacement).includes(p) ? p : AdPlacement.HOME);
  }

  @Post("ads/:id/click")
  click(@Param("id") id: string) {
    return this.ads.click(id);
  }

  /** Admin — todas as campanhas patrocinadas. */
  @Get("admin/ads")
  @UseGuards(JwtAuthGuard, PlatformAdminGuard)
  list() {
    return this.ads.list();
  }
}

@Module({
  imports: [AuthModule],
  controllers: [AdsController],
  providers: [AdsService, PlatformAdminGuard],
})
export class AdsModule {}
