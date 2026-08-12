import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { EngagementService } from "./engagement.service";
import { RecordEventDto } from "./dto/record-event.dto";
import { JwtAuthGuard } from "../../common/auth/jwt-auth.guard";
import { CurrentUser } from "../../common/auth/current-user.decorator";
import type { JwtPayload } from "../../common/auth/jwt-payload";

@Controller()
export class EngagementController {
  constructor(private readonly engagement: EngagementService) {}

  /** Público — registra evento de anúncio (view/click/contact/share). */
  @Post("vehicles/:id/events")
  recordEvent(@Param("id") id: string, @Body() dto: RecordEventDto) {
    return this.engagement.recordEvent(id, dto);
  }

  @Post("vehicles/:id/favorite")
  @UseGuards(JwtAuthGuard)
  toggleFavorite(@CurrentUser() user: JwtPayload, @Param("id") id: string) {
    return this.engagement.toggleFavorite(user.sub, id);
  }

  @Get("vehicles/:id/stats")
  @UseGuards(JwtAuthGuard)
  stats(@CurrentUser() user: JwtPayload, @Param("id") id: string) {
    return this.engagement.stats(user, id);
  }

  @Get("me/favorites")
  @UseGuards(JwtAuthGuard)
  listFavorites(@CurrentUser() user: JwtPayload) {
    return this.engagement.listFavorites(user.sub);
  }
}
