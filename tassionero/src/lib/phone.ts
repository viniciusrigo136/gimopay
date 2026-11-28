/** Máscara visual (49) 99999-9999. A normalização oficial (E.164) acontece no banco. */
export function maskPhone(input: string): string {
  const d = input.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function isPlausibleBrPhone(input: string): boolean {
  const d = input.replace(/\D/g, "");
  return d.length === 10 || d.length === 11;
}

/** +5549991234567 -> (49) 99123-4567 */
export function fmtPhone(e164: string | null | undefined): string {
  if (!e164) return "";
  const d = e164.replace(/\D/g, "").replace(/^55/, "");
  return maskPhone(d);
}

/** Dígitos para wa.me (DDI+DDD+número). */
export function waDigits(e164: string): string {
  return e164.replace(/\D/g, "");
}
