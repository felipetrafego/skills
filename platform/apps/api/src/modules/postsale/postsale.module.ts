import { Body, Controller, Get, Param, Post, Query, Module, UseGuards } from "@nestjs/common";
import { PostsaleService } from "./postsale.service";
import { CreateOfferDto } from "./dto/create-offer.dto";
import { JwtAuthGuard } from "../../common/auth/jwt-auth.guard";
import { CurrentUser } from "../../common/auth/current-user.decorator";
import { AuthModule } from "../auth/auth.module";
import type { JwtPayload } from "../../common/auth/jwt-payload";

@Controller("postsale")
class PostsaleController {
  constructor(private readonly postsale: PostsaleService) {}

  /** Catálogo de parceiros da jornada de pós-venda. */
  @Get("partners")
  partners() {
    return this.postsale.partners();
  }

  @Post("vehicles/:id/sold")
  @UseGuards(JwtAuthGuard)
  markSold(@CurrentUser() user: JwtPayload, @Param("id") id: string) {
    return this.postsale.markSold(user, id);
  }

  @Post("offers")
  @UseGuards(JwtAuthGuard)
  createOffer(@CurrentUser() user: JwtPayload, @Body() dto: CreateOfferDto) {
    return this.postsale.createOffer(user, dto);
  }

  @Get("offers")
  @UseGuards(JwtAuthGuard)
  listOffers(@CurrentUser() user: JwtPayload, @Query("vehicleId") vehicleId: string) {
    return this.postsale.listOffers(user, vehicleId);
  }
}

@Module({
  imports: [AuthModule],
  controllers: [PostsaleController],
  providers: [PostsaleService],
})
export class PostsaleModule {}
