import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthService } from "./auth.service";
import { AuthTokensService } from "./auth-tokens.service";
import { MailService } from "./mail.service";
import { AuthController } from "./auth.controller";
import { JwtAuthGuard } from "../../common/auth/jwt-auth.guard";

@Module({
  imports: [JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, AuthTokensService, MailService, JwtAuthGuard],
  exports: [JwtAuthGuard, JwtModule],
})
export class AuthModule {}
