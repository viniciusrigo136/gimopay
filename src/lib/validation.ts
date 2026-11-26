/** Validações e máscaras compartilhadas entre cliente e servidor. */

export const onlyDigits = (v: string) => v.replace(/\D/g, "");

export function maskDocument(value: string) {
  const d = onlyDigits(value).slice(0, 14);
  if (d.length <= 11) {
    return d
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }
  return d
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
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
  if (!d) return "";
  const n = Number(d) / 100;
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function isValidCpf(cpf: string) {
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
  const calc = (len: number) => {
    let sum = 0;
    for (let i = 0; i < len; i++) sum += Number(cpf[i]) * (len + 1 - i);
    const r = (sum * 10) % 11;
    return r === 10 ? 0 : r;
  };
  return calc(9) === Number(cpf[9]) && calc(10) === Number(cpf[10]);
}

function isValidCnpj(cnpj: string) {
  if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false;
  const calc = (len: number) => {
    const weights = len === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const sum = weights.reduce((acc, w, i) => acc + Number(cnpj[i]) * w, 0);
    const r = sum % 11;
    return r < 2 ? 0 : 11 - r;
  };
  return calc(12) === Number(cnpj[12]) && calc(13) === Number(cnpj[13]);
}

export const isValidDocument = (value: string) => {
  const d = onlyDigits(value);
  return d.length === 11 ? isValidCpf(d) : d.length === 14 ? isValidCnpj(d) : false;
};

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

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateLead(lead: Lead): LeadErrors {
  const e: LeadErrors = {};
  if (lead.name.trim().split(/\s+/).length < 2) e.name = "Informe nome e sobrenome.";
  if (lead.company.trim().length < 2) e.company = "Informe o nome da empresa.";
  if (!isValidDocument(lead.document)) e.document = "Informe um CPF ou CNPJ válido.";
  if (!emailRe.test(lead.email.trim())) e.email = "Informe um e-mail válido, como nome@empresa.com.br.";
  const phone = onlyDigits(lead.whatsapp);
  if (phone.length < 10 || phone.length > 11) e.whatsapp = "Informe o WhatsApp com DDD.";
  if (!lead.segment) e.segment = "Selecione o segmento de atuação.";
  if (!onlyDigits(lead.revenue)) e.revenue = "Informe o faturamento mensal estimado.";
  if (!lead.solution) e.solution = "Selecione a solução de interesse.";
  return e;
}
