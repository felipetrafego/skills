import { createHmac, randomBytes } from "node:crypto";

/**
 * TOTP (RFC 6238) com SHA-1, 6 dígitos, janela de 30s — sem dependência externa.
 * Secret em Base32 (RFC 4648), compatível com Google Authenticator / Authy.
 */
const B32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function base32Encode(buf: Buffer): string {
  let bits = 0;
  let value = 0;
  let out = "";
  for (const byte of buf) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += B32[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += B32[(value << (5 - bits)) & 31];
  return out;
}

function base32Decode(str: string): Buffer {
  const clean = str.replace(/=+$/, "").toUpperCase().replace(/\s/g, "");
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (const ch of clean) {
    const idx = B32.indexOf(ch);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}

export function generateSecret(): string {
  return base32Encode(randomBytes(20));
}

function code(secret: string, counter: number): string {
  const key = base32Decode(secret);
  const buf = Buffer.alloc(8);
  buf.writeBigInt64BE(BigInt(counter));
  const hmac = createHmac("sha1", key).update(buf).digest();
  const offset = hmac[hmac.length - 1]! & 0xf;
  const bin =
    ((hmac[offset]! & 0x7f) << 24) |
    ((hmac[offset + 1]! & 0xff) << 16) |
    ((hmac[offset + 2]! & 0xff) << 8) |
    (hmac[offset + 3]! & 0xff);
  return (bin % 1_000_000).toString().padStart(6, "0");
}

/** Código atual (para testes/geração). */
export function currentCode(secret: string, at: number = Date.now()): string {
  return code(secret, Math.floor(at / 1000 / 30));
}

/** Verifica um código com tolerância de ±1 janela (clock drift). */
export function verifyCode(secret: string, token: string, at: number = Date.now()): boolean {
  const counter = Math.floor(at / 1000 / 30);
  const clean = token.replace(/\s/g, "");
  for (let w = -1; w <= 1; w++) {
    if (code(secret, counter + w) === clean) return true;
  }
  return false;
}

/** URI otpauth:// para QR code em apps autenticadores. */
export function otpauthUri(secret: string, account: string, issuer = "Motora"): string {
  const label = encodeURIComponent(`${issuer}:${account}`);
  const params = new URLSearchParams({ secret, issuer, algorithm: "SHA1", digits: "6", period: "30" });
  return `otpauth://totp/${label}?${params.toString()}`;
}
