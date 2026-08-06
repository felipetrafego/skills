import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import type { Request } from "express";
import type { JwtPayload } from "./jwt-payload";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request & { user?: JwtPayload }>();
    const auth = req.header("authorization");
    if (!auth?.startsWith("Bearer ")) {
      throw new UnauthorizedException("Token ausente");
    }
    try {
      const payload = await this.jwt.verifyAsync<JwtPayload>(auth.slice(7), {
        secret: this.config.getOrThrow<string>("JWT_ACCESS_SECRET"),
      });
      req.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException("Token inválido ou expirado");
    }
  }
}
