import { ForbiddenException } from "@nestjs/common";
import { requireTenant } from "./require-tenant";
import type { JwtPayload } from "../auth/jwt-payload";

describe("requireTenant", () => {
  const base: JwtPayload = { sub: "u1", email: "a@b.com", type: "SHOPKEEPER" };

  it("devolve o tenantId quando presente", () => {
    expect(requireTenant({ ...base, tenantId: "t1" })).toBe("t1");
  });

  it("lança 403 quando não há tenant (pessoa física)", () => {
    expect(() => requireTenant({ ...base, type: "INDIVIDUAL" })).toThrow(ForbiddenException);
  });

  it("lança 403 quando o usuário é indefinido", () => {
    expect(() => requireTenant(undefined)).toThrow(ForbiddenException);
  });
});
