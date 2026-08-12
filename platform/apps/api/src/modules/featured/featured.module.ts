import { Body, Controller, Get, Module, Param, Post, UseGuards } from "@nestjs/common";
import { FeaturedService } from "./featured.service";
import { FeatureDto } from "./dto/feature.dto";
import { JwtAuthGuard } from "../../common/auth/jwt-auth.guard";
import { CurrentUser } from "../../common/auth/current-user.decorator";
import { AuthModule } from "../auth/auth.module";
import type { JwtPayload } from "../../common/auth/jwt-payload";

@Controller()
class FeaturedController {
  constructor(private readonly featured: FeaturedService) {}

  /** Público — planos de destaque disponíveis. */
  @Get("featured/tiers")
  tiers() {
    return this.featured.tiers();
  }

  /** Autenticado — contrata destaque para um anúncio (dono). */
  @Post("vehicles/:id/feature")
  @UseGuards(JwtAuthGuard)
  feature(@CurrentUser() user: JwtPayload, @Param("id") id: string, @Body() dto: FeatureDto) {
    return this.featured.feature(user, id, dto.tier);
  }
}

@Module({
  imports: [AuthModule],
  controllers: [FeaturedController],
  providers: [FeaturedService],
})
export class FeaturedModule {}
