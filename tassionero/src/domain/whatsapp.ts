import { fmtDateLong, fmtDuration, fmtTime } from "@/lib/datetime";
import { fmtMoney } from "@/lib/money";
import { waDigits } from "@/lib/phone";

/** Link wa.me com mensagem pré-preenchida. O envio é sempre feito por uma pessoa. */
export function waLink(phoneE164: string, message: string): string | null {
  if (!phoneE164) return null;
  return `https://wa.me/${waDigits(phoneE164)}?text=${encodeURIComponent(message)}`;
}

export function msgGeneralContact(): string {
  return "Olá, Tassionero! Vim pelo site e gostaria de mais informações.";
}

export function msgCheckAvailability(serviceName: string, categoryName?: string, preferredDate?: string): string {
  const lines = [`Olá, Tassionero! Quero conferir a disponibilidade para *${serviceName}*.`];
  if (categoryName) lines.push(`Veículo: ${categoryName}`);
  if (preferredDate) lines.push(`Data de preferência: ${preferredDate}`);
  return lines.join("\n");
}

export function msgSendPixReceipt(code: string): string {
  return `Olá, Tassionero! Segue o comprovante do Pix da solicitação *${code}*.`;
}

export function msgCancelRequest(code: string): string {
  return `Olá, Tassionero! Preciso cancelar/remarcar a solicitação *${code}*.`;
}

export type ConfirmationMessageInput = {
  customerName: string;
  services: string[];
  vehicle: string;
  startsAt: string;
  durationMinutes: number;
  finalTotal: number | null;
  referenceTotal: number | null;
  paymentMethod: "pix" | "cash";
  pix?: { key: string; holderName: string } | null;
  code: string;
};

/** Mensagem de confirmação enviada pelo proprietário (SPEC §7.4). */
export function msgOwnerConfirmation(i: ConfirmationMessageInput): string {
  const first = i.customerName.split(" ")[0] ?? i.customerName;
  const value = i.finalTotal ?? i.referenceTotal;
  const lines = [
    `Olá, ${first}! Aqui é da *Tassionero Estética Automotiva*. Seu agendamento está confirmado ✅`,
    "",
    `*Serviço:* ${i.services.join(", ")}`,
    `*Veículo:* ${i.vehicle}`,
    `*Data:* ${fmtDateLong(i.startsAt)}`,
    `*Horário:* ${fmtTime(i.startsAt)}`,
    `*Duração prevista:* ${fmtDuration(i.durationMinutes)}`,
    `*Valor:* ${value !== null ? fmtMoney(value) : "a combinar após avaliação"}`,
    "",
  ];
  if (i.paymentMethod === "pix") {
    lines.push("*Pagamento:* Pix");
    if (i.pix?.key) {
      lines.push(`Chave Pix: ${i.pix.key}`);
      if (i.pix.holderName) lines.push(`Titular: ${i.pix.holderName}`);
    }
    lines.push("Depois de pagar, é só enviar o comprovante por aqui.");
  } else {
    lines.push("*Pagamento:* dinheiro, na entrega do veículo.");
  }
  lines.push("", `Código: ${i.code}`, "Qualquer imprevisto, é só avisar por aqui. Até lá!");
  return lines.join("\n");
}
