import { Body, Controller, Get, Module, Param, Post, UseGuards } from "@nestjs/common";
import { BillingService } from "./billing.service";
import { SubscribeDto } from "./dto/subscribe.dto";
import { JwtAuthGuard } from "../../common/auth/jwt-auth.guard";
import { CurrentUser } from "../../common/auth/current-user.decorator";
import { requireTenant } from "../../common/tenant/require-tenant";
import { AuthModule } from "../auth/auth.module";
import type { JwtPayload } from "../../common/auth/jwt-payload";

@Controller("billing")
@UseGuards(JwtAuthGuard)
class BillingController {
  constructor(private readonly billing: BillingService) {}

  @Get("subscription")
  subscription(@CurrentUser() user: JwtPayload) {
    return this.billing.getSubscription(requireTenant(user));
  }

  @Get("summary")
  summary(@CurrentUser() user: JwtPayload) {
    return this.billing.summary(requireTenant(user));
  }

  @Post("subscribe")
  subscribe(@CurrentUser() user: JwtPayload, @Body() dto: SubscribeDto) {
    return this.billing.subscribe(requireTenant(user), dto);
  }

  @Get("invoices")
  invoices(@CurrentUser() user: JwtPayload) {
    return this.billing.listInvoices(requireTenant(user));
  }

  @Post("invoices/:id/pay")
  pay(@CurrentUser() user: JwtPayload, @Param("id") id: string) {
    return this.billing.payInvoice(requireTenant(user), id);
  }
}

@Module({
  imports: [AuthModule],
  controllers: [BillingController],
  providers: [BillingService],
})
export class BillingModule {}
