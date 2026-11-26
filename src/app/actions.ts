"use server";

import { deliverLead } from "@/lib/leads";
import {
  leadFields,
  optionLabel,
  segmentOptions,
  solutionOptions,
  validateLead,
  type Lead,
  type LeadErrors,
} from "@/lib/validation";

export type LeadState =
  | { status: "idle" }
  | { status: "invalid"; errors: LeadErrors }
  | { status: "unavailable" }
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
    // A equipe recebe os rótulos legíveis, não os ids internos.
    const result = await deliverLead({
      ...lead,
      segment: optionLabel(segmentOptions, lead.segment),
      solution: optionLabel(solutionOptions, lead.solution),
    });
    if (result === "delivered") return { status: "success" };
    if (result === "not_configured") return { status: "unavailable" };
    return { status: "error" };
  } catch {
    return { status: "error" };
  }
}
