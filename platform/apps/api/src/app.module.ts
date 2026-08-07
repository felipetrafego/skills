import { Module, MiddlewareConsumer, NestModule } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./prisma/prisma.module";
import { TenantMiddleware } from "./common/tenant/tenant.middleware";
import { AuthModule } from "./modules/auth/auth.module";
import { TenantsModule } from "./modules/tenants/tenants.module";
import { VehiclesModule } from "./modules/vehicles/vehicles.module";
import { CatalogModule } from "./modules/catalog/catalog.module";
import { CrmModule } from "./modules/crm/crm.module";
import { EngagementModule } from "./modules/engagement/engagement.module";
import { MediaModule } from "./modules/media/media.module";
import { PostsaleModule } from "./modules/postsale/postsale.module";
import { BillingModule } from "./modules/billing/billing.module";
import { AdminModule } from "./modules/admin/admin.module";
import { FeaturedModule } from "./modules/featured/featured.module";
import { AiModule } from "./modules/ai/ai.module";
import { DashboardModule } from "./modules/dashboard/dashboard.module";
import { HealthModule } from "./modules/health/health.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    TenantsModule,
    VehiclesModule,
    CatalogModule,
    CrmModule,
    EngagementModule,
    MediaModule,
    PostsaleModule,
    BillingModule,
    AdminModule,
    FeaturedModule,
    AiModule,
    DashboardModule,
    HealthModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Resolve o tenant (subdomínio / header / domínio custom) para todas as rotas.
    consumer.apply(TenantMiddleware).forRoutes("*");
  }
}
