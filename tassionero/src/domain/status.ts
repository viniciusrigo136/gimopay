import type { AppointmentStatus, BookingPaymentMethod, MoneyMethod, PaymentStatus, PricingMode } from "./types";

export const STATUS_LABEL: Record<AppointmentStatus, string> = {
  pending: "Pendente",
  confirmed: "Confirmado",
  in_progress: "Em andamento",
  completed: "Concluído",
  rejected: "Recusado",
  cancelled: "Cancelado",
};

/** Classe de cor por status (tokens st-*). */
export const STATUS_TONE: Record<AppointmentStatus, { dot: string; chip: string; block: string }> = {
  pending: { dot: "bg-st-pending", chip: "bg-st-pending/15 text-st-pending ring-st-pending/30", block: "bg-st-pending/20 border-st-pending text-pearl" },
  confirmed: { dot: "bg-st-confirmed", chip: "bg-st-confirmed/15 text-st-confirmed ring-st-confirmed/30", block: "bg-st-confirmed/20 border-st-confirmed text-pearl" },
  in_progress: { dot: "bg-st-progress", chip: "bg-st-progress/15 text-st-progress ring-st-progress/30", block: "bg-st-progress/25 border-st-progress text-pearl" },
  completed: { dot: "bg-st-completed", chip: "bg-st-completed/15 text-st-completed ring-st-completed/30", block: "bg-st-completed/15 border-st-completed text-steel-200" },
  rejected: { dot: "bg-st-closed", chip: "bg-st-closed/15 text-steel-400 ring-st-closed/30 line-through", block: "bg-graphite-700 border-st-closed text-steel-500 line-through" },
  cancelled: { dot: "bg-st-closed", chip: "bg-st-closed/15 text-steel-400 ring-st-closed/30 line-through", block: "bg-graphite-700 border-st-closed text-steel-500 line-through" },
};

export const ACTIVE_STATUSES: AppointmentStatus[] = ["pending", "confirmed", "in_progress"];

/**
 * Ações oferecidas na interface para cada status. É só uma dica de UI:
 * a validação de transição acontece em owner_update_appointment_status (banco).
 */
export const NEXT_ACTIONS: Record<AppointmentStatus, { to: AppointmentStatus; label: string; tone: "primary" | "neutral" | "danger" }[]> = {
  pending: [
    { to: "confirmed", label: "Confirmar", tone: "primary" },
    { to: "rejected", label: "Recusar", tone: "danger" },
    { to: "cancelled", label: "Cancelar", tone: "neutral" },
  ],
  confirmed: [
    { to: "in_progress", label: "Iniciar serviço", tone: "primary" },
    { to: "completed", label: "Concluir", tone: "neutral" },
    { to: "cancelled", label: "Cancelar", tone: "danger" },
  ],
  in_progress: [
    { to: "completed", label: "Concluir", tone: "primary" },
    { to: "cancelled", label: "Cancelar", tone: "danger" },
  ],
  completed: [],
  rejected: [],
  cancelled: [],
};

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  unpaid: "Não pago",
  partially_paid: "Pago parcialmente",
  paid: "Pago",
  refunded: "Estornado",
};

export const BOOKING_METHOD_LABEL: Record<BookingPaymentMethod, string> = { pix: "Pix", cash: "Dinheiro" };

export const MONEY_METHOD_LABEL: Record<MoneyMethod, string> = {
  pix: "Pix",
  cash: "Dinheiro",
  card: "Cartão",
  other: "Outro",
};

export const PRICING_MODE_LABEL: Record<PricingMode, string> = {
  fixed: "Preço fixo",
  vehicle_category: "Por categoria de veículo",
  quote: "Sob avaliação",
  mixed: "Referência + avaliação",
};
