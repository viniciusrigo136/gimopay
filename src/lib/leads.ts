import "server-only";
import type { Lead } from "./validation";

export type DeliveryResult = "delivered" | "not_configured" | "failed";

/**
 * Adaptador de entrega de leads comerciais.
 *
 * TODO (integração): definir o destino oficial — CRM, e-mail transacional
 * ou webhook — e implementar aqui. Variáveis sugeridas:
 *   LEADS_WEBHOOK_URL   — endpoint que recebe o JSON do lead
 *   LEADS_WEBHOOK_TOKEN — token de autenticação, se houver
 *
 * Sem destino configurado, o lead NÃO é armazenado e o formulário informa
 * ao visitante que o envio ainda não está disponível.
 */
export async function deliverLead(lead: Lead): Promise<DeliveryResult> {
  const url = process.env.LEADS_WEBHOOK_URL;

  if (!url) {
    // Sem dados pessoais no log: só o necessário para diagnóstico.
    console.warn("[leads] LEADS_WEBHOOK_URL não configurada; lead não entregue.", {
      segment: lead.segment,
      solution: lead.solution,
    });
    return "not_configured";
  }

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(process.env.LEADS_WEBHOOK_TOKEN
        ? { Authorization: `Bearer ${process.env.LEADS_WEBHOOK_TOKEN}` }
        : {}),
    },
    body: JSON.stringify({ ...lead, source: "site", createdAt: new Date().toISOString() }),
  });
  return res.ok ? "delivered" : "failed";
}
