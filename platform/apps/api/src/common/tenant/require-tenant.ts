import { ForbiddenException } from "@nestjs/common";
import type { JwtPayload } from "../auth/jwt-payload";

/** Garante que o usuário autenticado pertence a um tenant (lojista) e devolve o id. */
export function requireTenant(user: JwtPayload | undefined): string {
  if (!user?.tenantId) {
    throw new ForbiddenException("Ação disponível apenas para usuários de uma loja");
  }
  return user.tenantId;
}
