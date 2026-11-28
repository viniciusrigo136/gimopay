/** Códigos de erro levantados pelas funções do banco -> mensagens para pessoas. */
const MESSAGES: Record<string, string> = {
  slot_unavailable: "Esse horário acabou de ser reservado ou não está mais disponível. Escolha outro horário.",
  too_many_pending: "Você já tem solicitações aguardando confirmação. Fale com a gente pelo WhatsApp para agendar mais.",
  rate_limited: "Muitas solicitações em pouco tempo. Tente novamente mais tarde ou chame no WhatsApp.",
  invalid_request: "Não foi possível enviar a solicitação. Revise os dados e tente de novo.",
  invalid_name: "Informe seu nome (de 2 a 80 caracteres).",
  invalid_phone: "Informe um WhatsApp válido com DDD, ex.: (49) 99999-9999.",
  invalid_vehicle_model: "Informe a marca e o modelo do veículo.",
  invalid_vehicle_category: "Escolha a categoria do veículo.",
  invalid_services: "Algum serviço escolhido não está disponível para agendamento online.",
  services_required: "Escolha pelo menos um serviço.",
  too_many_services: "Escolha no máximo 6 serviços por agendamento.",
  duplicate_services: "Há serviços repetidos na seleção.",
  notes_too_long: "A observação pode ter até 500 caracteres.",
  not_authorized: "Você não tem permissão para esta ação. Entre novamente.",
  not_found: "Registro não encontrado. Atualize a página.",
  invalid_transition: "Essa mudança de status não é permitida a partir do status atual.",
  invalid_amount: "Informe um valor válido.",
  invalid_range: "O horário final precisa ser depois do inicial.",
  block_conflicts: "Ainda há agendamentos ativos dentro do período. Resolva todos para criar o bloqueio.",
  refund_exceeds_paid: "O estorno não pode ser maior que o valor já recebido.",
};

export function errorMessage(error: unknown): string {
  const raw =
    error && typeof error === "object" && "message" in error ? String((error as { message: unknown }).message) : String(error ?? "");
  const code = Object.keys(MESSAGES).find((k) => raw === k || raw.includes(k));
  if (code) return MESSAGES[code] ?? raw;
  if (/fetch|network|Failed to fetch/i.test(raw)) return "Sem conexão com o servidor. Verifique a internet e tente de novo.";
  if (/JWT|session|not authenticated/i.test(raw)) return "Sua sessão expirou. Entre novamente.";
  return "Algo deu errado. Tente novamente em instantes.";
}
