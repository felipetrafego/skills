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
