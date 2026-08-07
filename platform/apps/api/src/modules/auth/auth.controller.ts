import { Body, Controller, Get, HttpCode, Post, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { TwoFaCodeDto, TwoFaLoginDto } from "./dto/twofa.dto";
import { JwtAuthGuard } from "../../common/auth/jwt-auth.guard";
import { CurrentUser } from "../../common/auth/current-user.decorator";
import type { JwtPayload } from "../../common/auth/jwt-payload";

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post("register")
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Post("login")
  @HttpCode(200)
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: JwtPayload) {
    return user;
  }

  @Post("2fa/login")
  @HttpCode(200)
  twofaLogin(@Body() dto: TwoFaLoginDto) {
    return this.auth.twofaLogin(dto.challenge, dto.code);
  }

  @Get("2fa/status")
  @UseGuards(JwtAuthGuard)
  twofaStatus(@CurrentUser() user: JwtPayload) {
    return this.auth.twofaStatus(user.sub);
  }

  @Post("2fa/setup")
  @UseGuards(JwtAuthGuard)
  setup2fa(@CurrentUser() user: JwtPayload) {
    return this.auth.setup2fa(user.sub, user.email);
  }

  @Post("2fa/enable")
  @UseGuards(JwtAuthGuard)
  enable2fa(@CurrentUser() user: JwtPayload, @Body() dto: TwoFaCodeDto) {
    return this.auth.enable2fa(user.sub, dto.code);
  }

  @Post("2fa/disable")
  @UseGuards(JwtAuthGuard)
  disable2fa(@CurrentUser() user: JwtPayload, @Body() dto: TwoFaCodeDto) {
    return this.auth.disable2fa(user.sub, dto.code);
  }
}
