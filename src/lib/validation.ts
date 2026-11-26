/** Validações e máscaras compartilhadas entre cliente e servidor. */

import { segments, solutions, ui } from "@/content/copy";
import { formatBRL } from "./format";

export const onlyDigits = (v: string) => v.replace(/\D/g, "");

/** CPF/CNPJ: mantém dígitos e letras (CNPJ alfanumérico), em maiúsculas. */
const normalizeDocument = (v: string) => v.toUpperCase().replace(/[^0-9A-Z]/g, "");

export function maskDocument(value: string) {
  const d = normalizeDocument(value).slice(0, 14);
  if (d.length <= 11 && /^\d*$/.test(d)) {
    return d
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }
  return d
    .replace(/^(\w{2})(\w)/, "$1.$2")
    .replace(/^(\w{2}\.\w{3})(\w)/, "$1.$2")
    .replace(/^(\w{2}\.\w{3}\.\w{3})(\w)/, "$1/$2")
    .replace(/^(\w{2}\.\w{3}\.\w{3}\/\w{4})(\w{1,2})$/, "$1-$2");
}

export function maskPhone(value: string) {
  const d = onlyDigits(value).slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function maskCurrency(value: string) {
  const d = onlyDigits(value).slice(0, 13);
  return d ? formatBRL(Number(d) / 100) : "";
}

function isValidCpf(cpf: string) {
  if (!/^\d{11}$/.test(cpf) || /^(\d)\1+$/.test(cpf)) return false;
  const checkDigit = (len: number) => {
    let sum = 0;
    for (let i = 0; i < len; i++) sum += Number(cpf[i]) * (len + 1 - i);
    const r = (sum * 10) % 11;
    return r === 10 ? 0 : r;
  };
  return checkDigit(9) === Number(cpf[9]) && checkDigit(10) === Number(cpf[10]);
}

/**
 * CNPJ numérico ou alfanumérico (12 posições alfanuméricas + 2 dígitos
 * verificadores). Cada caractere vale seu código ASCII menos 48.
 */
function isValidCnpj(cnpj: string) {
  if (!/^[0-9A-Z]{12}\d{2}$/.test(cnpj) || /^(\w)\1+$/.test(cnpj)) return false;
  const value = (c: string) => c.charCodeAt(0) - 48;
  const checkDigit = (len: number) => {
    const weights = len === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const sum = weights.reduce((acc, w, i) => acc + value(cnpj[i]) * w, 0);
    const r = sum % 11;
    return r < 2 ? 0 : 11 - r;
  };
  return checkDigit(12) === Number(cnpj[12]) && checkDigit(13) === Number(cnpj[13]);
}

export const isValidDocument = (value: string) => {
  const d = normalizeDocument(value);
  return d.length === 11 ? isValidCpf(d) : d.length === 14 ? isValidCnpj(d) : false;
};

/* ---------- Opções dos campos de escolha (valor = id estável) ---------- */

export const OTHER_SEGMENT = "outro";
export const UNDECIDED_SOLUTION = "nao-sei";

export const segmentOptions = [
  ...segments.map((s) => ({ value: s.id, label: s.label.replace(/\.$/, "") })),
  { value: OTHER_SEGMENT, label: ui.form.otherSegment },
];
export const solutionOptions = [
  ...solutions.map((s) => ({ value: s.id, label: s.name })),
  { value: UNDECIDED_SOLUTION, label: ui.form.undecidedSolution },
];

/** Converte o id escolhido no rótulo legível (para o lead que chega à equipe). */
export const optionLabel = (options: Array<{ value: string; label: string }>, value: string) =>
  options.find((o) => o.value === value)?.label ?? "";

/* ---------- Lead ---------- */

export const leadFields = [
  "name",
  "company",
  "document",
  "email",
  "whatsapp",
  "segment",
  "revenue",
  "solution",
] as const;
export type LeadField = (typeof leadFields)[number];
export type Lead = Record<LeadField, string>;
export type LeadErrors = Partial<Record<LeadField, string>>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const messages = ui.form.errors;

export function validateLead(lead: Lead): LeadErrors {
  const errors: LeadErrors = {};
  if (lead.name.trim().split(/\s+/).length < 2) errors.name = messages.name;
  if (lead.company.trim().length < 2) errors.company = messages.company;
  if (!isValidDocument(lead.document)) errors.document = messages.document;
  if (!emailPattern.test(lead.email.trim())) errors.email = messages.email;
  const phone = onlyDigits(lead.whatsapp);
  if (phone.length < 10 || phone.length > 11) errors.whatsapp = messages.whatsapp;
  if (!optionLabel(segmentOptions, lead.segment)) errors.segment = messages.segment;
  if (!onlyDigits(lead.revenue)) errors.revenue = messages.revenue;
  if (!optionLabel(solutionOptions, lead.solution)) errors.solution = messages.solution;
  return errors;
}
