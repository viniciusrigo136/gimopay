const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const brlCompact = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

export function fmtMoney(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "") return "—";
  return brl.format(Number(value));
}

/** Sem centavos quando inteiro (vitrines e cartões). */
export function fmtMoneyShort(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "") return "—";
  const n = Number(value);
  return Number.isInteger(n) ? brlCompact.format(n) : brl.format(n);
}

/** "1.234,56" ou "1234.56" -> 1234.56. Retorna null se vazio/inválido. */
export function parseMoney(input: string): number | null {
  const s = input.trim().replace(/[R$\s]/g, "");
  if (!s) return null;
  const normalized = s.includes(",") ? s.replace(/\./g, "").replace(",", ".") : s;
  const n = Number(normalized);
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : null;
}
