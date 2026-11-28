import { Link } from "@tanstack/react-router";
import { Ban } from "lucide-react";
import { STATUS_TONE } from "@/domain/status";
import type { BlockedPeriod } from "@/domain/types";
import { addDaysLocal, fmtTime, inTz, localDateOf, todayLocal, WEEKDAYS_SHORT, weekdayOf } from "@/lib/datetime";
import { cn } from "@/lib/cn";
import type { AppointmentRow } from "../api";

const START_H = 7;
const END_H = 19;
const HOUR_PX = 56;

function minutesOfDay(iso: string) {
  const d = inTz(iso);
  return d.getHours() * 60 + d.getMinutes();
}

/** Grade semanal (seg–dom) com blocos posicionados pelo horário local. */
export function WeekGrid({ weekStartDate, appointments, blocks, days = 7, onEmptyClick }: { weekStartDate: string; appointments: AppointmentRow[]; blocks: BlockedPeriod[]; days?: number; onEmptyClick?: (date: string, hour: number) => void }) {
  const dates = Array.from({ length: days }, (_, i) => addDaysLocal(weekStartDate, i));
  const today = todayLocal();
  const hours = Array.from({ length: END_H - START_H }, (_, i) => START_H + i);
  const height = (END_H - START_H) * HOUR_PX;

  const place = (startIso: string, endIso: string, date: string) => {
    const s = localDateOf(startIso) < date ? START_H * 60 : minutesOfDay(startIso);
    const e = localDateOf(endIso) > date ? END_H * 60 : minutesOfDay(endIso);
    const top = Math.max(0, ((s - START_H * 60) / 60) * HOUR_PX);
    const bottom = Math.min(height, ((e - START_H * 60) / 60) * HOUR_PX);
    return { top, height: Math.max(18, bottom - top) };
  };

  const overlapsDay = (startIso: string, endIso: string, date: string) => localDateOf(startIso) <= date && localDateOf(endIso) >= date && !(localDateOf(endIso) === date && minutesOfDay(endIso) === 0 && localDateOf(startIso) !== date);

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[760px]">
        <div className="grid border-b border-white/[0.06] pb-2" style={{ gridTemplateColumns: `3.25rem repeat(${days}, 1fr)` }}>
          <span />
          {dates.map((d) => (
            <div key={d} className="text-center">
              <p className={cn("text-xs", d === today ? "text-racing-300" : "text-steel-500")}>{WEEKDAYS_SHORT[weekdayOf(d)]}</p>
              <p className={cn("mx-auto mt-0.5 grid size-8 place-items-center rounded-full text-sm font-bold", d === today && "bg-racing-500 text-white")}>{Number(d.slice(8))}</p>
            </div>
          ))}
        </div>
        <div className="relative grid" style={{ gridTemplateColumns: `3.25rem repeat(${days}, 1fr)`, height }}>
          <div className="relative">
            {hours.map((h) => (
              <span key={h} className="absolute right-2 -translate-y-1/2 text-[11px] text-steel-500" style={{ top: (h - START_H) * HOUR_PX }}>
                {String(h).padStart(2, "0")}h
              </span>
            ))}
          </div>
          {dates.map((d) => (
            <div key={d} className={cn("relative border-l border-white/[0.06]", d === today && "bg-white/[0.02]")}>
              {hours.map((h) => (
                <button
                  key={h}
                  type="button"
                  tabIndex={onEmptyClick ? 0 : -1}
                  aria-label={onEmptyClick ? `Novo em ${d.split("-").reverse().join("/")} às ${h}h` : undefined}
                  onClick={() => onEmptyClick?.(d, h)}
                  className={cn("absolute inset-x-0 border-t border-white/[0.04]", onEmptyClick ? "hover:bg-white/[0.03]" : "cursor-default")}
                  style={{ top: (h - START_H) * HOUR_PX, height: HOUR_PX }}
                />
              ))}
              {blocks
                .filter((b) => overlapsDay(b.starts_at, b.ends_at, d))
                .map((b) => {
                  const p = place(b.starts_at, b.ends_at, d);
                  return (
                    <div
                      key={b.id}
                      className="absolute inset-x-1 overflow-hidden rounded-md bg-[repeating-linear-gradient(135deg,rgb(255_255_255/0.05)_0,rgb(255_255_255/0.05)_6px,transparent_6px,transparent_12px)] px-2 py-1 text-[11px] text-steel-400 ring-1 ring-white/10"
                      style={p}
                      title={`Bloqueado: ${b.reason || "sem motivo"}`}
                    >
                      <Ban className="mr-1 inline size-3" aria-hidden /> {b.reason || "Bloqueado"}
                    </div>
                  );
                })}
              {appointments
                .filter((a) => overlapsDay(a.starts_at, a.ends_at, d))
                .map((a) => {
                  const p = place(a.starts_at, a.ends_at, d);
                  return (
                    <Link
                      key={a.id}
                      to="/admin/agendamentos/$id"
                      params={{ id: a.id }}
                      className={cn("absolute inset-x-1 overflow-hidden rounded-md border-l-[3px] px-2 py-1 text-[11px] leading-tight transition hover:brightness-125", STATUS_TONE[a.status].block)}
                      style={p}
                    >
                      <span className="block font-bold">{fmtTime(a.starts_at)} {a.customer_name_snapshot.split(" ")[0]}</span>
                      {p.height > 34 ? <span className="block truncate opacity-80">{a.appointment_items.map((i) => i.service_name_snapshot).join(", ")}</span> : null}
                    </Link>
                  );
                })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
