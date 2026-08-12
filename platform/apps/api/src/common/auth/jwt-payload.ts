import type { MembershipRole } from "@prisma/client";

export interface JwtPayload {
  sub: string;
  email: string;
  type: "SHOPKEEPER" | "INDIVIDUAL" | "PLATFORM_ADMIN";
  /** tenant ativo (para lojistas) */
  tenantId?: string;
  role?: MembershipRole;
}
