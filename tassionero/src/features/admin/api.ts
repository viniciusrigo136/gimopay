import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import type {
  Appointment,
  AppointmentHistory,
  AppointmentItem,
  AppointmentStatus,
  BlockedPeriod,
  BusinessHours,
  BusinessSettings,
  Customer,
  DashboardData,
  FinanceReport,
  GalleryItem,
  MoneyMethod,
  ServiceWithPrices,
  Transaction,
  Vehicle,
  VehicleCategory,
} from "@/domain/types";

/**
 * Falha com o erro do Supabase (o texto contém o código de negócio levantado pelo banco).
 * Escritas sem retorno devolvem null; nesses casos o resultado não é usado.
 */
function unwrap<T>(res: { data: T; error: unknown }): NonNullable<T> {
  if (res.error) throw res.error;
  return res.data as NonNullable<T>;
}

export const adminKeys = {
  all: ["admin"] as const,
  dashboard: (from: string, to: string) => ["admin", "dashboard", from, to] as const,
  appointments: (filters: AppointmentFilters) => ["admin", "appointments", filters] as const,
  appointment: (id: string) => ["admin", "appointment", id] as const,
  range: (from: string, to: string) => ["admin", "range", from, to] as const,
  pending: ["admin", "pending"] as const,
  customers: (q: string) => ["admin", "customers", q] as const,
  customer: (id: string) => ["admin", "customer", id] as const,
  vehicles: (q: string) => ["admin", "vehicles", q] as const,
  services: ["admin", "services"] as const,
  categories: ["admin", "categories"] as const,
  transactions: (f: TransactionFilters) => ["admin", "transactions", f] as const,
  finance: (from: string, to: string) => ["admin", "finance", from, to] as const,
  gallery: ["admin", "gallery"] as const,
  settings: ["admin", "settings"] as const,
  hours: ["admin", "hours"] as const,
};

/* ---------------------------------------------------------------- Agendamentos */
export type AppointmentRow = Appointment & {
  appointment_items: Pick<AppointmentItem, "id" | "service_name_snapshot" | "duration_minutes_snapshot">[];
};

export type AppointmentFilters = {
  status?: AppointmentStatus | "active" | "all";
  from?: string;
  to?: string;
  q?: string;
};

const ROW_SELECT = "*, appointment_items(id, service_name_snapshot, duration_minutes_snapshot)";

export function appointmentsQuery(filters: AppointmentFilters) {
  return queryOptions({
    queryKey: adminKeys.appointments(filters),
    queryFn: async (): Promise<AppointmentRow[]> => {
      let q = supabase.from("appointments").select(ROW_SELECT).order("starts_at", { ascending: filters.status === "pending" }).limit(300);
      if (filters.status === "active") q = q.in("status", ["pending", "confirmed", "in_progress"]);
      else if (filters.status && filters.status !== "all") q = q.eq("status", filters.status);
      if (filters.from) q = q.gte("starts_at", filters.from);
      if (filters.to) q = q.lt("starts_at", filters.to);
      if (filters.q) {
        const term = filters.q.replace(/[%,()]/g, " ").trim();
        if (term) q = q.or(`customer_name_snapshot.ilike.%${term}%,public_code.ilike.%${term}%,vehicle_snapshot.ilike.%${term}%,customer_phone_snapshot.ilike.%${term.replace(/\D/g, "") || term}%`);
      }
      return unwrap(await q) as AppointmentRow[];
    },
  });
}

/** Agendamentos (exceto recusados/cancelados) e bloqueios num intervalo — para a agenda. */
export function rangeQuery(fromIso: string, toIso: string) {
  return queryOptions({
    queryKey: adminKeys.range(fromIso, toIso),
    queryFn: async () => {
      const [appts, blocks] = await Promise.all([
        supabase.from("appointments").select(ROW_SELECT).lt("starts_at", toIso).gt("ends_at", fromIso).order("starts_at"),
        supabase.from("blocked_periods").select("*").lt("starts_at", toIso).gt("ends_at", fromIso).order("starts_at"),
      ]);
      return { appointments: unwrap(appts) as AppointmentRow[], blocks: unwrap(blocks) as BlockedPeriod[] };
    },
  });
}

export const pendingQuery = queryOptions({
  queryKey: adminKeys.pending,
  queryFn: async (): Promise<AppointmentRow[]> =>
    unwrap(await supabase.from("appointments").select(ROW_SELECT).eq("status", "pending").order("created_at")) as AppointmentRow[],
});

export type AppointmentDetail = Appointment & {
  appointment_items: AppointmentItem[];
  appointment_history: AppointmentHistory[];
  customers: Customer | null;
  vehicles: (Vehicle & { vehicle_categories: Pick<VehicleCategory, "name"> | null }) | null;
  transactions: Transaction[];
};

export function appointmentQuery(id: string) {
  return queryOptions({
    queryKey: adminKeys.appointment(id),
    queryFn: async (): Promise<AppointmentDetail> =>
      unwrap(
        await supabase
          .from("appointments")
          .select("*, appointment_items(*), appointment_history(*), customers(*), vehicles(*, vehicle_categories(name)), transactions(*)")
          .eq("id", id)
          .order("position", { referencedTable: "appointment_items" })
          .order("created_at", { referencedTable: "appointment_history", ascending: false })
          .single(),
      ) as AppointmentDetail,
  });
}

export const ownerOps = {
  setStatus: async (id: string, status: AppointmentStatus, note = "") =>
    unwrap(await supabase.rpc("owner_update_appointment_status", { p_appointment_id: id, p_status: status, p_note: note })),
  reschedule: async (id: string, startsAt: string, allowOutsideHours = false, note = "") =>
    unwrap(await supabase.rpc("owner_reschedule_appointment", { p_appointment_id: id, p_new_start: startsAt, p_allow_outside_hours: allowOutsideHours, p_note: note })),
  setFinalPrice: async (id: string, total: number | null, note = "") =>
    unwrap(await supabase.rpc("owner_update_final_price", { p_appointment_id: id, p_final_total: total as number, p_note: note })),
  registerPayment: async (id: string, amount: number, method: MoneyMethod, paidAt: string, notes = "") =>
    unwrap(await supabase.rpc("owner_register_payment", { p_appointment_id: id, p_amount: amount, p_method: method, p_paid_at: paidAt, p_notes: notes })),
  registerRefund: async (id: string, amount: number, method: MoneyMethod, paidAt: string, notes = "") =>
    unwrap(await supabase.rpc("owner_register_refund", { p_appointment_id: id, p_amount: amount, p_method: method, p_paid_at: paidAt, p_notes: notes })),
  updateNotes: async (id: string, internal_notes: string) =>
    unwrap(await supabase.from("appointments").update({ internal_notes }).eq("id", id)),
  availableSlots: async (date: string, duration: number, ignore?: string) =>
    unwrap(await supabase.rpc("owner_available_slots", { p_date: date, p_duration_minutes: duration, p_ignore_appointment: ignore as string })) as string[],
  createAppointment: async (payload: Record<string, unknown>) => unwrap(await supabase.rpc("owner_create_appointment", { p: payload as never })),
  blockConflicts: async (start: string, end: string) => unwrap(await supabase.rpc("owner_block_conflicts", { p_start: start, p_end: end })),
  createBlock: async (start: string, end: string, reason: string, resolutions: { appointment_id: string; action: "cancel" | "reschedule"; new_start?: string }[]) =>
    unwrap(await supabase.rpc("owner_create_block", { p_start: start, p_end: end, p_reason: reason, p_resolutions: resolutions as never })),
  deleteBlock: async (id: string) => unwrap(await supabase.from("blocked_periods").delete().eq("id", id)),
};

/* ---------------------------------------------------------------- Dashboard e relatórios */
export function dashboardQuery(from: string, to: string) {
  return queryOptions({
    queryKey: adminKeys.dashboard(from, to),
    queryFn: async (): Promise<DashboardData> => unwrap(await supabase.rpc("owner_dashboard", { p_from: from, p_to: to })) as unknown as DashboardData,
  });
}

export function financeReportQuery(from: string, to: string) {
  return queryOptions({
    queryKey: adminKeys.finance(from, to),
    queryFn: async (): Promise<FinanceReport> => unwrap(await supabase.rpc("owner_finance_report", { p_from: from, p_to: to })) as unknown as FinanceReport,
  });
}

/* ---------------------------------------------------------------- Clientes e veículos */
export type CustomerRow = Customer & { vehicles: Pick<Vehicle, "id">[]; appointments: Pick<Appointment, "id">[] };

export function customersQuery(q: string) {
  return queryOptions({
    queryKey: adminKeys.customers(q),
    queryFn: async (): Promise<CustomerRow[]> => {
      let query = supabase.from("customers").select("*, vehicles(id), appointments(id)").order("created_at", { ascending: false }).limit(200);
      const term = q.replace(/[%,()]/g, " ").trim();
      if (term) {
        const digits = term.replace(/\D/g, "");
        query = query.or(digits.length >= 3 ? `name.ilike.%${term}%,phone.ilike.%${digits}%` : `name.ilike.%${term}%`);
      }
      return unwrap(await query) as CustomerRow[];
    },
  });
}

export type CustomerDetail = Customer & {
  vehicles: (Vehicle & { vehicle_categories: Pick<VehicleCategory, "name"> | null })[];
  appointments: AppointmentRow[];
};

export function customerQuery(id: string) {
  return queryOptions({
    queryKey: adminKeys.customer(id),
    queryFn: async () => {
      const customer = unwrap(
        await supabase
          .from("customers")
          .select(`*, vehicles(*, vehicle_categories(name)), appointments(${ROW_SELECT})`)
          .eq("id", id)
          .order("starts_at", { referencedTable: "appointments", ascending: false })
          .single(),
      ) as CustomerDetail;
      const ids = customer.appointments.map((a) => a.id);
      let paid = 0;
      if (ids.length) {
        const tx = unwrap(await supabase.from("transactions").select("type, amount").in("appointment_id", ids).eq("status", "paid"));
        paid = tx.reduce((s, t) => s + (t.type === "income" ? Number(t.amount) : t.type === "refund" ? -Number(t.amount) : 0), 0);
      }
      return { customer, paid };
    },
  });
}

export type VehicleRow = Vehicle & { customers: Pick<Customer, "id" | "name" | "phone"> | null; vehicle_categories: Pick<VehicleCategory, "name"> | null };

export function vehiclesQuery(q: string) {
  return queryOptions({
    queryKey: adminKeys.vehicles(q),
    queryFn: async (): Promise<VehicleRow[]> => {
      let query = supabase.from("vehicles").select("*, customers(id, name, phone), vehicle_categories(name)").order("created_at", { ascending: false }).limit(200);
      const term = q.replace(/[%,()]/g, " ").trim();
      if (term) query = query.or(`model.ilike.%${term}%,make.ilike.%${term}%,color.ilike.%${term}%`);
      return unwrap(await query) as VehicleRow[];
    },
  });
}

export const customerOps = {
  update: async (id: string, patch: TablesUpdate<"customers">) => unwrap(await supabase.from("customers").update(patch).eq("id", id)),
  create: async (row: TablesInsert<"customers">) => unwrap(await supabase.from("customers").insert(row).select().single()),
  updateVehicle: async (id: string, patch: TablesUpdate<"vehicles">) => unwrap(await supabase.from("vehicles").update(patch).eq("id", id)),
  createVehicle: async (row: TablesInsert<"vehicles">) => unwrap(await supabase.from("vehicles").insert(row).select().single()),
};

/* ---------------------------------------------------------------- Catálogo */
export const adminServicesQuery = queryOptions({
  queryKey: adminKeys.services,
  queryFn: async (): Promise<ServiceWithPrices[]> =>
    unwrap(await supabase.from("services").select("*, service_category_prices(*)").order("sort_order").order("name")) as ServiceWithPrices[],
});

export const adminCategoriesQuery = queryOptions({
  queryKey: adminKeys.categories,
  queryFn: async (): Promise<VehicleCategory[]> => unwrap(await supabase.from("vehicle_categories").select("*").order("sort_order")),
});

export const catalogOps = {
  saveService: async (id: string | null, row: TablesInsert<"services">, prices: { vehicle_category_id: string; price: number | null }[]) => {
    const saved = id
      ? unwrap(await supabase.from("services").update(row).eq("id", id).select().single())
      : unwrap(await supabase.from("services").insert(row).select().single());
    const keep = prices.filter((p) => p.price !== null) as { vehicle_category_id: string; price: number }[];
    const drop = prices.filter((p) => p.price === null).map((p) => p.vehicle_category_id);
    if (keep.length) {
      unwrap(
        await supabase
          .from("service_category_prices")
          .upsert(keep.map((p) => ({ service_id: saved.id, vehicle_category_id: p.vehicle_category_id, price: p.price })), { onConflict: "service_id,vehicle_category_id" }),
      );
    }
    if (drop.length) unwrap(await supabase.from("service_category_prices").delete().eq("service_id", saved.id).in("vehicle_category_id", drop));
    return saved;
  },
  toggleService: async (id: string, patch: TablesUpdate<"services">) => unwrap(await supabase.from("services").update(patch).eq("id", id)),
  saveCategory: async (id: string | null, row: TablesInsert<"vehicle_categories">) =>
    id ? unwrap(await supabase.from("vehicle_categories").update(row).eq("id", id)) : unwrap(await supabase.from("vehicle_categories").insert(row)),
};

/* ---------------------------------------------------------------- Financeiro */
export type TransactionFilters = { from: string; to: string; type: "all" | "income" | "expense" | "refund"; method: "all" | MoneyMethod; status: "all" | "paid" | "pending" | "cancelled" };

export function transactionsQuery(f: TransactionFilters) {
  return queryOptions({
    queryKey: adminKeys.transactions(f),
    queryFn: async (): Promise<(Transaction & { appointments: Pick<Appointment, "id" | "public_code"> | null })[]> => {
      // Pagos filtram pela data de pagamento; pendentes, pelo vencimento.
      let q = supabase.from("transactions").select("*, appointments(id, public_code)").order("paid_at", { ascending: false, nullsFirst: true }).limit(500);
      if (f.type !== "all") q = q.eq("type", f.type);
      if (f.method !== "all") q = q.eq("payment_method", f.method);
      if (f.status !== "all") q = q.eq("status", f.status);
      q = q.or(`and(paid_at.gte.${f.from},paid_at.lt.${f.to}),and(paid_at.is.null,due_date.gte.${f.from.slice(0, 10)},due_date.lt.${f.to.slice(0, 10)}),and(paid_at.is.null,due_date.is.null)`);
      return unwrap(await q) as (Transaction & { appointments: Pick<Appointment, "id" | "public_code"> | null })[];
    },
  });
}

export const financeOps = {
  save: async (id: string | null, row: TablesInsert<"transactions">) =>
    id ? unwrap(await supabase.from("transactions").update(row).eq("id", id)) : unwrap(await supabase.from("transactions").insert(row)),
  remove: async (id: string) => unwrap(await supabase.from("transactions").delete().eq("id", id)),
};

/* ---------------------------------------------------------------- Galeria */
export const adminGalleryQuery = queryOptions({
  queryKey: adminKeys.gallery,
  queryFn: async (): Promise<GalleryItem[]> => unwrap(await supabase.from("gallery_items").select("*").order("sort_order").order("created_at", { ascending: false })),
});

export const galleryOps = {
  upload: async (file: File, folder: string) => {
    const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
    const path = `${folder}/${crypto.randomUUID()}.${ext}`;
    unwrap(await supabase.storage.from("media").upload(path, file, { cacheControl: "31536000", contentType: file.type, upsert: false }));
    return path;
  },
  save: async (id: string | null, row: TablesInsert<"gallery_items">) =>
    id ? unwrap(await supabase.from("gallery_items").update(row).eq("id", id)) : unwrap(await supabase.from("gallery_items").insert(row)),
  remove: async (item: GalleryItem) => {
    unwrap(await supabase.from("gallery_items").delete().eq("id", item.id));
    const paths = [item.image_path, item.before_image_path, item.after_image_path].filter((p): p is string => !!p && !p.startsWith("/"));
    if (paths.length) await supabase.storage.from("media").remove(paths);
  },
};

/* ---------------------------------------------------------------- Configurações */
export const settingsQuery = queryOptions({
  queryKey: adminKeys.settings,
  queryFn: async (): Promise<BusinessSettings> => unwrap(await supabase.from("business_settings").select("*").single()),
});

export const hoursQuery = queryOptions({
  queryKey: adminKeys.hours,
  queryFn: async (): Promise<BusinessHours[]> => unwrap(await supabase.from("business_hours").select("*").order("weekday")),
});

export const settingsOps = {
  save: async (patch: TablesUpdate<"business_settings">) => unwrap(await supabase.from("business_settings").update(patch).eq("id", true)),
  saveHours: async (rows: BusinessHours[]) => unwrap(await supabase.from("business_hours").upsert(rows, { onConflict: "weekday" })),
};
