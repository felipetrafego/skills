import { Controller, Get, Module, Param, Post, UseGuards } from "@nestjs/common";
import { AiService } from "./ai.service";
import { AiTextProvider } from "./text-provider";
import { JwtAuthGuard } from "../../common/auth/jwt-auth.guard";
import { CurrentUser } from "../../common/auth/current-user.decorator";
import { AuthModule } from "../auth/auth.module";
import type { JwtPayload } from "../../common/auth/jwt-payload";

@Controller("vehicles/:id/ai")
@UseGuards(JwtAuthGuard)
class AiController {
  constructor(private readonly ai: AiService) {}

  @Get("price")
  price(@CurrentUser() user: JwtPayload, @Param("id") id: string) {
    return this.ai.priceSuggestion(user, id);
  }

  @Get("score")
  score(@CurrentUser() user: JwtPayload, @Param("id") id: string) {
    return this.ai.score(user, id);
  }

  @Post("description")
  description(@CurrentUser() user: JwtPayload, @Param("id") id: string) {
    return this.ai.description(user, id);
  }
}

@Module({
  imports: [AuthModule],
  controllers: [AiController],
  providers: [AiService, AiTextProvider],
})
export class AiModule {}
