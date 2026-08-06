import { Body, Controller, Delete, Get, Param, Post, UseGuards } from "@nestjs/common";
import { MediaService } from "./media.service";
import { PresignDto } from "./dto/presign.dto";
import { ConfirmMediaDto } from "./dto/confirm-media.dto";
import { JwtAuthGuard } from "../../common/auth/jwt-auth.guard";
import { CurrentUser } from "../../common/auth/current-user.decorator";
import type { JwtPayload } from "../../common/auth/jwt-payload";

@Controller("vehicles/:id/media")
export class MediaController {
  constructor(private readonly media: MediaService) {}

  /** Público — lista a mídia de um anúncio. */
  @Get()
  list(@Param("id") vehicleId: string) {
    return this.media.list(vehicleId);
  }

  @Post("presign")
  @UseGuards(JwtAuthGuard)
  presign(
    @CurrentUser() user: JwtPayload,
    @Param("id") vehicleId: string,
    @Body() dto: PresignDto,
  ) {
    return this.media.presign(user, vehicleId, dto);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  confirm(
    @CurrentUser() user: JwtPayload,
    @Param("id") vehicleId: string,
    @Body() dto: ConfirmMediaDto,
  ) {
    return this.media.confirm(user, vehicleId, dto);
  }

  @Delete(":mediaId")
  @UseGuards(JwtAuthGuard)
  remove(@CurrentUser() user: JwtPayload, @Param("mediaId") mediaId: string) {
    return this.media.remove(user, mediaId);
  }
}
