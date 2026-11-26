import "server-only";
import type { Lead } from "./validation";

/**
 * Adaptador de entrega de leads comerciais.
 *
 * TODO (integração): definir o destino oficial — CRM, e-mail transacional
 * ou webhook — e implementar aqui. Variáveis sugeridas:
 *   LEADS_WEBHOOK_URL  — endpoint que recebe o JSON do lead
 *   LEADS_WEBHOOK_TOKEN — token de autenticação, se houver
 *
 * Enquanto não houver destino configurado, o lead é apenas registrado no
 * log do servidor (sem persistência).
 */
export async function deliverLead(lead: Lead): Promise<{ ok: boolean }> {
  const url = process.env.LEADS_WEBHOOK_URL;

  if (!url) {
    console.info("[leads] destino não configurado; lead recebido:", {
      ...lead,
      document: "***",
    });
    return { ok: true };
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
  return { ok: res.ok };
}
