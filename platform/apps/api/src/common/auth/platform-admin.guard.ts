import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import type { Request } from "express";
import type { JwtPayload } from "./jwt-payload";

/** Libera apenas usuários do tipo PLATFORM_ADMIN (super-admin da Motora). */
@Injectable()
export class PlatformAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request & { user?: JwtPayload }>();
    if (req.user?.type !== "PLATFORM_ADMIN") {
      throw new ForbiddenException("Acesso restrito à administração da plataforma");
    }
    return true;
  }
}
