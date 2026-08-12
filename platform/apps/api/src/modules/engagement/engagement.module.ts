import { Module } from "@nestjs/common";
import { EngagementService } from "./engagement.service";
import { EngagementController } from "./engagement.controller";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [AuthModule],
  controllers: [EngagementController],
  providers: [EngagementService],
})
export class EngagementModule {}
