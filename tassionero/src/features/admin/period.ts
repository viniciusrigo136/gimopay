import { addMonths, format, startOfMonth, startOfWeek, startOfYear } from "date-fns";
import { addDaysLocal, localDate, todayLocal } from "@/lib/datetime";

export type PeriodKey = "month" | "last_month" | "30d" | "year";

export const PERIOD_OPTIONS: { value: PeriodKey; label: string }[] = [
  { value: "month", label: "Este mês" },
  { value: "last_month", label: "Mês passado" },
  { value: "30d", label: "Últimos 30 dias" },
  { value: "year", label: "Este ano" },
];

/** Intervalo [from, to) em datas locais. */
export function periodRange(key: PeriodKey): { from: string; to: string } {
  const today = todayLocal();
  const now = localDate(today);
  const d = (x: Date) => format(x, "yyyy-MM-dd");
  switch (key) {
    case "month":
      return { from: d(startOfMonth(now)), to: d(addMonths(startOfMonth(now), 1)) };
    case "last_month":
      return { from: d(addMonths(startOfMonth(now), -1)), to: d(startOfMonth(now)) };
    case "30d":
      return { from: addDaysLocal(today, -29), to: addDaysLocal(today, 1) };
    case "year":
      return { from: d(startOfYear(now)), to: d(addMonths(startOfYear(now), 12)) };
  }
}

/** Segunda-feira da semana de uma data local. */
export function weekStart(date: string): string {
  return format(startOfWeek(localDate(date), { weekStartsOn: 1 }), "yyyy-MM-dd");
}

/** Início do dia local como ISO UTC. */
export function dayStartIso(date: string): string {
  return new Date(localDate(date, "00:00").getTime()).toISOString();
}
