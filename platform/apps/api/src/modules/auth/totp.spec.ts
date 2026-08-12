import { generateSecret, currentCode, verifyCode, otpauthUri } from "./totp";

describe("totp", () => {
  it("gera um secret Base32 não trivial", () => {
    const s = generateSecret();
    expect(s).toMatch(/^[A-Z2-7]+$/);
    expect(s.length).toBeGreaterThanOrEqual(32);
    expect(generateSecret()).not.toEqual(s); // aleatório
  });

  it("verifica o código atual que ele mesmo gera", () => {
    const secret = generateSecret();
    const at = Date.parse("2026-01-01T00:00:00Z");
    const code = currentCode(secret, at);
    expect(code).toMatch(/^\d{6}$/);
    expect(verifyCode(secret, code, at)).toBe(true);
  });

  it("aceita drift de ±1 janela (30s) e rejeita além disso", () => {
    const secret = generateSecret();
    const at = Date.parse("2026-01-01T00:00:00Z");
    const code = currentCode(secret, at);
    expect(verifyCode(secret, code, at + 30_000)).toBe(true); // +1 janela
    expect(verifyCode(secret, code, at - 30_000)).toBe(true); // -1 janela
    expect(verifyCode(secret, code, at + 90_000)).toBe(false); // +3 janelas
  });

  it("rejeita código inválido e ignora espaços", () => {
    const secret = generateSecret();
    const at = Date.parse("2026-01-01T00:00:00Z");
    const code = currentCode(secret, at);
    expect(verifyCode(secret, "000000", at)).toBe(false);
    // tolera espaços na digitação
    const spaced = `${code.slice(0, 3)} ${code.slice(3)}`;
    expect(verifyCode(secret, spaced, at)).toBe(true);
  });

  it("monta a otpauth URI compatível com apps autenticadores", () => {
    const uri = otpauthUri("ABCDEFGHIJKLMNOP", "ricardo@autoprime.com.br");
    expect(uri).toContain("otpauth://totp/");
    expect(uri).toContain("secret=ABCDEFGHIJKLMNOP");
    expect(uri).toContain("issuer=Motora");
    expect(uri).toContain(encodeURIComponent("Motora:ricardo@autoprime.com.br"));
  });
});
