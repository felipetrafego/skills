import { Injectable, NestMiddleware } from "@nestjs/common";
import type { Request, Response, NextFunction } from "express";
import { TenantContext } from "./tenant-context";

/**
 * Resolve o tenant do request e o disponibiliza via AsyncLocalStorage.
 * Ordem: header `x-tenant` → subdomínio (loja.motora.com.br) → nenhum (público).
 * A resolução do id (a partir do slug) fica a cargo do serviço, que também
 * aplica `SET app.tenant_id` na sessão do Postgres (RLS) — defesa em profundidade.
 */
@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    const headerTenant = req.header("x-tenant")?.trim();
    const host = req.hostname || "";
    const parts = host.split(".");
    const sub = parts.length > 2 ? parts[0] : undefined;
    const reserved = new Set(["www", "app", "api", "admin"]);

    const tenantSlug =
      headerTenant || (sub && !reserved.has(sub) ? sub : undefined) || undefined;

    TenantContext.run({ tenantSlug }, () => next());
  }
}
