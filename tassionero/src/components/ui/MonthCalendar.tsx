import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { addDaysLocal, WEEKDAYS_SHORT, weekdayOf } from "@/lib/datetime";
import { cn } from "@/lib/cn";

const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

type Props = {
  value: string | null;
  onChange: (date: string) => void;
  /** Primeira data visível/selecionável (YYYY-MM-DD). */
  min: string;
  max?: string;
  isDisabled?: (date: string) => boolean;
};

/** Calendário mensal acessível (grade de botões). Datas como YYYY-MM-DD no fuso do negócio. */
export function MonthCalendar({ value, onChange, min, max, isDisabled }: Props) {
  const [cursor, setCursor] = useState(() => (value ?? min).slice(0, 7));
  const [y, mth] = cursor.split("-").map(Number) as [number, number];

  const days = useMemo(() => {
    const first = `${cursor}-01`;
    const lead = weekdayOf(first);
    const daysInMonth = new Date(Date.UTC(y, mth, 0)).getUTCDate();
    const cells: (string | null)[] = Array.from({ length: lead }, () => null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(`${cursor}-${String(d).padStart(2, "0")}`);
    return cells;
  }, [cursor, y, mth]);

  const shift = (delta: number) => {
    const d = new Date(Date.UTC(y, mth - 1 + delta, 1));
    setCursor(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`);
  };
  const canPrev = cursor > min.slice(0, 7);
  const canNext = !max || cursor < max.slice(0, 7);
  const today = min;

  return (
    <div className="w-full max-w-sm">
      <div className="mb-3 flex items-center justify-between">
        <button type="button" onClick={() => shift(-1)} disabled={!canPrev} className="grid size-9 place-items-center rounded-full text-steel-300 hover:bg-white/5 disabled:opacity-30" aria-label="Mês anterior">
          <ChevronLeft className="size-5" />
        </button>
        <p className="font-bold" aria-live="polite">
          {MONTHS[mth - 1]} {y}
        </p>
        <button type="button" onClick={() => shift(1)} disabled={!canNext} className="grid size-9 place-items-center rounded-full text-steel-300 hover:bg-white/5 disabled:opacity-30" aria-label="Próximo mês">
          <ChevronRight className="size-5" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center" role="grid">
        {WEEKDAYS_SHORT.map((w) => (
          <span key={w} className="pb-1 text-xs font-medium text-steel-500" role="columnheader">
            {w}
          </span>
        ))}
        {days.map((d, i) => {
          if (!d) return <span key={`e${i}`} />;
          const disabled = d < min || (max ? d > max : false) || (isDisabled?.(d) ?? false);
          const selected = d === value;
          return (
            <button
              key={d}
              type="button"
              disabled={disabled}
              onClick={() => onChange(d)}
              aria-pressed={selected}
              aria-label={d.split("-").reverse().join("/")}
              className={cn(
                "relative aspect-square rounded-control text-sm font-semibold transition",
                selected ? "bg-racing-500 text-white shadow-cta" : "text-pearl hover:bg-white/[0.07]",
                disabled && "cursor-not-allowed text-steel-500/50 line-through decoration-steel-500/30 hover:bg-transparent",
              )}
            >
              {Number(d.slice(8))}
              {d === today && !selected ? <span className="absolute bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full bg-racing-400" aria-hidden /> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { addDaysLocal };
