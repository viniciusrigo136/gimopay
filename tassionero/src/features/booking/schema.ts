import { z } from "zod";
import { isPlausibleBrPhone } from "@/lib/phone";

/** Validação no cliente (UX). O banco valida tudo de novo em create_public_appointment. */
export const contactSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome.").max(80, "Use até 80 caracteres."),
  phone: z.string().refine(isPlausibleBrPhone, "Informe um WhatsApp válido com DDD."),
  notes: z.string().trim().max(500, "Use até 500 caracteres."),
  payment_method: z.enum(["pix", "cash"], { message: "Escolha a forma de pagamento." }),
  website: z.string().max(0),
});
export type ContactValues = z.infer<typeof contactSchema>;

export const vehicleSchema = z.object({
  vehicle_category_id: z.string().uuid("Escolha a categoria do veículo."),
  vehicle_model: z.string().trim().min(2, "Informe marca e modelo.").max(80, "Use até 80 caracteres."),
});
