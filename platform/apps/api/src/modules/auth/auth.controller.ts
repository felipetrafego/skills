import { Body, Controller, Get, HttpCode, Param, Post, Query, Req, Res, UseGuards } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { randomBytes } from "node:crypto";
import type { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { AuthTokensService } from "./auth-tokens.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { TwoFaCodeDto, TwoFaLoginDto } from "./dto/twofa.dto";
import { OAuthDevDto } from "./dto/oauth-dev.dto";
import { ForgotPasswordDto, ResetPasswordDto, VerifyEmailDto } from "./dto/password.dto";
import { RefreshDto } from "./dto/refresh.dto";
import { JwtAuthGuard } from "../../common/auth/jwt-auth.guard";
import { CurrentUser } from "../../common/auth/current-user.decorator";
import type { JwtPayload } from "../../common/auth/jwt-payload";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly tokens: AuthTokensService,
    private readonly config: ConfigService,
  ) {}

  @Post("register")
  async register(@Body() dto: RegisterDto) {
    const result = await this.auth.register(dto);
    // Dispara a verificação de e-mail (best-effort — não bloqueia o cadastro).
    void this.tokens.requestEmailVerification(result.user.id).catch(() => undefined);
    return result;
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

  @Post("refresh")
  @HttpCode(200)
  refresh(@Body() dto: RefreshDto) {
    return this.auth.refresh(dto.refreshToken);
  }

  @Post("logout")
  @HttpCode(200)
  logout(@Body() dto: RefreshDto) {
    return this.auth.logout(dto.refreshToken);
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

  // ---- Redefinição de senha ----
  @Post("forgot-password")
  @HttpCode(200)
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.tokens.requestPasswordReset(dto.email);
  }

  @Post("reset-password")
  @HttpCode(200)
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.tokens.resetPassword(dto.token, dto.password);
  }

  // ---- Verificação de e-mail ----
  @Post("verify-email/request")
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  requestEmailVerification(@CurrentUser() user: JwtPayload) {
    return this.tokens.requestEmailVerification(user.sub);
  }

  @Get("verify-email/status")
  @UseGuards(JwtAuthGuard)
  emailStatus(@CurrentUser() user: JwtPayload) {
    return this.tokens.emailStatus(user.sub);
  }

  @Post("verify-email")
  @HttpCode(200)
  verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.tokens.verifyEmail(dto.token);
  }

  // ---- Login social (OAuth) ----
  @Get("oauth/providers")
  oauthProviders() {
    return this.auth.providersStatus();
  }

  private redirectUri(req: Request, provider: string): string {
    const base = this.config.get<string>("API_PUBLIC_URL") ?? `${req.protocol}://${req.get("host")}`;
    return `${base}/api/auth/oauth/${provider}/callback`;
  }

  @Get("oauth/:provider")
  oauthStart(@Param("provider") provider: string, @Req() req: Request, @Res() res: Response) {
    const state = randomBytes(12).toString("hex");
    const url = this.auth.authorizeUrl(provider, this.redirectUri(req, provider), state);
    res.redirect(url);
  }

  @Get("oauth/:provider/callback")
  async oauthCallback(
    @Param("provider") provider: string,
    @Query("code") code: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const web = this.config.get<string>("CORS_ORIGIN", "http://localhost:3000");
    try {
      const { accessToken } = await this.auth.handleCallback(provider, code, this.redirectUri(req, provider));
      res.redirect(`${web}/entrar?token=${encodeURIComponent(accessToken)}`);
    } catch {
      res.redirect(`${web}/entrar?oauth_error=1`);
    }
  }

  /** Seam de teste (OAUTH_DEV_LOGIN=true): valida a lógica de conta sem provedor real. */
  @Post("oauth/dev")
  @HttpCode(200)
  oauthDev(@Body() dto: OAuthDevDto) {
    return this.auth.devOauthLogin(dto.provider, {
      providerAccountId: dto.providerAccountId,
      email: dto.email,
      name: dto.name,
    });
  }
}
