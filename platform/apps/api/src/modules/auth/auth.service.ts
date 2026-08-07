import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcryptjs";
import { PrismaService } from "../../prisma/prisma.service";
import type { JwtPayload } from "../../common/auth/jwt-payload";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { generateSecret, otpauthUri, verifyCode } from "./totp";
import type { OAuthProvider } from "@prisma/client";

interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  authUrl: string;
  tokenUrl: string;
  userinfoUrl: string;
  scope: string;
}
interface OAuthProfile {
  providerAccountId: string;
  email: string;
  name: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException("E-mail já cadastrado");

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        passwordHash: await bcrypt.hash(dto.password, 10),
        type: "INDIVIDUAL",
      },
    });

    return this.issueTokens({ sub: user.id, email: user.email, type: "INDIVIDUAL" });
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { memberships: { where: { status: "ACTIVE" }, take: 1 } },
    });
    if (!user?.passwordHash || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException("Credenciais inválidas");
    }

    // 2FA ativo: não emite tokens ainda; devolve um desafio de curta duração.
    if (user.twoFactorEnabled) {
      const challenge = await this.jwt.signAsync(
        { sub: user.id, scope: "2fa" },
        { secret: this.config.getOrThrow<string>("JWT_ACCESS_SECRET"), expiresIn: "5m" },
      );
      return { require2fa: true, challenge };
    }

    return this.issueTokens(this.payloadFor(user, user.memberships[0]));
  }

  /** Segundo passo do login quando 2FA está ativo. */
  async twofaLogin(challenge: string, code: string) {
    let sub: string;
    try {
      const payload = await this.jwt.verifyAsync<{ sub: string; scope?: string }>(challenge, {
        secret: this.config.getOrThrow<string>("JWT_ACCESS_SECRET"),
      });
      if (payload.scope !== "2fa") throw new Error("scope");
      sub = payload.sub;
    } catch {
      throw new UnauthorizedException("Desafio inválido ou expirado");
    }

    const user = await this.prisma.user.findUnique({
      where: { id: sub },
      include: { memberships: { where: { status: "ACTIVE" }, take: 1 } },
    });
    if (!user?.twoFactorSecret || !verifyCode(user.twoFactorSecret, code)) {
      throw new UnauthorizedException("Código de verificação inválido");
    }
    return this.issueTokens(this.payloadFor(user, user.memberships[0]));
  }

  // ---- Gestão de 2FA ----
  async twofaStatus(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { twoFactorEnabled: true } });
    return { enabled: user?.twoFactorEnabled ?? false };
  }

  async setup2fa(userId: string, email: string) {
    const secret = generateSecret();
    await this.prisma.user.update({ where: { id: userId }, data: { twoFactorSecret: secret } });
    return { secret, otpauth: otpauthUri(secret, email) };
  }

  async enable2fa(userId: string, code: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.twoFactorSecret) throw new BadRequestException("Gere o segredo antes (setup)");
    if (!verifyCode(user.twoFactorSecret, code)) throw new BadRequestException("Código inválido");
    await this.prisma.user.update({ where: { id: userId }, data: { twoFactorEnabled: true } });
    return { enabled: true };
  }

  async disable2fa(userId: string, code: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.twoFactorSecret || !verifyCode(user.twoFactorSecret, code)) {
      throw new BadRequestException("Código inválido");
    }
    await this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: false, twoFactorSecret: null },
    });
    return { enabled: false };
  }

  // ---- Login social (OAuth2) ----
  private oauthConfig(provider: string): OAuthConfig | null {
    const p = provider.toUpperCase();
    const clientId = this.config.get<string>(`${p}_CLIENT_ID`);
    const clientSecret = this.config.get<string>(`${p}_CLIENT_SECRET`);
    if (!clientId || !clientSecret) return null;
    const endpoints: Record<string, Omit<OAuthConfig, "clientId" | "clientSecret">> = {
      GOOGLE: {
        authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
        tokenUrl: "https://oauth2.googleapis.com/token",
        userinfoUrl: "https://www.googleapis.com/oauth2/v2/userinfo",
        scope: "openid email profile",
      },
      MICROSOFT: {
        authUrl: "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
        tokenUrl: "https://login.microsoftonline.com/common/oauth2/v2.0/token",
        userinfoUrl: "https://graph.microsoft.com/oidc/userinfo",
        scope: "openid email profile",
      },
      APPLE: {
        authUrl: "https://appleid.apple.com/auth/authorize",
        tokenUrl: "https://appleid.apple.com/auth/token",
        userinfoUrl: "",
        scope: "name email",
      },
    };
    const e = endpoints[p];
    return e ? { clientId, clientSecret, ...e } : null;
  }

  providersStatus() {
    return ["google", "microsoft", "apple"].map((p) => ({ provider: p, configured: !!this.oauthConfig(p) }));
  }

  authorizeUrl(provider: string, redirectUri: string, state: string): string {
    const cfg = this.oauthConfig(provider);
    if (!cfg) throw new BadRequestException(`Provedor ${provider} não configurado`);
    const params = new URLSearchParams({
      client_id: cfg.clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: cfg.scope,
      state,
      access_type: "offline",
      prompt: "select_account",
    });
    return `${cfg.authUrl}?${params.toString()}`;
  }

  async handleCallback(provider: string, codeParam: string, redirectUri: string) {
    const cfg = this.oauthConfig(provider);
    if (!cfg) throw new BadRequestException(`Provedor ${provider} não configurado`);

    const tokenRes = await fetch(cfg.tokenUrl, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code: codeParam,
        client_id: cfg.clientId,
        client_secret: cfg.clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });
    if (!tokenRes.ok) throw new UnauthorizedException("Falha na troca de código OAuth");
    const { access_token } = (await tokenRes.json()) as { access_token: string };

    const uiRes = await fetch(cfg.userinfoUrl, { headers: { authorization: `Bearer ${access_token}` } });
    if (!uiRes.ok) throw new UnauthorizedException("Falha ao obter perfil OAuth");
    const raw = (await uiRes.json()) as { id?: string; sub?: string; email?: string; name?: string };

    return this.oauthLogin(provider.toUpperCase() as OAuthProvider, {
      providerAccountId: raw.id ?? raw.sub ?? "",
      email: raw.email ?? "",
      name: raw.name ?? raw.email ?? "Usuário",
    });
  }

  /** Seam de teste: cria/vincula conta a partir de um perfil OAuth sem provedor real.
   *  Habilitado apenas com OAUTH_DEV_LOGIN=true. */
  async devOauthLogin(provider: string, profile: OAuthProfile) {
    if (this.config.get<string>("OAUTH_DEV_LOGIN") !== "true") {
      throw new BadRequestException("Login OAuth de desenvolvimento desabilitado");
    }
    return this.oauthLogin(provider.toUpperCase() as OAuthProvider, profile);
  }

  /** Núcleo: encontra a conta OAuth, ou vincula por e-mail, ou cria o usuário. */
  private async oauthLogin(provider: OAuthProvider, profile: OAuthProfile) {
    const membershipInclude = { memberships: { where: { status: "ACTIVE" as const }, take: 1 } };

    const existing = await this.prisma.oAuthAccount.findUnique({
      where: { provider_providerAccountId: { provider, providerAccountId: profile.providerAccountId } },
      include: { user: { include: membershipInclude } },
    });
    if (existing) {
      const u = existing.user;
      return this.issueTokens(this.payloadFor(u, u.memberships[0]));
    }

    let user = profile.email
      ? await this.prisma.user.findUnique({ where: { email: profile.email }, include: membershipInclude })
      : null;
    if (!user) {
      user = await this.prisma.user.create({
        data: { name: profile.name, email: profile.email, type: "INDIVIDUAL", emailVerifiedAt: new Date() },
        include: membershipInclude,
      });
    }
    await this.prisma.oAuthAccount.create({
      data: { userId: user.id, provider, providerAccountId: profile.providerAccountId },
    });
    return this.issueTokens(this.payloadFor(user, user.memberships[0]));
  }

  private payloadFor(
    user: { id: string; email: string; type: JwtPayload["type"] },
    membership?: { tenantId: string; role: JwtPayload["role"] },
  ): JwtPayload {
    return {
      sub: user.id,
      email: user.email,
      type: user.type,
      tenantId: membership?.tenantId,
      role: membership?.role,
    };
  }

  private async issueTokens(payload: JwtPayload) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: this.config.getOrThrow<string>("JWT_ACCESS_SECRET"),
        expiresIn: this.config.get<string>("JWT_ACCESS_TTL", "15m"),
      }),
      this.jwt.signAsync(
        { sub: payload.sub },
        {
          secret: this.config.getOrThrow<string>("JWT_REFRESH_SECRET"),
          expiresIn: this.config.get<string>("JWT_REFRESH_TTL", "30d"),
        },
      ),
    ]);
    return { accessToken, refreshToken, user: { id: payload.sub, email: payload.email } };
  }
}
