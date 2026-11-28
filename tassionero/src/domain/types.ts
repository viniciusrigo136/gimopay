import type { Database, Tables } from "@/integrations/supabase/types";

type Enums = Database["public"]["Enums"];

export type AppointmentStatus = Enums["appointment_status"];
export type PaymentStatus = Enums["payment_status"];
export type BookingPaymentMethod = Enums["booking_payment_method"];
export type MoneyMethod = Enums["money_method"];
export type PricingMode = Enums["pricing_mode"];
export type BookingMode = Enums["booking_mode"];
export type TransactionType = Enums["transaction_type"];
export type TransactionStatus = Enums["transaction_status"];
export type PixKeyType = Enums["pix_key_type"];

export type Service = Tables<"services">;
export type ServicePrice = Tables<"service_category_prices">;
export type VehicleCategory = Tables<"vehicle_categories">;
export type BusinessHours = Tables<"business_hours">;
export type BusinessSettings = Tables<"business_settings">;
export type Customer = Tables<"customers">;
export type Vehicle = Tables<"vehicles">;
export type Appointment = Tables<"appointments">;
export type AppointmentItem = Tables<"appointment_items">;
export type AppointmentHistory = Tables<"appointment_history">;
export type BlockedPeriod = Tables<"blocked_periods">;
export type Transaction = Tables<"transactions">;
export type GalleryItem = Tables<"gallery_items">;

export type ServiceWithPrices = Service & { service_category_prices: ServicePrice[] };

/** Retorno de get_public_business_info(). */
export type PublicBusinessInfo = {
  business_name: string;
  tagline: string;
  public_description: string;
  whatsapp_phone: string;
  address: string;
  city: string;
  map_url: string;
  instagram_url: string;
  facebook_url: string;
  tiktok_url: string;
  payment_instructions: string;
  booking_policy: string;
  timezone: string;
  slot_interval_minutes: number;
  min_advance_minutes: number;
  max_advance_days: number;
  today: string;
  hours: { weekday: number; is_open: boolean; opens_at: string | null; closes_at: string | null }[];
};

/** Retorno de quote_services(). */
export type ServiceQuote = {
  duration_minutes: number;
  reference_total: number | null;
  has_quote_items: boolean;
  is_estimate: boolean;
  items: { service_id: string; name: string; duration_minutes: number; pricing_mode: PricingMode; reference_price: number | null }[];
};

/** Retorno de get_public_appointment(). */
export type PublicAppointment = {
  public_code: string;
  status: AppointmentStatus;
  starts_at: string;
  ends_at: string;
  duration_minutes: number;
  customer_first_name: string;
  vehicle: string;
  payment_method: BookingPaymentMethod;
  reference_total: number | null;
  final_total: number | null;
  is_estimate: boolean;
  items: { name: string; duration_minutes: number; reference_price: number | null }[];
  whatsapp_phone: string;
  payment_instructions: string;
  pix: { key: string; key_type: PixKeyType | null; holder_name: string } | null;
};

/** Retorno de owner_dashboard(). */
export type DashboardData = {
  period: { from: string; to: string };
  today_count: number;
  pending_count: number;
  pending_stale_count: number;
  completed_count: number;
  appointments_count: number;
  income_paid: number;
  expenses_paid: number;
  expenses_due: number;
  receivable: number;
  expected_in_period: number;
  monthly: { month: string; income: number; expense: number }[];
  top_services: { name: string; count: number }[];
  by_week: { week: string; count: number }[];
};

export type FinanceReport = {
  income_by_service: { name: string; amount: number }[];
  income_manual: number;
  expenses_by_category: { category: string; amount: number }[];
  by_method: { method: string; amount: number }[];
};
