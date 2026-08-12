/** Helpers de query string compartilhados pelos controles do marketplace. */
export type SP = Record<string, string>;

export function normalizeSearchParams(
  input: Record<string, string | string[] | undefined>,
): SP {
  const out: SP = {};
  for (const [k, v] of Object.entries(input)) {
    if (v == null) continue;
    out[k] = Array.isArray(v) ? (v[0] ?? "") : v;
  }
  return out;
}

/** Clona os params atuais, aplica mudanças (valor vazio remove) e zera a página. */
export function buildQuery(current: SP, changes: Record<string, string>): string {
  const p = new URLSearchParams(current);
  for (const [k, v] of Object.entries(changes)) {
    if (v) p.set(k, v);
    else p.delete(k);
  }
  p.delete("page");
  const s = p.toString();
  return s ? `/?${s}` : "/";
}
