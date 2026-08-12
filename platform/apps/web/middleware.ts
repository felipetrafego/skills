import { NextResponse, type NextRequest } from "next/server";

const RESERVED = new Set(["www", "app", "api", "admin", "loja", ""]);

/**
 * Roteamento multi-tenant por subdomínio: `autoprime.motora.com.br` (ou
 * `autoprime.localhost:3000` em dev) reescreve a home para a vitrine `/loja/autoprime`.
 * O restante das rotas passa direto. A resolução do tenant na API continua por
 * header `x-tenant` (enviado por fetchStore).
 */
export function middleware(req: NextRequest) {
  const hostname = (req.headers.get("host") ?? "").split(":")[0]!;
  const parts = hostname.split(".");

  let sub: string | null = null;
  if (hostname.endsWith(".localhost")) {
    sub = parts.length > 1 ? parts[0]! : null; // sub.localhost
  } else if (parts.length > 2) {
    sub = parts[0]!; // sub.dominio.tld
  }

  if (sub && !RESERVED.has(sub) && req.nextUrl.pathname === "/") {
    const url = req.nextUrl.clone();
    url.pathname = `/loja/${sub}`;
    return NextResponse.rewrite(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/"],
};
