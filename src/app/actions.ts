"use server";

import { deliverLead } from "@/lib/leads";
import { leadFields, validateLead, type Lead, type LeadErrors } from "@/lib/validation";

export type LeadState =
  | { status: "idle" }
  | { status: "invalid"; errors: LeadErrors }
  | { status: "error" }
  | { status: "success" };

export async function submitLead(_prev: LeadState, formData: FormData): Promise<LeadState> {
  // Campo-armadilha contra bots: humanos não o preenchem.
  if (formData.get("website")) return { status: "success" };

  const lead = Object.fromEntries(
    leadFields.map((f) => [f, String(formData.get(f) ?? "").slice(0, 200)]),
  ) as Lead;

  const errors = validateLead(lead);
  if (Object.keys(errors).length) return { status: "invalid", errors };

  try {
    const { ok } = await deliverLead(lead);
    return ok ? { status: "success" } : { status: "error" };
  } catch {
    return { status: "error" };
  }
}
