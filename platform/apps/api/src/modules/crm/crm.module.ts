import { Module } from "@nestjs/common";
import { CrmService } from "./crm.service";
import { CrmController } from "./crm.controller";
import { AuthModule } from "../auth/auth.module";
import { AutomationsModule } from "../automations/automations.module";

@Module({
  imports: [AuthModule, AutomationsModule],
  controllers: [CrmController],
  providers: [CrmService],
})
export class CrmModule {}
