import { TZDate } from "@date-fns/tz";
import { addDays, format } from "date-fns";
import { ptBR } from "date-fns/locale";

/** Fuso do negócio. Toda exibição de data/hora usa este fuso, nunca o do navegador. */
export const BUSINESS_TZ = "America/Sao_Paulo";

export function inTz(date: Date | string | number): TZDate {
  return new TZDate(new Date(date).getTime(), BUSINESS_TZ);
}

/**
 * Data/hora LOCAL do negócio a partir de "YYYY-MM-DD" e "HH:mm".
 * (Não usar new TZDate("...T08:00") — a string seria lida como UTC.)
 */
export function localDate(isoDate: string, time = "12:00"): TZDate {
  const [y, m, d] = isoDate.split("-").map(Number) as [number, number, number];
  const [hh, mm] = time.split(":").map(Number) as [number, number];
  return new TZDate(y, m - 1, d, hh, mm, 0, BUSINESS_TZ);
}

/** Data local de hoje (YYYY-MM-DD) no fuso do negócio. */
export function todayLocal(): string {
  return format(inTz(Date.now()), "yyyy-MM-dd");
}

export function addDaysLocal(isoDate: string, days: number): string {
  return format(addDays(localDate(isoDate), days), "yyyy-MM-dd");
}

/** Dia da semana (0 = domingo) de uma data YYYY-MM-DD. */
export function weekdayOf(isoDate: string): number {
  return localDate(isoDate).getDay();
}

/** Converte data + hora locais ("2026-12-07", "08:40") para ISO UTC. */
export function localToIso(isoDate: string, time: string): string {
  return new Date(localDate(isoDate, time).getTime()).toISOString();
}

export function fmtTime(d: Date | string): string {
  return format(inTz(d), "HH:mm");
}

export function fmtDate(d: Date | string, pattern = "dd/MM/yyyy"): string {
  return format(inTz(d), pattern, { locale: ptBR });
}

export function fmtDateLong(d: Date | string): string {
  return format(inTz(d), "EEEE, d 'de' MMMM", { locale: ptBR });
}

export function fmtDateTime(d: Date | string): string {
  return format(inTz(d), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
}

/** Data local (YYYY-MM-DD) de um instante. */
export function localDateOf(d: Date | string): string {
  return format(inTz(d), "yyyy-MM-dd");
}

export function fmtDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h}h`;
  return `${h}h${String(m).padStart(2, "0")}`;
}

/** "há 3 h", "há 2 dias" — tempo desde um instante. */
export function fmtSince(d: Date | string, now: number = Date.now()): string {
  const minutes = Math.max(0, Math.round((now - new Date(d).getTime()) / 60000));
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return `há ${hours} h`;
  return `há ${Math.round(hours / 24)} dias`;
}

export const WEEKDAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"] as const;
export const WEEKDAYS_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"] as const;

/** Primeira letra maiúscula ("segunda-feira, 30 de novembro" -> "Segunda-feira, 30 de novembro"). */
export function capFirst(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
