import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { BookingPaymentMethod, PublicAppointment, ServiceQuote } from "@/domain/types";

export const bookingKeys = {
  quote: (ids: string[], cat: string) => ["booking", "quote", [...ids].sort().join(","), cat] as const,
  slots: (date: string, ids: string[], cat: string) => ["booking", "slots", date, [...ids].sort().join(","), cat] as const,
  appointment: (code: string) => ["booking", "appointment", code] as const,
};

export function quoteQuery(serviceIds: string[], categoryId: string) {
  return queryOptions({
    queryKey: bookingKeys.quote(serviceIds, categoryId),
    enabled: serviceIds.length > 0 && !!categoryId,
    queryFn: async (): Promise<ServiceQuote> => {
      const { data, error } = await supabase.rpc("quote_services", { p_service_ids: serviceIds, p_vehicle_category_id: categoryId });
      if (error) throw error;
      return data as unknown as ServiceQuote;
    },
  });
}

export function slotsQuery(date: string, serviceIds: string[], categoryId: string) {
  return queryOptions({
    queryKey: bookingKeys.slots(date, serviceIds, categoryId),
    enabled: !!date && serviceIds.length > 0 && !!categoryId,
    // A lista pode envelhecer: o servidor revalida na criação de qualquer forma.
    staleTime: 15_000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_available_slots", {
        p_date: date,
        p_service_ids: serviceIds,
        p_vehicle_category_id: categoryId,
      });
      if (error) throw error;
      return data;
    },
  });
}

export function publicAppointmentQuery(code: string) {
  return queryOptions({
    queryKey: bookingKeys.appointment(code),
    queryFn: async (): Promise<PublicAppointment | null> => {
      const { data, error } = await supabase.rpc("get_public_appointment", { p_code: code });
      if (error) throw error;
      return (data as unknown as PublicAppointment | null) ?? null;
    },
  });
}

export type CreateBookingInput = {
  name: string;
  phone: string;
  vehicle_category_id: string;
  vehicle_model: string;
  service_ids: string[];
  starts_at: string;
  payment_method: BookingPaymentMethod;
  notes: string;
  website: string;
};

export async function createBooking(input: CreateBookingInput): Promise<string> {
  const { data, error } = await supabase.rpc("create_public_appointment", { p: input });
  if (error) throw error;
  return (data as { public_code: string }).public_code;
}
